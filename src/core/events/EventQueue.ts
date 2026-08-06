import { BaseEvent, EventPriority } from './EventTypes';

export interface QueueItem {
  event: BaseEvent;
  dispatchTime: number;
}

const PRIORITY_MAP: Record<EventPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1
};

export class PriorityEventQueue {
  private items: QueueItem[] = [];
  private maxCapacity: number;
  private onBackpressure?: (queueLength: number) => void;

  constructor(maxCapacity: number = 1000, onBackpressure?: (queueLength: number) => void) {
    this.maxCapacity = maxCapacity;
    this.onBackpressure = onBackpressure;
  }

  enqueue(event: BaseEvent, delayMs: number = 0): void {
    if (this.items.length >= this.maxCapacity) {
      if (this.onBackpressure) {
        this.onBackpressure(this.items.length);
      }
      this.items.shift(); // Drop oldest low-priority item under pressure
    }

    const dispatchTime = Date.now() + delayMs;
    this.items.push({ event, dispatchTime });
    this.sortQueue();
  }

  dequeue(): BaseEvent | undefined {
    const now = Date.now();
    const readyIndex = this.items.findIndex(item => item.dispatchTime <= now);
    if (readyIndex === -1) return undefined;

    const [readyItem] = this.items.splice(readyIndex, 1);
    return readyItem.event;
  }

  peekNext(): BaseEvent | undefined {
    const ready = this.items.find(item => item.dispatchTime <= Date.now());
    return ready?.event;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  private sortQueue(): void {
    this.items.sort((a, b) => {
      const prioA = PRIORITY_MAP[a.event.metadata?.priority || 'NORMAL'];
      const prioB = PRIORITY_MAP[b.event.metadata?.priority || 'NORMAL'];
      if (prioA !== prioB) {
        return prioB - prioA; // Higher priority first
      }
      return a.event.timestamp - b.event.timestamp; // FIFO for same priority
    });
  }
}
