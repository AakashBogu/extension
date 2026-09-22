/**
 * Provider Observability Manager (Module 6F.10)
 *
 * Top-level coordinator for the provider observability layer.
 * Owns the telemetry collector, aggregator, and diagnostics manager.
 * Provides a unified API for initialization, snapshot generation,
 * diagnostic report generation, and lifecycle management.
 *
 * This is the single entry point for wiring Module 6F.10 into the
 * existing provider system. It depends on existing managers via
 * constructor injection but existing managers NEVER depend on it.
 *
 * Architecture:
 *   EventBus events → TelemetryCollector → TelemetryAggregator
 *                                        ↘ TelemetrySnapshotBuilder
 *   Existing Manager APIs → DiagnosticsManager → DiagnosticEvaluator
 */

import { IEventBus } from '../../events/IEventBus';
import { ProviderHealthManager } from '../health/ProviderHealthManager';
import { ProviderReliabilityRecoveryManager } from '../recovery/ProviderReliabilityRecoveryManager';
import { ProviderCooldownManager } from '../limits/ProviderCooldownManager';
import { ProviderQuotaManager } from '../limits/ProviderQuotaManager';
import { ProviderRateLimitStateTracker } from '../limits/ProviderRateLimitStateTracker';
import { TelemetrySnapshot, TelemetryCollectorStatus, TelemetryAggregation } from './ProviderTelemetryTypes';
import { DiagnosticReport, DiagnosticsManagerStatus, ProviderDiagnosticEntry } from './ProviderDiagnosticTypes';
import { ProviderTelemetryPolicy, ProviderTelemetryPolicyConfig } from './ProviderTelemetryPolicy';
import { ProviderTelemetryCollector } from './ProviderTelemetryCollector';
import { ProviderTelemetryAggregator } from './ProviderTelemetryAggregator';
import { ProviderTelemetrySnapshotBuilder, ProviderLiveState } from './ProviderTelemetrySnapshotBuilder';
import { ProviderDiagnosticsManager } from './ProviderDiagnosticsManager';

// ─── Manager Status ──────────────────────────────────────────────────

export interface ObservabilityManagerStatus {
  readonly isActive: boolean;
  readonly collector: TelemetryCollectorStatus;
  readonly diagnostics: DiagnosticsManagerStatus;
}

// ─── Manager Class ───────────────────────────────────────────────────

export class ProviderObservabilityManager {
  public readonly policy: ProviderTelemetryPolicy;
  public readonly collector: ProviderTelemetryCollector;
  public readonly aggregator: ProviderTelemetryAggregator;
  public readonly diagnosticsManager: ProviderDiagnosticsManager;

  private isActive = false;

  constructor(
    policyConfig?: ProviderTelemetryPolicyConfig | ProviderTelemetryPolicy,
    private readonly healthManager?: ProviderHealthManager,
    private readonly recoveryManager?: ProviderReliabilityRecoveryManager,
    private readonly cooldownManager?: ProviderCooldownManager,
    private readonly quotaManager?: ProviderQuotaManager,
    private readonly rateLimitTracker?: ProviderRateLimitStateTracker,
    private readonly eventBus?: IEventBus
  ) {
    this.policy = policyConfig instanceof ProviderTelemetryPolicy
      ? policyConfig
      : new ProviderTelemetryPolicy(policyConfig);

    this.collector = new ProviderTelemetryCollector(this.policy, this.eventBus);
    this.aggregator = new ProviderTelemetryAggregator(this.policy);
    this.diagnosticsManager = new ProviderDiagnosticsManager(
      this.policy,
      this.collector,
      this.aggregator,
      this.healthManager,
      this.recoveryManager,
      this.cooldownManager,
      this.quotaManager,
      this.rateLimitTracker,
      this.eventBus
    );
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;

    await this.collector.initialize();
    await this.diagnosticsManager.initialize();

    this.emitEvent('provider.observability_initialized', {
      component: 'ObservabilityManager',
      timestamp: Date.now(),
    });
  }

  shutdown(): void {
    this.collector.shutdown();
    this.diagnosticsManager.shutdown();
    this.isActive = false;
  }

  destroy(): void {
    this.shutdown();
    this.collector.destroy();
    this.aggregator.destroy();
    this.diagnosticsManager.destroy();
  }

  // ─── Telemetry API ─────────────────────────────────────────────────

  /**
   * Generate a point-in-time telemetry snapshot.
   * Aggregates recent records and queries live state from all subsystems.
   */
  getTelemetrySnapshot(): TelemetrySnapshot {
    // 1. Trigger aggregation from collector's raw records
    const allRecords = this.collector.getAllRecords();
    this.aggregator.aggregateRecords(allRecords);

    // 2. Build aggregation map
    const providerIds = this.collector.getTrackedProviders();
    const aggregationMap = new Map<string, TelemetryAggregation | null>();
    for (const pid of providerIds) {
      aggregationMap.set(pid, this.aggregator.getLatestAggregation(pid));
    }

    // 3. Query live state from existing subsystems
    const liveStateMap = new Map<string, ProviderLiveState>();
    for (const pid of providerIds) {
      liveStateMap.set(pid, this.buildLiveState(pid));
    }

    // 4. Build and emit snapshot
    const snapshot = ProviderTelemetrySnapshotBuilder.buildSnapshot(aggregationMap, liveStateMap);

    this.emitEvent('provider.telemetry_snapshot_generated', {
      providerCount: snapshot.providers.length,
      totalRequestsInWindow: snapshot.systemSummary.totalRequestsInWindow,
      timestamp: snapshot.timestamp,
    });

    return snapshot;
  }

  /**
   * Get the latest aggregation for a specific provider.
   */
  getProviderAggregation(providerId: string): TelemetryAggregation | null {
    // Ensure aggregation is current
    const records = this.collector.getRecords(providerId);
    this.aggregator.aggregateRecords(records);
    return this.aggregator.getLatestAggregation(providerId);
  }

  // ─── Diagnostics API ───────────────────────────────────────────────

  /**
   * Generate a complete diagnostic report.
   * Shortcut for diagnosticsManager.generateReport().
   */
  generateDiagnosticReport(): DiagnosticReport {
    // Ensure aggregations are current before generating report
    const allRecords = this.collector.getAllRecords();
    this.aggregator.aggregateRecords(allRecords);

    return this.diagnosticsManager.generateReport();
  }

  /**
   * Get diagnostics for a single provider.
   */
  getProviderDiagnostics(providerId: string): ProviderDiagnosticEntry {
    // Ensure aggregation is current
    const records = this.collector.getRecords(providerId);
    this.aggregator.aggregateRecords(records);

    return this.diagnosticsManager.getProviderDiagnostics(providerId);
  }

  // ─── Status API ────────────────────────────────────────────────────

  /**
   * Get operational status of the observability subsystem.
   */
  getStatus(): ObservabilityManagerStatus {
    return {
      isActive: this.isActive,
      collector: this.collector.getStatus(),
      diagnostics: this.diagnosticsManager.getStatus(),
    };
  }

  // ─── Reset / Clear ─────────────────────────────────────────────────

  /**
   * Clear all telemetry data for a specific provider or all providers.
   */
  clear(providerId?: string): void {
    this.collector.clear(providerId);
    this.aggregator.clear(providerId);
  }

  /**
   * Reset all state to initial conditions.
   */
  reset(): void {
    this.collector.clear();
    this.aggregator.reset();
  }

  // ─── Internal: Live State ──────────────────────────────────────────

  private buildLiveState(providerId: string): ProviderLiveState {
    const healthState = this.healthManager
      ? this.healthManager.getHealth(providerId)
      : undefined;

    const healthScore = this.healthManager
      ? this.healthManager.getHealthScore(providerId)
      : undefined;

    const circuitState = this.recoveryManager
      ? this.recoveryManager.getCircuitState(providerId)
      : undefined;

    const isInCooldown = this.cooldownManager
      ? this.cooldownManager.isInCooldown(providerId)
      : undefined;

    const isQuotaExhausted = this.quotaManager
      ? this.quotaManager.isExhausted(providerId)
      : undefined;

    const rateLimitState = this.rateLimitTracker
      ? this.rateLimitTracker.getProviderRateLimitState(providerId)
      : null;
    const isRateLimited = rateLimitState
      ? rateLimitState.limits.some(l => 'isExhausted' in l && (l as Record<string, unknown>).isExhausted === true)
      : undefined;

    return {
      providerId,
      healthState: healthState as string | undefined,
      healthScore: healthScore?.healthScore,
      circuitState: circuitState as string | undefined,
      isInCooldown,
      isQuotaExhausted,
      isRateLimited,
    };
  }

  // ─── Internal: Event Emission ──────────────────────────────────────

  private emitEvent(topic: string, payload: Record<string, unknown>): void {
    if (!this.eventBus) return;
    try {
      this.eventBus.publish(topic as Parameters<IEventBus['publish']>[0], payload).catch(() => {});
    } catch {
      // Observability must never crash the system
    }
  }
}
