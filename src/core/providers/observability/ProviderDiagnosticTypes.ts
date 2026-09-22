/**
 * Provider Diagnostic Types (Module 6F.10)
 *
 * Type contracts for the provider diagnostics subsystem.
 * Diagnostic reports provide a comprehensive, point-in-time view of the
 * entire provider ecosystem for operational inspection.
 *
 * All types are strictly read-only. No sensitive data (prompts, queries,
 * credentials, response bodies) is included.
 */

import { ExtendedProviderHealthState, ProviderHealthScore } from '../health/ProviderHealthTypes';
import { CircuitState } from '../recovery/ProviderCircuitState';
import { AdmissionDecision } from '../limits/ProviderAdmissionTypes';
import { TelemetryAggregation } from './ProviderTelemetryTypes';

// ─── Diagnostic Severity ────────────────────────────────────────────

export type DiagnosticSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type DiagnosticCategory =
  | 'HEALTH'
  | 'RATE_LIMIT'
  | 'QUOTA'
  | 'COOLDOWN'
  | 'CIRCUIT'
  | 'ADMISSION'
  | 'ROUTING'
  | 'EXECUTION'
  | 'LATENCY'
  | 'RELIABILITY';

// ─── Diagnostic Finding ─────────────────────────────────────────────

/**
 * A single diagnostic finding representing an anomaly, warning, or
 * status observation about a specific provider or the system.
 */
export interface DiagnosticFinding {
  readonly id: string;
  readonly severity: DiagnosticSeverity;
  readonly category: DiagnosticCategory;
  readonly providerId?: string;
  readonly title: string;
  readonly description: string;
  readonly timestamp: number;
  readonly metadata?: Readonly<Record<string, number | string | boolean>>;
}

// ─── Provider Diagnostic Entry ──────────────────────────────────────

/**
 * Complete diagnostic view of a single provider.
 * Assembled from existing subsystem read APIs — no logic duplication.
 */
export interface ProviderDiagnosticEntry {
  readonly providerId: string;
  readonly timestamp: number;

  // Health (from ProviderHealthManager)
  readonly healthState: ExtendedProviderHealthState;
  readonly healthScore: ProviderHealthScore | null;
  readonly reliabilitySuccessRate: number;
  readonly averageLatencyMs: number;
  readonly p95LatencyMs: number;
  readonly consecutiveFailures: number;
  readonly consecutiveSuccesses: number;

  // Circuit breaker (from ProviderReliabilityRecoveryManager)
  readonly circuitState: CircuitState;
  readonly circuitRollingFailureRate: number;
  readonly circuitOpenUntil?: number;

  // Cooldown (from ProviderCooldownManager)
  readonly isInCooldown: boolean;
  readonly cooldownRemainingMs: number;

  // Quota (from ProviderQuotaManager)
  readonly isQuotaExhausted: boolean;

  // Rate limit (from ProviderRateLimitStateTracker)
  readonly isRateLimited: boolean;

  // Admission (derived from AdmissionController status)
  readonly lastAdmissionDecision?: AdmissionDecision;

  // Telemetry aggregation (from ProviderTelemetryAggregator)
  readonly recentAggregation: TelemetryAggregation | null;

  // Findings specific to this provider
  readonly findings: ReadonlyArray<DiagnosticFinding>;
}

// ─── System Diagnostic Summary ──────────────────────────────────────

export type SystemHealthGrade = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'CRITICAL';

/**
 * System-wide diagnostic summary spanning all providers.
 */
export interface SystemDiagnosticSummary {
  readonly overallGrade: SystemHealthGrade;
  readonly totalProviders: number;
  readonly healthyProviders: number;
  readonly degradedProviders: number;
  readonly unhealthyProviders: number;
  readonly openCircuitBreakers: number;
  readonly activeCooldowns: number;
  readonly exhaustedQuotas: number;
  readonly overallSuccessRate: number;
  readonly overallAverageLatencyMs: number;
  readonly timestamp: number;
}

// ─── Diagnostic Report ──────────────────────────────────────────────

/**
 * Complete diagnostic report generated on demand by ProviderDiagnosticsManager.
 * This is the top-level structure returned to callers.
 */
export interface DiagnosticReport {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly systemSummary: SystemDiagnosticSummary;
  readonly providers: ReadonlyArray<ProviderDiagnosticEntry>;
  readonly findings: ReadonlyArray<DiagnosticFinding>;
}

// ─── Diagnostics Manager Status ─────────────────────────────────────

/**
 * Status of the diagnostics manager itself.
 */
export interface DiagnosticsManagerStatus {
  readonly isActive: boolean;
  readonly totalReportsGenerated: number;
  readonly lastReportTimestamp: number | null;
}
