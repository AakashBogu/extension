/**
 * Provider Telemetry Snapshot Builder (Module 6F.10)
 *
 * Builds immutable TelemetrySnapshot objects from aggregated data and
 * live state queries. Follows the existing SnapshotBuilder pattern
 * established by ProviderHealthSnapshotBuilder, ProviderQuotaSnapshotBuilder, etc.
 *
 * This is a stateless utility class — all state comes from injected data.
 */

import {
  TelemetrySnapshot,
  ProviderTelemetrySummary,
  SystemTelemetrySummary,
  TelemetryAggregation,
} from './ProviderTelemetryTypes';

export interface ProviderLiveState {
  readonly providerId: string;
  readonly healthState?: string;
  readonly healthScore?: number;
  readonly circuitState?: string;
  readonly isInCooldown?: boolean;
  readonly isQuotaExhausted?: boolean;
  readonly isRateLimited?: boolean;
  readonly admissionStatus?: string;
  readonly routingScore?: number;
}

export class ProviderTelemetrySnapshotBuilder {
  /**
   * Build a complete telemetry snapshot from aggregation data and live state.
   */
  static buildSnapshot(
    providerAggregations: Map<string, TelemetryAggregation | null>,
    providerStates: Map<string, ProviderLiveState>
  ): TelemetrySnapshot {
    const providers: ProviderTelemetrySummary[] = [];

    // Merge all known provider IDs from both sources
    const allProviderIds = new Set<string>([
      ...providerAggregations.keys(),
      ...providerStates.keys(),
    ]);

    for (const providerId of allProviderIds) {
      const aggregation = providerAggregations.get(providerId) ?? null;
      const state = providerStates.get(providerId);

      providers.push({
        providerId,
        recentAggregation: aggregation,
        currentHealthState: state?.healthState,
        currentHealthScore: state?.healthScore,
        currentCircuitState: state?.circuitState,
        isInCooldown: state?.isInCooldown,
        isQuotaExhausted: state?.isQuotaExhausted,
        isRateLimited: state?.isRateLimited,
        admissionStatus: state?.admissionStatus,
        latestRoutingScore: state?.routingScore,
      });
    }

    const systemSummary = ProviderTelemetrySnapshotBuilder.buildSystemSummary(providers);

    return {
      timestamp: Date.now(),
      providers,
      systemSummary,
    };
  }

  /**
   * Build system-wide summary from individual provider summaries.
   */
  static buildSystemSummary(
    providers: ReadonlyArray<ProviderTelemetrySummary>
  ): SystemTelemetrySummary {
    let healthyProviders = 0;
    let degradedProviders = 0;
    let unhealthyProviders = 0;
    let activeCircuitBreakers = 0;
    let activeCooldowns = 0;
    let quotaExhaustedProviders = 0;
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalLatencyMs = 0;
    let latencySamples = 0;

    for (const p of providers) {
      // Health classification
      const health = p.currentHealthState?.toUpperCase();
      if (health === 'HEALTHY') healthyProviders++;
      else if (health === 'DEGRADED') degradedProviders++;
      else if (health === 'UNHEALTHY') unhealthyProviders++;

      // Circuit breakers
      if (p.currentCircuitState === 'OPEN') activeCircuitBreakers++;

      // Cooldowns
      if (p.isInCooldown) activeCooldowns++;

      // Quota exhaustion
      if (p.isQuotaExhausted) quotaExhaustedProviders++;

      // Aggregation metrics
      if (p.recentAggregation) {
        totalRequests += p.recentAggregation.totalRequests;
        totalSuccessful += p.recentAggregation.successfulRequests;
        if (p.recentAggregation.averageLatencyMs > 0 && p.recentAggregation.totalRequests > 0) {
          totalLatencyMs += p.recentAggregation.averageLatencyMs * p.recentAggregation.totalRequests;
          latencySamples += p.recentAggregation.totalRequests;
        }
      }
    }

    return {
      totalProviders: providers.length,
      healthyProviders,
      degradedProviders,
      unhealthyProviders,
      totalRequestsInWindow: totalRequests,
      overallSuccessRate: totalRequests > 0
        ? Number((totalSuccessful / totalRequests).toFixed(4))
        : 0,
      overallAverageLatencyMs: latencySamples > 0
        ? Math.round(totalLatencyMs / latencySamples)
        : 0,
      activeCircuitBreakers,
      activeCooldowns,
      quotaExhaustedProviders,
    };
  }
}
