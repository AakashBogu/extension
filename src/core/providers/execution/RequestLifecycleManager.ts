import { RequestLifecycleState, ProviderRequestStatus } from './ProviderExecutionTypes';
import { ProviderExecutionStateError } from '../../error/ProviderExecutionErrors';
import { IEventBus } from '../../events/IEventBus';
import { EventTopic } from '../../events/EventTypes';

export class RequestLifecycleManager {
  private requests = new Map<string, ProviderRequestStatus>();

  constructor(
    private retentionLimit: number = 100,
    private eventBus?: IEventBus
  ) {}

  createRecord(requestId: string, requestType: 'AI' | 'SEARCH', timeoutMs: number): ProviderRequestStatus {
    const record: ProviderRequestStatus = {
      requestId,
      requestType,
      state: 'CREATED',
      createdAt: Date.now(),
      attemptCount: 0,
      timeoutMs,
      cancelled: false
    };

    this.requests.set(requestId, record);
    this.enforceRetentionLimit();

    if (this.eventBus) {
      this.eventBus.publish('provider.request_created', { requestId, requestType, timestamp: Date.now() });
    }

    return record;
  }

  transitionTo(requestId: string, targetState: RequestLifecycleState, metadata: { providerId?: string; error?: string } = {}): void {
    const record = this.requests.get(requestId);
    if (!record) {
      throw new ProviderExecutionStateError(`Cannot transition non-existent request [${requestId}]`, { requestId });
    }

    // Validate state transitions
    if (record.state === 'COMPLETED' || record.state === 'FAILED' || record.state === 'CANCELLED') {
      throw new ProviderExecutionStateError(`Cannot transition terminal request [${requestId}] from state [${record.state}] to [${targetState}]`, { requestId });
    }

    record.state = targetState;
    if (metadata.providerId) record.providerId = metadata.providerId;
    if (metadata.error) record.error = metadata.error;

    if (targetState === 'EXECUTING' && !record.startedAt) {
      record.startedAt = Date.now();
    } else if (targetState === 'COMPLETED' || targetState === 'FAILED' || targetState === 'CANCELLED' || targetState === 'TIMED_OUT') {
      record.completedAt = Date.now();
    }

    if (targetState === 'CANCELLED') {
      record.cancelled = true;
    }

    if (this.eventBus) {
      const topicMap: Record<string, EventTopic> = {
        QUEUED: 'provider.request_queued',
        ROUTING: 'provider.request_routing',
        EXECUTING: 'provider.request_started',
        RETRYING: 'provider.request_retrying',
        FALLBACK: 'provider.request_fallback',
        COMPLETED: 'provider.request_completed',
        FAILED: 'provider.request_failed',
        CANCELLED: 'provider.request_cancelled',
        TIMED_OUT: 'provider.request_timeout'
      };

      const topic = topicMap[targetState];
      if (topic) {
        this.eventBus.publish(topic, { requestId, state: targetState, providerId: record.providerId, timestamp: Date.now() });
      }
    }
  }

  getRecord(requestId: string): ProviderRequestStatus | undefined {
    return this.requests.get(requestId);
  }

  getActiveRecords(): ProviderRequestStatus[] {
    return Array.from(this.requests.values()).filter(
      r => r.state !== 'COMPLETED' && r.state !== 'FAILED' && r.state !== 'CANCELLED' && r.state !== 'TIMED_OUT'
    );
  }

  private enforceRetentionLimit(): void {
    if (this.requests.size <= this.retentionLimit) return;
    const completed = Array.from(this.requests.values())
      .filter(r => r.state === 'COMPLETED' || r.state === 'FAILED' || r.state === 'CANCELLED' || r.state === 'TIMED_OUT')
      .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));

    const removeCount = this.requests.size - this.retentionLimit;
    for (let i = 0; i < removeCount && i < completed.length; i++) {
      this.requests.delete(completed[i].requestId);
    }
  }

  clear(): void {
    this.requests.clear();
  }
}
