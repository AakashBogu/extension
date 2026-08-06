import { PerformanceMonitor } from './PerformanceMonitor';
import { IEventBus } from '../events/IEventBus';

export class Profiler {
  private monitor: PerformanceMonitor;
  private eventBus?: IEventBus;

  constructor(monitor?: PerformanceMonitor, eventBus?: IEventBus) {
    this.monitor = monitor || new PerformanceMonitor();
    this.eventBus = eventBus;
  }

  async profileScope<T>(scopeName: string, fn: () => T | Promise<T>): Promise<T> {
    const stopTimer = this.monitor.startTimer(scopeName);
    if (this.eventBus) {
      this.eventBus.publish('system.diagnostic', { event: 'ProfilerStarted', scopeName });
    }

    try {
      return await fn();
    } finally {
      const duration = stopTimer();
      if (this.eventBus) {
        this.eventBus.publish('system.diagnostic', { event: 'ProfilerFinished', scopeName, durationMs: duration });
      }
    }
  }

  getMonitor(): PerformanceMonitor {
    return this.monitor;
  }
}
