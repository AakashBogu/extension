import { describe, it, expect } from 'vitest';
import { TraceManager } from '../core/metrics/TraceManager';
import { HealthMonitor } from '../core/metrics/HealthMonitor';

describe('Module 1F: Tracing & Health Monitor', () => {
  it('should trace parent-child span lifecycle', () => {
    const tracer = new TraceManager();
    const parentSpan = tracer.startSpan('VerificationPipeline');
    const childSpan = tracer.startSpan('SearchQueryExecution', parentSpan.spanId);

    expect(childSpan.traceId).toBe(parentSpan.traceId);
    tracer.finishSpan(childSpan.spanId);
    tracer.finishSpan(parentSpan.spanId);

    expect(tracer.getCompletedSpans().length).toBe(2);
  });

  it('should evaluate overall system health in HealthMonitor', async () => {
    const health = new HealthMonitor();
    health.registerCheck('EventBus', async () => ({
      component: 'EventBus',
      status: 'HEALTHY',
      message: 'Queue operational',
      timestamp: Date.now()
    }));

    const report = await health.runHealthCheck();
    expect(report.overallStatus).toBe('HEALTHY');
    expect(report.results.length).toBe(1);
  });
});
