/**
 * Module 6F.10: Provider Telemetry Collector Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../core/events/EventBus';
import { ProviderTelemetryCollector } from '../core/providers/observability/ProviderTelemetryCollector';
import { ProviderTelemetryPolicy } from '../core/providers/observability/ProviderTelemetryPolicy';
import { TelemetryRecord } from '../core/providers/observability/ProviderTelemetryTypes';

describe('Module 6F.10: ProviderTelemetryCollector', () => {
  let collector: ProviderTelemetryCollector;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    collector = new ProviderTelemetryCollector(new ProviderTelemetryPolicy(), eventBus);
  });

  it('should initialize and track status', async () => {
    await collector.initialize();

    const status = collector.getStatus();
    expect(status.isActive).toBe(true);
    expect(status.totalRecordsCollected).toBe(0);
    expect(status.droppedRecords).toBe(0);
    expect(status.subscribedEventCount).toBeGreaterThan(0);
  });

  it('should ingest manual telemetry records', async () => {
    await collector.initialize();

    const record: TelemetryRecord = {
      id: 'tel_test_1',
      category: 'USAGE',
      providerId: 'ai.openai',
      timestamp: Date.now(),
      success: true,
      durationMs: 150,
    };

    collector.ingest(record);

    expect(collector.getRecords('ai.openai')).toHaveLength(1);
    expect(collector.getRecords('ai.openai')[0].providerId).toBe('ai.openai');
    expect(collector.getStatus().totalRecordsCollected).toBe(1);
  });

  it('should enforce ring buffer maximum per provider', async () => {
    const smallPolicy = new ProviderTelemetryPolicy({ maxRecordsPerProvider: 5 });
    const smallCollector = new ProviderTelemetryCollector(smallPolicy);
    await smallCollector.initialize();

    for (let i = 0; i < 10; i++) {
      smallCollector.ingest({
        id: `tel_${i}`,
        category: 'USAGE',
        providerId: 'ai.openai',
        timestamp: Date.now() + i,
        success: true,
      });
    }

    expect(smallCollector.getRecords('ai.openai')).toHaveLength(5);
    // Oldest records should have been dropped
    expect(smallCollector.getRecords('ai.openai')[0].id).toBe('tel_5');
    expect(smallCollector.getStatus().droppedRecords).toBe(5);
  });

  it('should collect events from EventBus provider.usage_recorded', async () => {
    await collector.initialize();

    await eventBus.publish('provider.usage_recorded', {
      providerId: 'ai.openai',
      modelId: 'gpt-4',
      requestId: 'req_1',
      success: true,
      durationMs: 200,
      timestamp: Date.now(),
    });

    const records = collector.getRecords('ai.openai');
    expect(records.length).toBe(1);
    expect(records[0].category).toBe('USAGE');
    expect(records[0].success).toBe(true);
    expect(records[0].durationMs).toBe(200);
    expect(records[0].modelId).toBe('gpt-4');
  });

  it('should collect events from EventBus provider.admission_denied', async () => {
    await collector.initialize();

    await eventBus.publish('provider.admission_denied', {
      providerId: 'ai.openai',
      decision: 'RATE_LIMITED',
      reason: 'Rate limit exceeded',
      checkedAt: Date.now(),
    });

    const records = collector.getRecords('ai.openai');
    expect(records.length).toBe(1);
    expect(records[0].category).toBe('ADMISSION');
    expect(records[0].success).toBe(false);
    expect(records[0].decision).toBe('RATE_LIMITED');
  });

  it('should collect circuit breaker events', async () => {
    await collector.initialize();

    await eventBus.publish('provider.circuit_opened', {
      providerId: 'search.brave',
      reason: 'Failure threshold exceeded',
      openUntil: Date.now() + 30000,
      timestamp: Date.now(),
    });

    const records = collector.getRecords('search.brave');
    expect(records.length).toBe(1);
    expect(records[0].category).toBe('CIRCUIT');
    expect(records[0].decision).toBe('OPEN');
    expect(records[0].isBlocking).toBe(true);
  });

  it('should not capture routing_failed events that may contain search queries', async () => {
    await collector.initialize();

    // SearchProviderRouter emits query in routing_failed — collector deliberately
    // does NOT subscribe to this event to prevent sensitive query capture
    await eventBus.publish('provider.routing_failed', {
      query: 'user sensitive search query',
      reason: 'No eligible provider',
      timestamp: Date.now(),
    });

    // Verify the collector did NOT capture this event
    const unknownRecords = collector.getRecords('unknown');
    expect(unknownRecords.length).toBe(0);

    // Verify no records exist anywhere for this event
    const allRecords = collector.getAllRecords();
    const routingFailedRecords = allRecords.filter(r =>
      r.category === 'ROUTING' && r.decision === 'FAILED'
    );
    expect(routingFailedRecords.length).toBe(0);
  });

  it('should get records in time range', async () => {
    await collector.initialize();
    const baseTime = Date.now();

    for (let i = 0; i < 5; i++) {
      collector.ingest({
        id: `tel_${i}`,
        category: 'USAGE',
        providerId: 'ai.openai',
        timestamp: baseTime + i * 1000,
        success: true,
      });
    }

    const ranged = collector.getRecordsInRange('ai.openai', baseTime + 1000, baseTime + 3000);
    expect(ranged).toHaveLength(3);
  });

  it('should track multiple providers independently', async () => {
    await collector.initialize();

    collector.ingest({ id: 'a1', category: 'USAGE', providerId: 'ai.openai', timestamp: Date.now(), success: true });
    collector.ingest({ id: 'b1', category: 'USAGE', providerId: 'search.brave', timestamp: Date.now(), success: false });
    collector.ingest({ id: 'a2', category: 'USAGE', providerId: 'ai.openai', timestamp: Date.now(), success: true });

    expect(collector.getRecords('ai.openai')).toHaveLength(2);
    expect(collector.getRecords('search.brave')).toHaveLength(1);
    expect(collector.getTrackedProviders()).toContain('ai.openai');
    expect(collector.getTrackedProviders()).toContain('search.brave');
  });

  it('should clear records per provider and globally', async () => {
    await collector.initialize();

    collector.ingest({ id: 'a1', category: 'USAGE', providerId: 'ai.openai', timestamp: Date.now() });
    collector.ingest({ id: 'b1', category: 'USAGE', providerId: 'search.brave', timestamp: Date.now() });

    collector.clear('ai.openai');
    expect(collector.getRecords('ai.openai')).toHaveLength(0);
    expect(collector.getRecords('search.brave')).toHaveLength(1);

    collector.clear();
    expect(collector.getRecords('search.brave')).toHaveLength(0);
  });

  it('should not ingest records when not active', () => {
    // Not initialized
    collector.ingest({ id: 'a1', category: 'USAGE', providerId: 'ai.openai', timestamp: Date.now() });
    expect(collector.getRecords('ai.openai')).toHaveLength(0);
  });

  it('should shutdown and destroy cleanly', async () => {
    await collector.initialize();
    collector.ingest({ id: 'a1', category: 'USAGE', providerId: 'ai.openai', timestamp: Date.now() });

    collector.shutdown();
    expect(collector.getStatus().isActive).toBe(false);

    // Records preserved after shutdown
    expect(collector.getRecords('ai.openai')).toHaveLength(1);

    collector.destroy();
    expect(collector.getRecords('ai.openai')).toHaveLength(0);
    expect(collector.getStatus().totalRecordsCollected).toBe(0);
  });
});
