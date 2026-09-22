/**
 * Provider Telemetry Collector (Module 6F.10)
 *
 * Subscribes to existing EventBus provider events and extracts
 * operational metrics into bounded ring buffers. This is the primary
 * ingest point for the observability layer.
 *
 * PRIVACY: This collector deliberately strips all sensitive data.
 * It extracts only: providerIds, modelIds, requestTypes, timestamps,
 * success/failure booleans, latencies, scores, and error codes.
 * It NEVER stores: prompts, queries, credentials, response bodies.
 */

import { IEventBus } from '../../events/IEventBus';
import { BaseEvent } from '../../events/EventTypes';
import {
  TelemetryRecord,
  TelemetryEventCategory,
  TelemetryCollectorStatus,
} from './ProviderTelemetryTypes';
import { ProviderTelemetryPolicy } from './ProviderTelemetryPolicy';

export class ProviderTelemetryCollector {
  private buffers = new Map<string, TelemetryRecord[]>();
  private unsubscribers: Array<() => void> = [];
  private isActive = false;
  private totalRecordsCollected = 0;
  private droppedRecords = 0;
  private lastRecordTimestamp: number | null = null;

  constructor(
    private readonly policy: ProviderTelemetryPolicy = new ProviderTelemetryPolicy(),
    private readonly eventBus?: IEventBus
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.isActive) return;
    this.isActive = true;

    if (this.policy.autoSubscribe && this.eventBus) {
      this.subscribeToEvents();
      this.emitEvent('provider.observability_initialized', { component: 'TelemetryCollector', timestamp: Date.now() });
    }
  }

  shutdown(): void {
    this.unsubscribeAll();
    this.isActive = false;
  }

  destroy(): void {
    this.shutdown();
    this.buffers.clear();
    this.totalRecordsCollected = 0;
    this.droppedRecords = 0;
    this.lastRecordTimestamp = null;
  }

  // ─── Public API ─────────────────────────────────────────────────────

  /**
   * Manually ingest a telemetry record (useful for testing or external sources).
   */
  ingest(record: TelemetryRecord): void {
    if (!this.isActive) return;
    this.appendRecord(record);
  }

  /**
   * Get all records for a specific provider (read-only snapshot).
   */
  getRecords(providerId: string): ReadonlyArray<TelemetryRecord> {
    return this.buffers.get(providerId) ?? [];
  }

  /**
   * Get all records across all providers.
   */
  getAllRecords(): ReadonlyArray<TelemetryRecord> {
    const all: TelemetryRecord[] = [];
    for (const records of this.buffers.values()) {
      all.push(...records);
    }
    return all;
  }

  /**
   * Get records within a time range for a provider.
   */
  getRecordsInRange(providerId: string, startTime: number, endTime: number): ReadonlyArray<TelemetryRecord> {
    const records = this.buffers.get(providerId);
    if (!records) return [];
    return records.filter(r => r.timestamp >= startTime && r.timestamp <= endTime);
  }

  /**
   * Get all known provider IDs.
   */
  getTrackedProviders(): string[] {
    return Array.from(this.buffers.keys());
  }

  /**
   * Get collector operational status.
   */
  getStatus(): TelemetryCollectorStatus {
    let currentBufferSize = 0;
    for (const records of this.buffers.values()) {
      currentBufferSize += records.length;
    }

    return {
      isActive: this.isActive,
      totalRecordsCollected: this.totalRecordsCollected,
      currentBufferSize,
      maxBufferSize: this.policy.maxRecordsPerProvider,
      subscribedEventCount: this.unsubscribers.length,
      lastRecordTimestamp: this.lastRecordTimestamp,
      droppedRecords: this.droppedRecords,
    };
  }

  /**
   * Clear all collected records.
   */
  clear(providerId?: string): void {
    if (providerId) {
      this.buffers.delete(providerId);
    } else {
      this.buffers.clear();
    }
  }

  // ─── Internal: Event Subscription ──────────────────────────────────

  private subscribeToEvents(): void {
    if (!this.eventBus) return;

    const subscriptions: Array<{ topic: string; category: TelemetryEventCategory; extractor: (payload: Record<string, unknown>) => Partial<TelemetryRecord> }> = [
      // Usage events
      { topic: 'provider.usage_recorded', category: 'USAGE', extractor: (p) => ({
        success: p.success as boolean | undefined,
        durationMs: p.durationMs as number | undefined,
        modelId: p.modelId as string | undefined,
      })},

      // Rate limit events
      { topic: 'provider.rate_limit_updated', category: 'RATE_LIMIT', extractor: (p) => ({
        isExhausted: p.isExhausted as boolean | undefined,
      })},
      { topic: 'provider.rate_limit_exhausted', category: 'RATE_LIMIT', extractor: () => ({
        isExhausted: true,
      })},

      // Quota events
      { topic: 'provider.quota_updated', category: 'QUOTA', extractor: (p) => ({
        isExhausted: p.isExhausted as boolean | undefined,
        modelId: p.modelId as string | undefined,
      })},
      { topic: 'provider.quota_exhausted', category: 'QUOTA', extractor: (p) => ({
        isExhausted: true,
        modelId: p.modelId as string | undefined,
      })},
      { topic: 'provider.quota_warning', category: 'QUOTA', extractor: (p) => ({
        modelId: p.modelId as string | undefined,
      })},
      { topic: 'provider.quota_critical', category: 'QUOTA', extractor: (p) => ({
        modelId: p.modelId as string | undefined,
      })},

      // Cooldown events
      { topic: 'provider.cooldown_started', category: 'COOLDOWN', extractor: (p) => ({
        modelId: p.modelId as string | undefined,
        reason: p.source as string | undefined,
        durationMs: p.durationMs as number | undefined,
      })},
      { topic: 'provider.cooldown_cleared', category: 'COOLDOWN', extractor: (p) => ({
        modelId: p.modelId as string | undefined,
      })},
      { topic: 'provider.cooldown_expired', category: 'COOLDOWN', extractor: (p) => ({
        modelId: p.modelId as string | undefined,
      })},

      // Health events
      { topic: 'provider.health_changed', category: 'HEALTH', extractor: (p) => ({
        decision: p.status as string | undefined,
      })},
      { topic: 'provider.health_recovered', category: 'HEALTH', extractor: (p) => ({
        decision: p.status as string | undefined,
        success: true,
      })},
      { topic: 'provider.health_degraded', category: 'HEALTH', extractor: (p) => ({
        decision: p.status as string | undefined,
      })},
      { topic: 'provider.health_unhealthy', category: 'HEALTH', extractor: (p) => ({
        decision: p.status as string | undefined,
      })},
      { topic: 'provider.health_updated', category: 'HEALTH', extractor: (p) => ({
        score: p.healthScore as number | undefined,
        decision: (p.healthState as string) ?? undefined,
      })},

      // Circuit breaker events
      { topic: 'provider.circuit_opened', category: 'CIRCUIT', extractor: () => ({
        isBlocking: true,
        // Strip error message details for privacy — only record that circuit opened
        decision: 'OPEN',
      })},
      { topic: 'provider.circuit_half_open', category: 'CIRCUIT', extractor: () => ({
        isBlocking: false,
        decision: 'HALF_OPEN',
      })},
      { topic: 'provider.circuit_closed', category: 'CIRCUIT', extractor: () => ({
        isBlocking: false,
        decision: 'CLOSED',
      })},

      // Admission events
      { topic: 'provider.admission_allowed', category: 'ADMISSION', extractor: (p) => ({
        decision: p.decision as string | undefined,
        success: true,
        remainingCapacity: p.remainingCapacity as number | undefined,
      })},
      { topic: 'provider.admission_denied', category: 'ADMISSION', extractor: (p) => ({
        decision: p.decision as string | undefined,
        success: false,
        // Do not capture reason — may contain sensitive context
      })},

      // Routing events
      { topic: 'provider.routing_selected', category: 'ROUTING', extractor: (p) => ({
        requestType: p.operation ? 'AI' as const : 'SEARCH' as const,
      })},
      { topic: 'provider.routing_optimized', category: 'ROUTING', extractor: (p) => ({
        requestType: p.requestType as 'AI' | 'SEARCH' | undefined,
        score: p.finalScore as number | undefined,
      })},
      { topic: 'provider.routing_outcome_recorded', category: 'ROUTING', extractor: (p) => ({
        requestType: p.requestType as 'AI' | 'SEARCH' | undefined,
        success: p.success as boolean | undefined,
        durationMs: p.latencyMs as number | undefined,
        score: p.updatedEma as number | undefined,
      })},
      { topic: 'provider.fallback_selected', category: 'ROUTING', extractor: () => ({
        decision: 'FALLBACK',
      })},

      // Execution events
      { topic: 'provider.request_completed', category: 'EXECUTION', extractor: (p) => ({
        success: true,
        requestType: (p.state as string)?.includes('AI') ? 'AI' as const : undefined,
      })},
      { topic: 'provider.request_failed', category: 'EXECUTION', extractor: () => ({
        success: false,
      })},
      { topic: 'provider.request_timeout', category: 'EXECUTION', extractor: () => ({
        success: false,
        errorCode: 'TIMEOUT',
      })},
      { topic: 'provider.request_cancelled', category: 'EXECUTION', extractor: () => ({
        success: false,
        errorCode: 'CANCELLED',
      })},

      // Recovery events
      { topic: 'provider.recovery_probe_started', category: 'RECOVERY', extractor: () => ({
        decision: 'PROBE_STARTED',
      })},
      { topic: 'provider.recovery_probe_succeeded', category: 'RECOVERY', extractor: () => ({
        decision: 'PROBE_SUCCEEDED',
        success: true,
      })},
      { topic: 'provider.recovery_probe_failed', category: 'RECOVERY', extractor: () => ({
        decision: 'PROBE_FAILED',
        success: false,
      })},
    ];

    for (const sub of subscriptions) {
      try {
        const unsub = this.eventBus.subscribe(sub.topic as Parameters<IEventBus['subscribe']>[0], (event: BaseEvent) => {
          this.handleEvent(event, sub.category, sub.extractor);
        });
        this.unsubscribers.push(unsub);
      } catch {
        // Silently skip if topic is not registered — do not crash the extension
      }
    }
  }

  private handleEvent(
    event: BaseEvent,
    category: TelemetryEventCategory,
    extractor: (payload: Record<string, unknown>) => Partial<TelemetryRecord>
  ): void {
    try {
      const payload = (event.payload ?? {}) as Record<string, unknown>;
      const providerId = (payload.providerId as string)
        ?? (payload.failedProviderId as string)
        ?? 'unknown';

      const extracted = extractor(payload);

      const record: TelemetryRecord = {
        id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        category,
        providerId,
        timestamp: event.timestamp ?? Date.now(),
        ...extracted,
      };

      this.appendRecord(record);
    } catch (err) {
      // Telemetry collection must never crash the system
      this.droppedRecords++;
      if (this.eventBus) {
        try {
          this.emitEvent('provider.observability_error', {
            component: 'TelemetryCollector',
            error: err instanceof Error ? err.message : 'Unknown telemetry collection error',
            timestamp: Date.now(),
          });
        } catch {
          // Absolutely cannot throw from telemetry
        }
      }
    }
  }

  // ─── Internal: Ring Buffer ─────────────────────────────────────────

  private appendRecord(record: TelemetryRecord): void {
    const key = record.providerId;
    let buffer = this.buffers.get(key);

    if (!buffer) {
      buffer = [];
      this.buffers.set(key, buffer);
    }

    // Enforce ring buffer bound
    if (buffer.length >= this.policy.maxRecordsPerProvider) {
      buffer.shift();
      this.droppedRecords++;
    }

    buffer.push(record);
    this.totalRecordsCollected++;
    this.lastRecordTimestamp = record.timestamp;
  }

  // ─── Internal: Helpers ─────────────────────────────────────────────

  private unsubscribeAll(): void {
    for (const unsub of this.unsubscribers) {
      try {
        unsub();
      } catch {
        // Ignore unsubscribe errors during shutdown
      }
    }
    this.unsubscribers = [];
  }

  private emitEvent(topic: string, payload: Record<string, unknown>): void {
    if (!this.eventBus) return;
    try {
      this.eventBus.publish(topic as Parameters<IEventBus['publish']>[0], payload).catch(() => {});
    } catch {
      // Never throw from observability
    }
  }
}
