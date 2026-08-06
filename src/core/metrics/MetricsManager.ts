import { IEventBus } from '../events/IEventBus';

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timer';

export interface MetricEntry {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

export class MetricsManager {
  private metrics = new Map<string, MetricEntry>();
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus;
  }

  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const existing = this.metrics.get(name);
    const currentVal = existing ? existing.value : 0;
    this.recordMetric(name, 'counter', currentVal + value, labels);
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, 'gauge', value, labels);
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, 'histogram', value, labels);
  }

  recordTimer(name: string, durationMs: number, labels?: Record<string, string>): void {
    this.recordMetric(name, 'timer', durationMs, labels);
  }

  getMetric(name: string): MetricEntry | undefined {
    return this.metrics.get(name);
  }

  getMetricsSummary(): MetricEntry[] {
    return Array.from(this.metrics.values());
  }

  private recordMetric(name: string, type: MetricType, value: number, labels?: Record<string, string>): void {
    const entry: MetricEntry = {
      name,
      type,
      value,
      labels,
      timestamp: Date.now()
    };
    this.metrics.set(name, entry);

    if (this.eventBus) {
      this.eventBus.publish('system.diagnostic', entry);
    }
  }
}
