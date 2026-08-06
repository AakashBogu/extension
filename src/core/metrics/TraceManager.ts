import { IEventBus } from '../events/IEventBus';

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  tags?: Record<string, string>;
}

export class TraceManager {
  private activeSpans = new Map<string, Span>();
  private completedSpans: Span[] = [];
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus;
  }

  startSpan(name: string, parentSpanId?: string): Span {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const traceId = parentSpanId && this.activeSpans.has(parentSpanId)
      ? this.activeSpans.get(parentSpanId)!.traceId
      : `trace_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      name,
      startTime: Date.now()
    };

    this.activeSpans.set(spanId, span);
    if (this.eventBus) {
      this.eventBus.publish('system.diagnostic', { event: 'TraceStarted', span });
    }

    return span;
  }

  finishSpan(spanId: string, tags?: Record<string, string>): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    if (tags) span.tags = { ...span.tags, ...tags };

    this.activeSpans.delete(spanId);
    this.completedSpans.push(span);

    if (this.eventBus) {
      this.eventBus.publish('system.diagnostic', { event: 'TraceFinished', span });
    }

    return span;
  }

  getCompletedSpans(): Span[] {
    return [...this.completedSpans];
  }
}
