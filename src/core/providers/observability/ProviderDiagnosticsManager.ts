/**
 * Provider Diagnostics Manager (Module 6F.10)
 *
 * On-demand diagnostic report generator. Reads point-in-time snapshots
 * from all existing subsystems via their public read APIs, evaluates
 * findings via ProviderDiagnosticEvaluator, and assembles complete
 * DiagnosticReport objects.
 *
 * This manager NEVER caches subsystem state. Every report is freshly
 * assembled from live data, ensuring accuracy and preventing stale
 * state accumulation.
 *
 * Dependency direction: DiagnosticsManager → existing managers (read-only).
 * Existing managers NEVER depend on DiagnosticsManager.
 */

import { IEventBus } from '../../events/IEventBus';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { ProviderReliabilityRecoveryManager } from '../recovery/ProviderReliabilityRecoveryManager';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { ProviderQuotaManager } from '../limits/ProviderQuotaManager';
import { ProviderRateLimitStateTracker } from '../limits/ProviderRateLimitStateTracker';
import {
  DiagnosticReport,
  ProviderDiagnosticEntry,
  DiagnosticFinding,
  DiagnosticsManagerStatus,
} from './ProviderDiagnosticTypes';
import { ProviderDiagnosticEvaluator } from './ProviderDiagnosticEvaluator';
import { ProviderTelemetryAggregator } from './ProviderTelemetryAggregator';
import { ProviderTelemetryCollector } from './ProviderTelemetryCollector';
import { ProviderTelemetryPolicy } from './ProviderTelemetryPolicy';

export class ProviderDiagnosticsManager {
  private totalReportsGenerated = 0;
  private lastReportTimestamp: number | null = null;
  private isActive = false;

  constructor(
    private readonly policy: ProviderTelemetryPolicy = new ProviderTelemetryPolicy(),
    private readonly collector?: ProviderTelemetryCollector,
    private readonly aggregator?: ProviderTelemetryAggregator,
    private readonly healthManager?: ProviderHealthManager,
    private readonly recoveryManager?: ProviderReliabilityRecoveryManager,
    private readonly cooldownManager?: ProviderCooldownManager,
    private readonly quotaManager?: ProviderQuotaManager,
    private readonly rateLimitTracker?: ProviderRateLimitStateTracker,
    private readonly eventBus?: IEventBus
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    this.isActive = true;
  }

  shutdown(): void {
    this.isActive = false;
  }

  destroy(): void {
    this.shutdown();
    this.totalReportsGenerated = 0;
    this.lastReportTimestamp = null;
  }

  // ─── Public API ─────────────────────────────────────────────────────

  /**
   * Generate a complete diagnostic report from live subsystem state.
   * This is the primary public method of the diagnostics manager.
   */
  generateReport(): DiagnosticReport {
    const now = Date.now();

    // 1. Discover all known provider IDs
    const providerIds = this.discoverProviderIds();

    // 2. Build diagnostic entry for each provider
    const entries: ProviderDiagnosticEntry[] = [];
    const allFindings: DiagnosticFinding[] = [];

    for (const providerId of providerIds) {
      const entry = this.buildProviderEntry(providerId);
      entries.push(entry);

      // 3. Evaluate findings per provider
      const providerFindings = ProviderDiagnosticEvaluator.evaluateProvider(entry, this.policy);
      allFindings.push(...providerFindings);
    }

    // 4. Build system summary
    const systemSummary = ProviderDiagnosticEvaluator.buildSystemSummary(entries);

    // 5. Assemble report
    const report: DiagnosticReport = {
      reportId: `report_${now}_${Math.random().toString(36).slice(2, 8)}`,
      generatedAt: now,
      systemSummary,
      providers: entries,
      findings: allFindings,
    };

    // 6. Track report generation
    this.totalReportsGenerated++;
    this.lastReportTimestamp = now;

    // 7. Emit report event
    this.emitEvent('provider.diagnostic_report_generated', {
      reportId: report.reportId,
      overallGrade: systemSummary.overallGrade,
      providerCount: entries.length,
      findingCount: allFindings.length,
      timestamp: now,
    });

    // 8. Emit individual critical/warning findings
    for (const finding of allFindings) {
      if (finding.severity === 'CRITICAL' || finding.severity === 'WARNING') {
        this.emitEvent('provider.diagnostic_finding_detected', {
          findingId: finding.id,
          severity: finding.severity,
          category: finding.category,
          providerId: finding.providerId,
          title: finding.title,
          timestamp: finding.timestamp,
        });
      }
    }

    return report;
  }

  /**
   * Generate a diagnostic entry for a single provider.
   */
  getProviderDiagnostics(providerId: string): ProviderDiagnosticEntry {
    return this.buildProviderEntry(providerId);
  }

  /**
   * Get manager operational status.
   */
  getStatus(): DiagnosticsManagerStatus {
    return {
      isActive: this.isActive,
      totalReportsGenerated: this.totalReportsGenerated,
      lastReportTimestamp: this.lastReportTimestamp,
    };
  }

  // ─── Internal: Provider Discovery ──────────────────────────────────

  private discoverProviderIds(): string[] {
    const ids = new Set<string>();

    // From health manager records
    if (this.healthManager) {
      // HealthManager doesn't expose a list method, so we check known subsystems
    }

    // From collector's tracked providers
    if (this.collector) {
      for (const id of this.collector.getTrackedProviders()) {
        ids.add(id);
      }
    }

    // From aggregator's tracked providers
    if (this.aggregator) {
      for (const id of this.aggregator.getTrackedProviders()) {
        ids.add(id);
      }
    }

    // From rate limit tracker
    if (this.rateLimitTracker) {
      for (const snapshot of this.rateLimitTracker.getAllProviderStates()) {
        ids.add(snapshot.providerId);
      }
    }

    // From quota manager
    if (this.quotaManager) {
      for (const state of this.quotaManager.getAllStates()) {
        ids.add(state.providerId);
      }
    }

    // From cooldown manager
    if (this.cooldownManager) {
      for (const state of this.cooldownManager.getActiveCooldowns()) {
        ids.add(state.providerId);
      }
    }

    return Array.from(ids).sort();
  }

  // ─── Internal: Provider Entry Builder ──────────────────────────────

  private buildProviderEntry(providerId: string): ProviderDiagnosticEntry {
    const now = Date.now();

    // Health data
    const healthState = this.healthManager
      ? (this.healthManager.getHealth(providerId) === 'HEALTHY' ? 'HEALTHY'
        : this.healthManager.getHealth(providerId) === 'DEGRADED' ? 'DEGRADED'
        : this.healthManager.getHealth(providerId) === 'UNHEALTHY' ? 'UNHEALTHY'
        : 'UNKNOWN')
      : 'UNKNOWN';

    const healthScore = this.healthManager
      ? this.healthManager.getHealthScore(providerId)
      : null;

    const metrics = this.healthManager
      ? this.healthManager.getMetrics(providerId)
      : null;

    // Circuit breaker data
    const circuitRecord = this.recoveryManager
      ? this.recoveryManager.getCircuitRecord(providerId)
      : null;

    // Cooldown data
    const isInCooldown = this.cooldownManager
      ? this.cooldownManager.isInCooldown(providerId)
      : false;

    const cooldownRemainingMs = this.cooldownManager
      ? this.cooldownManager.getRemainingCooldownMs(providerId)
      : 0;

    // Quota data
    const isQuotaExhausted = this.quotaManager
      ? this.quotaManager.isExhausted(providerId)
      : false;

    // Rate limit data
    const rateLimitState = this.rateLimitTracker
      ? this.rateLimitTracker.getProviderRateLimitState(providerId)
      : null;

    const isRateLimited = rateLimitState
      ? rateLimitState.limits.some(l => 'isExhausted' in l && (l as Record<string, unknown>).isExhausted === true)
      : false;

    // Telemetry aggregation
    const recentAggregation = this.aggregator
      ? this.aggregator.getLatestAggregation(providerId)
      : null;

    const entry: ProviderDiagnosticEntry = {
      providerId,
      timestamp: now,

      // Health
      healthState: healthState as ProviderDiagnosticEntry['healthState'],
      healthScore,
      reliabilitySuccessRate: metrics?.successRate ?? 0,
      averageLatencyMs: metrics?.averageLatencyMs ?? 0,
      p95LatencyMs: metrics?.p95LatencyMs ?? 0,
      consecutiveFailures: metrics?.consecutiveFailures ?? 0,
      consecutiveSuccesses: metrics?.consecutiveSuccesses ?? 0,

      // Circuit
      circuitState: circuitRecord?.state ?? 'CLOSED',
      circuitRollingFailureRate: circuitRecord?.rollingFailureRate ?? 0,
      circuitOpenUntil: circuitRecord?.openUntil,

      // Cooldown
      isInCooldown,
      cooldownRemainingMs,

      // Quota
      isQuotaExhausted,

      // Rate limit
      isRateLimited,

      // Admission
      lastAdmissionDecision: undefined,

      // Aggregation
      recentAggregation,

      // Findings (evaluated later by caller)
      findings: [],
    };

    return entry;
  }

  // ─── Internal: Event Emission ──────────────────────────────────────

  private emitEvent(topic: string, payload: Record<string, unknown>): void {
    if (!this.eventBus) return;
    try {
      this.eventBus.publish(topic as Parameters<IEventBus['publish']>[0], payload).catch(() => {});
    } catch {
      // Diagnostics must never crash the system
    }
  }
}
