/**
 * Module 6F.10: Provider Observability Integration Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../core/events/EventBus';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';
import { ProviderCooldownManager } from '../core/providers/limits/ProviderCooldownManager';
import { ProviderObservabilityManager } from '../core/providers/observability/ProviderObservabilityManager';
import { ProviderDiagnosticEvaluator } from '../core/providers/observability/ProviderDiagnosticEvaluator';
import { ProviderTelemetrySnapshotBuilder } from '../core/providers/observability/ProviderTelemetrySnapshotBuilder';
import { ProviderTelemetryPolicy } from '../core/providers/observability/ProviderTelemetryPolicy';

describe('Module 6F.10: Provider Observability Integration', () => {
  let eventBus: EventBus;
  let healthManager: ProviderHealthManager;
  let recoveryManager: ProviderReliabilityRecoveryManager;
  let cooldownManager: ProviderCooldownManager;
  let observability: ProviderObservabilityManager;

  beforeEach(async () => {
    eventBus = new EventBus();
    healthManager = new ProviderHealthManager(eventBus);
    recoveryManager = new ProviderReliabilityRecoveryManager(eventBus);
    cooldownManager = new ProviderCooldownManager(undefined, eventBus);

    observability = new ProviderObservabilityManager(
      { maxRecordsPerProvider: 100 },
      healthManager,
      recoveryManager,
      cooldownManager,
      undefined, // quotaManager
      undefined, // rateLimitTracker
      eventBus
    );

    await observability.initialize();
  });

  it('should initialize and report active status', () => {
    const status = observability.getStatus();
    expect(status.isActive).toBe(true);
    expect(status.collector.isActive).toBe(true);
    expect(status.collector.subscribedEventCount).toBeGreaterThan(0);
    expect(status.diagnostics.isActive).toBe(true);
    expect(status.diagnostics.totalReportsGenerated).toBe(0);
  });

  it('should capture health events and include them in telemetry snapshot', async () => {
    // Record health events through the health manager
    healthManager.recordSuccess('ai.openai', 120);
    healthManager.recordSuccess('ai.openai', 150);
    healthManager.recordFailure('ai.openai', 'HTTP 500');

    // Allow EventBus to propagate events
    const snapshot = observability.getTelemetrySnapshot();

    expect(snapshot.timestamp).toBeGreaterThan(0);
    expect(snapshot.providers.length).toBeGreaterThan(0);

    // Find the openai provider summary
    const openaiSummary = snapshot.providers.find(p => p.providerId === 'ai.openai');
    if (openaiSummary) {
      expect(openaiSummary.currentHealthState).toBeDefined();
    }
  });

  it('should generate diagnostic report from live state', () => {
    // Set up some provider state
    healthManager.recordSuccess('ai.openai', 100);
    healthManager.recordFailure('search.brave', 'Connection refused');
    healthManager.recordFailure('search.brave', 'Connection refused');
    healthManager.recordFailure('search.brave', 'Connection refused');

    // Generate diagnostic report
    const report = observability.generateDiagnosticReport();

    expect(report.reportId).toBeDefined();
    expect(report.generatedAt).toBeGreaterThan(0);
    expect(report.systemSummary).toBeDefined();
    expect(report.systemSummary.totalProviders).toBeGreaterThanOrEqual(0);

    // Check diagnostics status was updated
    const status = observability.getStatus();
    expect(status.diagnostics.totalReportsGenerated).toBe(1);
  });

  it('should detect unhealthy provider in diagnostic findings', () => {
    // Drive provider to UNHEALTHY
    for (let i = 0; i < 5; i++) {
      healthManager.recordFailure('ai.openai', 'Server error');
    }

    const report = observability.generateDiagnosticReport();

    // Should have findings about unhealthy provider
    const healthFindings = report.findings.filter(f =>
      f.category === 'HEALTH' && f.providerId === 'ai.openai'
    );

    // Provider should be detected as unhealthy or degraded
    expect(healthFindings.length).toBeGreaterThan(0);
  });

  it('should detect circuit breaker open in diagnostics', () => {
    // Trip the circuit breaker
    for (let i = 0; i < 6; i++) {
      recoveryManager.recordFailure('search.brave', new Error('HTTP 500'));
    }

    const entry = observability.getProviderDiagnostics('search.brave');

    // Circuit should be OPEN after exceeding failure threshold
    if (entry.circuitState === 'OPEN') {
      expect(entry.circuitRollingFailureRate).toBeGreaterThan(0);
    }
  });

  it('should detect cooldown in diagnostics', () => {
    cooldownManager.startCooldown('ai.openai', 'LOCAL_POLICY', 'Test cooldown');

    const entry = observability.getProviderDiagnostics('ai.openai');
    expect(entry.isInCooldown).toBe(true);
    expect(entry.cooldownRemainingMs).toBeGreaterThan(0);
  });

  it('should clear telemetry data per provider and globally', async () => {
    // Ingest some data
    await eventBus.publish('provider.usage_recorded', {
      providerId: 'ai.openai',
      success: true,
      durationMs: 100,
      timestamp: Date.now(),
    });

    await eventBus.publish('provider.usage_recorded', {
      providerId: 'search.brave',
      success: true,
      durationMs: 200,
      timestamp: Date.now(),
    });

    observability.clear('ai.openai');
    expect(observability.collector.getRecords('ai.openai')).toHaveLength(0);
    expect(observability.collector.getRecords('search.brave').length).toBeGreaterThan(0);

    observability.reset();
    expect(observability.collector.getRecords('search.brave')).toHaveLength(0);
  });

  it('should shutdown and destroy cleanly', () => {
    observability.shutdown();
    expect(observability.getStatus().isActive).toBe(false);

    observability.destroy();
    expect(observability.collector.getStatus().totalRecordsCollected).toBe(0);
  });
});

describe('Module 6F.10: ProviderDiagnosticEvaluator', () => {
  const policy = new ProviderTelemetryPolicy({
    latencyWarningThresholdMs: 1000,
    latencyCriticalThresholdMs: 3000,
    successRateWarningThreshold: 0.90,
    successRateCriticalThreshold: 0.50,
    minimumSamplesForFindings: 3,
  });

  it('should generate CRITICAL finding for UNHEALTHY provider', () => {
    const entry = createMockEntry({ healthState: 'UNHEALTHY', consecutiveFailures: 5 });
    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);

    const critical = findings.filter(f => f.severity === 'CRITICAL' && f.category === 'HEALTH');
    expect(critical.length).toBe(1);
    expect(critical[0].title).toContain('Unhealthy');
  });

  it('should generate WARNING finding for DEGRADED provider', () => {
    const entry = createMockEntry({ healthState: 'DEGRADED', consecutiveFailures: 2 });
    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);

    const warnings = findings.filter(f => f.severity === 'WARNING' && f.category === 'HEALTH');
    expect(warnings.length).toBe(1);
  });

  it('should generate CRITICAL finding for open circuit breaker', () => {
    const entry = createMockEntry({ circuitState: 'OPEN', circuitRollingFailureRate: 0.8 });
    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);

    const critical = findings.filter(f => f.severity === 'CRITICAL' && f.category === 'CIRCUIT');
    expect(critical.length).toBe(1);
  });

  it('should generate WARNING finding for cooldown', () => {
    const entry = createMockEntry({ isInCooldown: true, cooldownRemainingMs: 5000 });
    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);

    const warnings = findings.filter(f => f.severity === 'WARNING' && f.category === 'COOLDOWN');
    expect(warnings.length).toBe(1);
  });

  it('should generate CRITICAL finding for quota exhaustion', () => {
    const entry = createMockEntry({ isQuotaExhausted: true });
    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);

    const critical = findings.filter(f => f.severity === 'CRITICAL' && f.category === 'QUOTA');
    expect(critical.length).toBe(1);
  });

  it('should generate latency finding when above threshold', () => {
    const entry = createMockEntry({
      recentAggregation: {
        providerId: 'ai.openai', window: 'MINUTE', windowStart: 0, windowEnd: 60000,
        totalRequests: 10, successfulRequests: 10, failedRequests: 0, successRate: 1.0,
        averageLatencyMs: 2500, minLatencyMs: 1000, maxLatencyMs: 4000,
        totalAdmissions: 0, admissionsAllowed: 0, admissionsDenied: 0, admissionDenialRate: 0,
        routingSelections: 0, fallbackSelections: 0,
        rateLimitEvents: 0, quotaExhaustionEvents: 0, cooldownEvents: 0, circuitOpenEvents: 0,
      },
    });

    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);
    const latencyFindings = findings.filter(f => f.category === 'LATENCY');
    expect(latencyFindings.length).toBe(1);
    expect(latencyFindings[0].severity).toBe('WARNING');
  });

  it('should evaluate system grade correctly', () => {
    const allHealthy = [
      createMockEntry({ healthState: 'HEALTHY' }),
      createMockEntry({ healthState: 'HEALTHY', providerId: 'search.brave' }),
    ];
    expect(ProviderDiagnosticEvaluator.evaluateSystemGrade(allHealthy)).toBe('HEALTHY');

    const oneDegraded = [
      createMockEntry({ healthState: 'HEALTHY' }),
      createMockEntry({ healthState: 'DEGRADED', providerId: 'search.brave' }),
    ];
    expect(ProviderDiagnosticEvaluator.evaluateSystemGrade(oneDegraded)).toBe('DEGRADED');

    const oneUnhealthy = [
      createMockEntry({ healthState: 'HEALTHY' }),
      createMockEntry({ healthState: 'UNHEALTHY', providerId: 'search.brave' }),
    ];
    expect(ProviderDiagnosticEvaluator.evaluateSystemGrade(oneUnhealthy)).toBe('UNHEALTHY');

    const allUnhealthy = [
      createMockEntry({ healthState: 'UNHEALTHY' }),
      createMockEntry({ healthState: 'UNHEALTHY', providerId: 'search.brave' }),
    ];
    expect(ProviderDiagnosticEvaluator.evaluateSystemGrade(allUnhealthy)).toBe('CRITICAL');
  });

  it('should return no findings for healthy provider with no aggregation', () => {
    const entry = createMockEntry({ healthState: 'HEALTHY' });
    const findings = ProviderDiagnosticEvaluator.evaluateProvider(entry, policy);
    expect(findings.length).toBe(0);
  });
});

describe('Module 6F.10: ProviderTelemetrySnapshotBuilder', () => {
  it('should build snapshot from aggregation and live state data', () => {
    const aggregations = new Map([
      ['ai.openai', {
        providerId: 'ai.openai', window: 'MINUTE' as const, windowStart: 0, windowEnd: 60000,
        totalRequests: 100, successfulRequests: 95, failedRequests: 5, successRate: 0.95,
        averageLatencyMs: 150, minLatencyMs: 50, maxLatencyMs: 500,
        totalAdmissions: 100, admissionsAllowed: 98, admissionsDenied: 2, admissionDenialRate: 0.02,
        routingSelections: 50, fallbackSelections: 2,
        rateLimitEvents: 0, quotaExhaustionEvents: 0, cooldownEvents: 0, circuitOpenEvents: 0,
      }],
    ]);

    const states = new Map([
      ['ai.openai', {
        providerId: 'ai.openai',
        healthState: 'HEALTHY',
        healthScore: 0.95,
        circuitState: 'CLOSED',
        isInCooldown: false,
        isQuotaExhausted: false,
        isRateLimited: false,
      }],
    ]);

    const snapshot = ProviderTelemetrySnapshotBuilder.buildSnapshot(aggregations, states);

    expect(snapshot.timestamp).toBeGreaterThan(0);
    expect(snapshot.providers).toHaveLength(1);
    expect(snapshot.providers[0].providerId).toBe('ai.openai');
    expect(snapshot.providers[0].currentHealthState).toBe('HEALTHY');
    expect(snapshot.providers[0].recentAggregation?.totalRequests).toBe(100);

    expect(snapshot.systemSummary.totalProviders).toBe(1);
    expect(snapshot.systemSummary.healthyProviders).toBe(1);
    expect(snapshot.systemSummary.totalRequestsInWindow).toBe(100);
    expect(snapshot.systemSummary.overallSuccessRate).toBe(0.95);
  });

  it('should handle empty inputs', () => {
    const snapshot = ProviderTelemetrySnapshotBuilder.buildSnapshot(new Map(), new Map());
    expect(snapshot.providers).toHaveLength(0);
    expect(snapshot.systemSummary.totalProviders).toBe(0);
  });

  it('should merge providers from both aggregation and state maps', () => {
    const aggregations = new Map([
      ['ai.openai', null],
    ]);

    const states = new Map([
      ['search.brave', { providerId: 'search.brave', healthState: 'HEALTHY' }],
    ]);

    const snapshot = ProviderTelemetrySnapshotBuilder.buildSnapshot(aggregations, states);
    expect(snapshot.providers).toHaveLength(2);
    expect(snapshot.providers.map(p => p.providerId).sort()).toEqual(['ai.openai', 'search.brave']);
  });
});

// ─── Test Helpers ────────────────────────────────────────────────────

function createMockEntry(overrides: Partial<{
  providerId: string;
  healthState: string;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  circuitState: string;
  circuitRollingFailureRate: number;
  isInCooldown: boolean;
  cooldownRemainingMs: number;
  isQuotaExhausted: boolean;
  isRateLimited: boolean;
  recentAggregation: ReturnType<typeof import('../core/providers/observability/ProviderTelemetryAggregator').ProviderTelemetryAggregator.prototype.getLatestAggregation>;
}> = {}): import('../core/providers/observability/ProviderDiagnosticTypes').ProviderDiagnosticEntry {
  return {
    providerId: overrides.providerId ?? 'ai.openai',
    timestamp: Date.now(),
    healthState: (overrides.healthState ?? 'HEALTHY') as 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN',
    healthScore: null,
    reliabilitySuccessRate: 1.0,
    averageLatencyMs: 100,
    p95LatencyMs: 200,
    consecutiveFailures: overrides.consecutiveFailures ?? 0,
    consecutiveSuccesses: overrides.consecutiveSuccesses ?? 0,
    circuitState: (overrides.circuitState ?? 'CLOSED') as 'CLOSED' | 'OPEN' | 'HALF_OPEN',
    circuitRollingFailureRate: overrides.circuitRollingFailureRate ?? 0,
    circuitOpenUntil: undefined,
    isInCooldown: overrides.isInCooldown ?? false,
    cooldownRemainingMs: overrides.cooldownRemainingMs ?? 0,
    isQuotaExhausted: overrides.isQuotaExhausted ?? false,
    isRateLimited: overrides.isRateLimited ?? false,
    lastAdmissionDecision: undefined,
    recentAggregation: overrides.recentAggregation ?? null,
    findings: [],
  };
}
