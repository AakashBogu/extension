/**
 * Provider Diagnostic Evaluator (Module 6F.10)
 *
 * Pure static evaluator that analyzes telemetry aggregations and live
 * provider state to generate diagnostic findings. Follows the established
 * Manager/Evaluator separation pattern (e.g., ProviderHealthEvaluator,
 * ProviderCircuitEvaluator).
 *
 * This evaluator is stateless — it produces findings from input data
 * without side effects.
 */

import {
  DiagnosticFinding,
  DiagnosticSeverity,
  DiagnosticCategory,
  SystemHealthGrade,
  SystemDiagnosticSummary,
  ProviderDiagnosticEntry,
} from './ProviderDiagnosticTypes';
import { ProviderTelemetryPolicy } from './ProviderTelemetryPolicy';

export class ProviderDiagnosticEvaluator {
  // ─── Provider-Level Findings ───────────────────────────────────────

  /**
   * Evaluate a single provider and generate diagnostic findings.
   */
  static evaluateProvider(
    entry: ProviderDiagnosticEntry,
    policy: ProviderTelemetryPolicy
  ): DiagnosticFinding[] {
    const findings: DiagnosticFinding[] = [];
    const now = Date.now();

    // 1. Health state findings
    if (entry.healthState === 'UNHEALTHY') {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'CRITICAL', 'HEALTH', entry.providerId, now,
        'Provider Unhealthy',
        `Provider ${entry.providerId} is in UNHEALTHY state with ${entry.consecutiveFailures} consecutive failures.`,
        { consecutiveFailures: entry.consecutiveFailures }
      ));
    } else if (entry.healthState === 'DEGRADED') {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'WARNING', 'HEALTH', entry.providerId, now,
        'Provider Degraded',
        `Provider ${entry.providerId} is in DEGRADED state.`,
        { consecutiveFailures: entry.consecutiveFailures }
      ));
    }

    // 2. Circuit breaker findings
    if (entry.circuitState === 'OPEN') {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'CRITICAL', 'CIRCUIT', entry.providerId, now,
        'Circuit Breaker Open',
        `Provider ${entry.providerId} circuit breaker is OPEN. Rolling failure rate: ${(entry.circuitRollingFailureRate * 100).toFixed(1)}%.`,
        { rollingFailureRate: entry.circuitRollingFailureRate, openUntil: entry.circuitOpenUntil ?? 0 }
      ));
    } else if (entry.circuitState === 'HALF_OPEN') {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'WARNING', 'CIRCUIT', entry.providerId, now,
        'Circuit Breaker Half-Open',
        `Provider ${entry.providerId} circuit breaker is HALF_OPEN, awaiting recovery probe.`,
        { rollingFailureRate: entry.circuitRollingFailureRate }
      ));
    }

    // 3. Cooldown findings
    if (entry.isInCooldown) {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'WARNING', 'COOLDOWN', entry.providerId, now,
        'Provider In Cooldown',
        `Provider ${entry.providerId} is in cooldown. Remaining: ${entry.cooldownRemainingMs}ms.`,
        { cooldownRemainingMs: entry.cooldownRemainingMs }
      ));
    }

    // 4. Quota findings
    if (entry.isQuotaExhausted) {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'CRITICAL', 'QUOTA', entry.providerId, now,
        'Quota Exhausted',
        `Provider ${entry.providerId} has exhausted its quota allocation.`
      ));
    }

    // 5. Rate limit findings
    if (entry.isRateLimited) {
      findings.push(ProviderDiagnosticEvaluator.createFinding(
        'WARNING', 'RATE_LIMIT', entry.providerId, now,
        'Rate Limited',
        `Provider ${entry.providerId} is currently rate-limited.`
      ));
    }

    // 6. Aggregation-based findings (only if sufficient samples)
    if (entry.recentAggregation && entry.recentAggregation.totalRequests >= policy.minimumSamplesForFindings) {
      const agg = entry.recentAggregation;

      // Success rate findings
      if (agg.successRate < policy.successRateCriticalThreshold) {
        findings.push(ProviderDiagnosticEvaluator.createFinding(
          'CRITICAL', 'RELIABILITY', entry.providerId, now,
          'Critical Success Rate',
          `Provider ${entry.providerId} success rate is ${(agg.successRate * 100).toFixed(1)}% (threshold: ${(policy.successRateCriticalThreshold * 100)}%).`,
          { successRate: agg.successRate, totalRequests: agg.totalRequests }
        ));
      } else if (agg.successRate < policy.successRateWarningThreshold) {
        findings.push(ProviderDiagnosticEvaluator.createFinding(
          'WARNING', 'RELIABILITY', entry.providerId, now,
          'Low Success Rate',
          `Provider ${entry.providerId} success rate is ${(agg.successRate * 100).toFixed(1)}% (threshold: ${(policy.successRateWarningThreshold * 100)}%).`,
          { successRate: agg.successRate, totalRequests: agg.totalRequests }
        ));
      }

      // Latency findings
      if (agg.averageLatencyMs > policy.latencyCriticalThresholdMs) {
        findings.push(ProviderDiagnosticEvaluator.createFinding(
          'CRITICAL', 'LATENCY', entry.providerId, now,
          'Critical Latency',
          `Provider ${entry.providerId} average latency is ${agg.averageLatencyMs}ms (threshold: ${policy.latencyCriticalThresholdMs}ms).`,
          { averageLatencyMs: agg.averageLatencyMs, maxLatencyMs: agg.maxLatencyMs }
        ));
      } else if (agg.averageLatencyMs > policy.latencyWarningThresholdMs) {
        findings.push(ProviderDiagnosticEvaluator.createFinding(
          'WARNING', 'LATENCY', entry.providerId, now,
          'High Latency',
          `Provider ${entry.providerId} average latency is ${agg.averageLatencyMs}ms (threshold: ${policy.latencyWarningThresholdMs}ms).`,
          { averageLatencyMs: agg.averageLatencyMs, maxLatencyMs: agg.maxLatencyMs }
        ));
      }

      // Admission denial findings
      if (agg.admissionDenialRate > 0.5 && agg.totalAdmissions >= policy.minimumSamplesForFindings) {
        findings.push(ProviderDiagnosticEvaluator.createFinding(
          'WARNING', 'ADMISSION', entry.providerId, now,
          'High Admission Denial Rate',
          `Provider ${entry.providerId} admission denial rate is ${(agg.admissionDenialRate * 100).toFixed(1)}%.`,
          { admissionDenialRate: agg.admissionDenialRate, totalAdmissions: agg.totalAdmissions }
        ));
      }
    }

    return findings;
  }

  // ─── System-Level Grading ──────────────────────────────────────────

  /**
   * Determine system-wide health grade from diagnostic entries.
   */
  static evaluateSystemGrade(entries: ReadonlyArray<ProviderDiagnosticEntry>): SystemHealthGrade {
    if (entries.length === 0) return 'HEALTHY';

    let unhealthyCount = 0;
    let degradedCount = 0;
    let openCircuits = 0;

    for (const entry of entries) {
      if (entry.healthState === 'UNHEALTHY') unhealthyCount++;
      if (entry.healthState === 'DEGRADED') degradedCount++;
      if (entry.circuitState === 'OPEN') openCircuits++;
    }

    // CRITICAL: All providers unhealthy or all circuits open
    if (unhealthyCount === entries.length || openCircuits === entries.length) {
      return 'CRITICAL';
    }

    // UNHEALTHY: Any provider unhealthy or any circuit open
    if (unhealthyCount > 0 || openCircuits > 0) {
      return 'UNHEALTHY';
    }

    // DEGRADED: Any provider degraded
    if (degradedCount > 0) {
      return 'DEGRADED';
    }

    return 'HEALTHY';
  }

  /**
   * Build system diagnostic summary from provider entries.
   */
  static buildSystemSummary(entries: ReadonlyArray<ProviderDiagnosticEntry>): SystemDiagnosticSummary {
    let healthyProviders = 0;
    let degradedProviders = 0;
    let unhealthyProviders = 0;
    let openCircuitBreakers = 0;
    let activeCooldowns = 0;
    let exhaustedQuotas = 0;
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalLatencyMs = 0;
    let latencySamples = 0;

    for (const entry of entries) {
      if (entry.healthState === 'HEALTHY') healthyProviders++;
      else if (entry.healthState === 'DEGRADED') degradedProviders++;
      else if (entry.healthState === 'UNHEALTHY') unhealthyProviders++;

      if (entry.circuitState === 'OPEN') openCircuitBreakers++;
      if (entry.isInCooldown) activeCooldowns++;
      if (entry.isQuotaExhausted) exhaustedQuotas++;

      if (entry.recentAggregation) {
        totalRequests += entry.recentAggregation.totalRequests;
        totalSuccessful += entry.recentAggregation.successfulRequests;
        if (entry.recentAggregation.averageLatencyMs > 0 && entry.recentAggregation.totalRequests > 0) {
          totalLatencyMs += entry.recentAggregation.averageLatencyMs * entry.recentAggregation.totalRequests;
          latencySamples += entry.recentAggregation.totalRequests;
        }
      }
    }

    return {
      overallGrade: ProviderDiagnosticEvaluator.evaluateSystemGrade(entries),
      totalProviders: entries.length,
      healthyProviders,
      degradedProviders,
      unhealthyProviders,
      openCircuitBreakers,
      activeCooldowns,
      exhaustedQuotas,
      overallSuccessRate: totalRequests > 0
        ? Number((totalSuccessful / totalRequests).toFixed(4))
        : 0,
      overallAverageLatencyMs: latencySamples > 0
        ? Math.round(totalLatencyMs / latencySamples)
        : 0,
      timestamp: Date.now(),
    };
  }

  // ─── Internal: Finding Factory ─────────────────────────────────────

  private static createFinding(
    severity: DiagnosticSeverity,
    category: DiagnosticCategory,
    providerId: string | undefined,
    timestamp: number,
    title: string,
    description: string,
    metadata?: Record<string, number | string | boolean>
  ): DiagnosticFinding {
    return {
      id: `diag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      severity,
      category,
      providerId,
      title,
      description,
      timestamp,
      metadata,
    };
  }
}
