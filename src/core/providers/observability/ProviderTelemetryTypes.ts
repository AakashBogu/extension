/**
 * Provider Telemetry Types (Module 6F.10)
 *
 * Core type contracts for the provider observability and telemetry layer.
 * These types define the data structures used by the telemetry collector,
 * aggregator, and snapshot builder. All types are strictly read-only and
 * contain only operational metrics — never prompts, queries, credentials,
 * or response bodies.
 */

// ─── Telemetry Record ────────────────────────────────────────────────

export type TelemetryEventCategory =
  | 'USAGE'
  | 'RATE_LIMIT'
  | 'QUOTA'
  | 'COOLDOWN'
  | 'HEALTH'
  | 'CIRCUIT'
  | 'ADMISSION'
  | 'ROUTING'
  | 'EXECUTION'
  | 'RECOVERY';

/**
 * A single telemetry observation captured from an EventBus event.
 * Contains only operational metrics — no sensitive payload data.
 */
export interface TelemetryRecord {
  readonly id: string;
  readonly category: TelemetryEventCategory;
  readonly providerId: string;
  readonly modelId?: string;
  readonly requestType?: 'AI' | 'SEARCH';
  readonly timestamp: number;

  // Outcome metrics (optional per category)
  readonly success?: boolean;
  readonly durationMs?: number;
  readonly decision?: string;
  readonly reason?: string;
  readonly errorCode?: string;

  // Quantitative metrics (optional per category)
  readonly score?: number;
  readonly utilizationRatio?: number;
  readonly isExhausted?: boolean;
  readonly isBlocking?: boolean;
  readonly remainingCapacity?: number;
}

// ─── Aggregation ─────────────────────────────────────────────────────

export type TelemetryAggregationWindow = 'MINUTE' | 'HOUR' | 'DAY';

/**
 * Aggregated metrics for a single provider within a time window.
 */
export interface TelemetryAggregation {
  readonly providerId: string;
  readonly window: TelemetryAggregationWindow;
  readonly windowStart: number;
  readonly windowEnd: number;

  // Request metrics
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly successRate: number;

  // Latency metrics
  readonly averageLatencyMs: number;
  readonly minLatencyMs: number;
  readonly maxLatencyMs: number;

  // Admission metrics
  readonly totalAdmissions: number;
  readonly admissionsAllowed: number;
  readonly admissionsDenied: number;
  readonly admissionDenialRate: number;

  // Routing metrics
  readonly routingSelections: number;
  readonly fallbackSelections: number;

  // Limit event counts
  readonly rateLimitEvents: number;
  readonly quotaExhaustionEvents: number;
  readonly cooldownEvents: number;
  readonly circuitOpenEvents: number;
}

/**
 * Mutable internal accumulator used by the aggregator to build aggregations.
 * Not exported — for internal use by ProviderTelemetryAggregator.
 */
export interface TelemetryAccumulator {
  providerId: string;
  window: TelemetryAggregationWindow;
  windowStart: number;
  windowEnd: number;

  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;

  totalLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  latencySampleCount: number;

  totalAdmissions: number;
  admissionsAllowed: number;
  admissionsDenied: number;

  routingSelections: number;
  fallbackSelections: number;

  rateLimitEvents: number;
  quotaExhaustionEvents: number;
  cooldownEvents: number;
  circuitOpenEvents: number;
}

// ─── Snapshots ───────────────────────────────────────────────────────

/**
 * A point-in-time snapshot of all provider telemetry state.
 * Generated on demand by ProviderTelemetrySnapshotBuilder.
 */
export interface TelemetrySnapshot {
  readonly timestamp: number;
  readonly providers: ReadonlyArray<ProviderTelemetrySummary>;
  readonly systemSummary: SystemTelemetrySummary;
}

/**
 * Per-provider summary within a telemetry snapshot.
 */
export interface ProviderTelemetrySummary {
  readonly providerId: string;
  readonly recentAggregation: TelemetryAggregation | null;
  readonly currentHealthState?: string;
  readonly currentHealthScore?: number;
  readonly currentCircuitState?: string;
  readonly isInCooldown?: boolean;
  readonly isQuotaExhausted?: boolean;
  readonly isRateLimited?: boolean;
  readonly admissionStatus?: string;
  readonly latestRoutingScore?: number;
}

/**
 * System-wide telemetry summary.
 */
export interface SystemTelemetrySummary {
  readonly totalProviders: number;
  readonly healthyProviders: number;
  readonly degradedProviders: number;
  readonly unhealthyProviders: number;
  readonly totalRequestsInWindow: number;
  readonly overallSuccessRate: number;
  readonly overallAverageLatencyMs: number;
  readonly activeCircuitBreakers: number;
  readonly activeCooldowns: number;
  readonly quotaExhaustedProviders: number;
}

// ─── Collector Status ────────────────────────────────────────────────

/**
 * Status of the telemetry collector subsystem.
 */
export interface TelemetryCollectorStatus {
  readonly isActive: boolean;
  readonly totalRecordsCollected: number;
  readonly currentBufferSize: number;
  readonly maxBufferSize: number;
  readonly subscribedEventCount: number;
  readonly lastRecordTimestamp: number | null;
  readonly droppedRecords: number;
}
