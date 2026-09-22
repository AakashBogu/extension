/**
 * Provider Telemetry Policy (Module 6F.10)
 *
 * Configuration for the telemetry collection, aggregation, and
 * diagnostics subsystem. Follows the immutable Policy pattern
 * established by ProviderCooldownPolicy, ProviderAdmissionPolicy, etc.
 */

// ─── Policy Config Interface ────────────────────────────────────────

export interface ProviderTelemetryPolicyConfig {
  /** Maximum telemetry records held in ring buffer per provider. Default: 200. */
  readonly maxRecordsPerProvider?: number;

  /** Default aggregation window in milliseconds. Default: 60000 (1 minute). */
  readonly defaultAggregationWindowMs?: number;

  /** Maximum aggregation buckets retained per provider. Default: 60. */
  readonly maxAggregationBucketsPerProvider?: number;

  /** Whether to subscribe to EventBus events on initialization. Default: true. */
  readonly autoSubscribe?: boolean;

  /** Latency threshold (ms) above which a WARNING finding is generated. Default: 2000. */
  readonly latencyWarningThresholdMs?: number;

  /** Latency threshold (ms) above which a CRITICAL finding is generated. Default: 5000. */
  readonly latencyCriticalThresholdMs?: number;

  /** Success rate below which a WARNING finding is generated. Default: 0.90. */
  readonly successRateWarningThreshold?: number;

  /** Success rate below which a CRITICAL finding is generated. Default: 0.50. */
  readonly successRateCriticalThreshold?: number;

  /** Minimum requests in window before findings are generated. Default: 5. */
  readonly minimumSamplesForFindings?: number;
}

// ─── Policy Class ───────────────────────────────────────────────────

export class ProviderTelemetryPolicy {
  public readonly maxRecordsPerProvider: number;
  public readonly defaultAggregationWindowMs: number;
  public readonly maxAggregationBucketsPerProvider: number;
  public readonly autoSubscribe: boolean;
  public readonly latencyWarningThresholdMs: number;
  public readonly latencyCriticalThresholdMs: number;
  public readonly successRateWarningThreshold: number;
  public readonly successRateCriticalThreshold: number;
  public readonly minimumSamplesForFindings: number;

  constructor(config: ProviderTelemetryPolicyConfig = {}) {
    this.maxRecordsPerProvider = config.maxRecordsPerProvider ?? 200;
    this.defaultAggregationWindowMs = config.defaultAggregationWindowMs ?? 60_000;
    this.maxAggregationBucketsPerProvider = config.maxAggregationBucketsPerProvider ?? 60;
    this.autoSubscribe = config.autoSubscribe ?? true;
    this.latencyWarningThresholdMs = config.latencyWarningThresholdMs ?? 2000;
    this.latencyCriticalThresholdMs = config.latencyCriticalThresholdMs ?? 5000;
    this.successRateWarningThreshold = config.successRateWarningThreshold ?? 0.90;
    this.successRateCriticalThreshold = config.successRateCriticalThreshold ?? 0.50;
    this.minimumSamplesForFindings = config.minimumSamplesForFindings ?? 5;
  }
}
