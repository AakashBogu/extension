import { IEventBus, EventHandler } from './IEventBus';
import { BaseEvent, EventPriority, EventTopic } from './EventTypes';
import { MiddlewarePipeline, EventMiddleware } from './EventMiddleware';
import { PriorityEventQueue } from './EventQueue';

export interface SubscriptionOptions {
  priority?: EventPriority;
  filter?: (event: BaseEvent) => boolean;
}

export interface SubscriberEntry {
  handler: EventHandler<unknown>;
  priority: EventPriority;
  filter?: (event: BaseEvent) => boolean;
}

export interface EventBusDiagnostics {
  eventsPublishedCount: number;
  eventsHandledCount: number;
  failedHandlersCount: number;
  deadLetterCount: number;
  lastDispatchLatencyMs: number;
}

export class EventBus implements IEventBus {
  private subscribers = new Map<EventTopic, SubscriberEntry[]>();
  private pipeline = new MiddlewarePipeline();
  private deadLetterQueue: BaseEvent[] = [];
  private historyBuffer: BaseEvent[] = [];
  private historyCapacity: number;
  private queue = new PriorityEventQueue();

  private diagnostics: EventBusDiagnostics = {
    eventsPublishedCount: 0,
    eventsHandledCount: 0,
    failedHandlersCount: 0,
    deadLetterCount: 0,
    lastDispatchLatencyMs: 0
  };

  constructor(historyCapacity: number = 100) {
    this.historyCapacity = historyCapacity;
  }

  use(middleware: EventMiddleware): void {
    this.pipeline.use(middleware);
  }

  subscribe<T>(topic: EventTopic, handler: EventHandler<T>): () => void {
    return this.subscribeWithOptions(topic, handler, { priority: 'NORMAL' });
  }

  subscribeWithOptions<T>(
    topic: EventTopic,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    const entries = this.subscribers.get(topic)!;
    const entry: SubscriberEntry = {
      handler: handler as EventHandler<unknown>,
      priority: options.priority || 'NORMAL',
      filter: options.filter
    };

    entries.push(entry);
    this.sortSubscribers(topic);

    return () => {
      const current = this.subscribers.get(topic);
      if (current) {
        this.subscribers.set(
          topic,
          current.filter(e => e.handler !== handler)
        );
      }
    };
  }

  async publish<T>(topic: EventTopic, payload: T, metadata?: Record<string, unknown>): Promise<void> {
    const event: BaseEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic,
      timestamp: Date.now(),
      payload,
      metadata: {
        priority: 'NORMAL',
        cancelled: false,
        ...metadata
      }
    };

    this.recordHistory(event);
    this.diagnostics.eventsPublishedCount++;

    const startMs = Date.now();

    await this.pipeline.execute(event, async () => {
      if (event.metadata?.cancelled) return;

      const handlers = this.subscribers.get(topic) || [];
      if (handlers.length === 0) {
        this.deadLetterQueue.push(event);
        this.diagnostics.deadLetterCount++;
        return;
      }

      for (const subscriber of handlers) {
        if (event.metadata?.cancelled) break;

        if (subscriber.filter && !subscriber.filter(event)) {
          continue;
        }

        try {
          await subscriber.handler(event);
          this.diagnostics.eventsHandledCount++;
        } catch (err) {
          this.diagnostics.failedHandlersCount++;
          this.deadLetterQueue.push(event);
          this.diagnostics.deadLetterCount++;
        }
      }
    });

    this.diagnostics.lastDispatchLatencyMs = Date.now() - startMs;
  }

  unsubscribeAll(topic?: EventTopic): void {
    if (topic) {
      this.subscribers.delete(topic);
    } else {
      this.subscribers.clear();
    }
  }

  getDeadLetterQueue(): BaseEvent[] {
    return [...this.deadLetterQueue];
  }

  getHistory(): BaseEvent[] {
    return [...this.historyBuffer];
  }

  getDiagnostics(): EventBusDiagnostics {
    return { ...this.diagnostics };
  }

  getQueue(): PriorityEventQueue {
    return this.queue;
  }

  private recordHistory(event: BaseEvent): void {
    if (this.historyBuffer.length >= this.historyCapacity) {
      this.historyBuffer.shift();
    }
    this.historyBuffer.push(event);
  }

  private sortSubscribers(topic: EventTopic): void {
    const entries = this.subscribers.get(topic);
    if (!entries) return;

    const prioOrder: Record<EventPriority, number> = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
    entries.sort((a, b) => prioOrder[b.priority] - prioOrder[a.priority]);
  }
}
