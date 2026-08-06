import { describe, it, expect } from 'vitest';
import { PriorityEventQueue } from '../core/events/EventQueue';
import { BaseEvent } from '../core/events/EventTypes';

describe('Module 1C: Priority Event Queue', () => {
  it('should sort queued events by priority then timestamp FIFO', () => {
    const queue = new PriorityEventQueue(100);

    const evtLow: BaseEvent = { id: '1', topic: 'audio.captured', timestamp: 100, payload: null, metadata: { priority: 'LOW' } };
    const evtHigh: BaseEvent = { id: '2', topic: 'claim.detected', timestamp: 105, payload: null, metadata: { priority: 'HIGH' } };
    const evtCritical: BaseEvent = { id: '3', topic: 'cost.alert', timestamp: 110, payload: null, metadata: { priority: 'CRITICAL' } };

    queue.enqueue(evtLow);
    queue.enqueue(evtHigh);
    queue.enqueue(evtCritical);

    expect(queue.dequeue()?.id).toBe('3'); // CRITICAL first
    expect(queue.dequeue()?.id).toBe('2'); // HIGH second
    expect(queue.dequeue()?.id).toBe('1'); // LOW last
  });

  it('should trigger backpressure callback when exceeding capacity', () => {
    let backpressureTriggered = false;
    const queue = new PriorityEventQueue(2, () => {
      backpressureTriggered = true;
    });

    const evt: BaseEvent = { id: '1', topic: 'audio.captured', timestamp: 100, payload: null };
    queue.enqueue(evt);
    queue.enqueue(evt);
    queue.enqueue(evt);

    expect(backpressureTriggered).toBe(true);
  });
});
