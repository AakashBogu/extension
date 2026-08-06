import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../core/events/EventBus';

describe('Module 1C: EventBus Architecture', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus(50);
  });

  it('should publish and receive subscribed events', async () => {
    let receivedPayload = '';
    eventBus.subscribe<string>('system.state_changed', (evt) => {
      receivedPayload = evt.payload;
    });

    await eventBus.publish('system.state_changed', 'CAPTURING');
    expect(receivedPayload).toBe('CAPTURING');
  });

  it('should honor handler priority ordering (CRITICAL -> HIGH -> NORMAL -> LOW)', async () => {
    const executionOrder: string[] = [];

    eventBus.subscribeWithOptions('claim.detected', () => { executionOrder.push('NORMAL'); }, { priority: 'NORMAL' });
    eventBus.subscribeWithOptions('claim.detected', () => { executionOrder.push('CRITICAL'); }, { priority: 'CRITICAL' });
    eventBus.subscribeWithOptions('claim.detected', () => { executionOrder.push('LOW'); }, { priority: 'LOW' });
    eventBus.subscribeWithOptions('claim.detected', () => { executionOrder.push('HIGH'); }, { priority: 'HIGH' });

    await eventBus.publish('claim.detected', { claimText: 'Test claim' });
    expect(executionOrder).toEqual(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']);
  });

  it('should execute middleware pipeline in sequence', async () => {
    const logs: string[] = [];

    eventBus.use(async (event, next) => {
      logs.push(`before:${event.topic}`);
      await next();
      logs.push(`after:${event.topic}`);
    });

    eventBus.subscribe('verdict.ready', () => {
      logs.push('handler_executed');
    });

    await eventBus.publish('verdict.ready', { claimId: 'c1' });
    expect(logs).toEqual(['before:verdict.ready', 'handler_executed', 'after:verdict.ready']);
  });

  it('should route unhandled events to Dead Letter Queue', async () => {
    await eventBus.publish('cost.alert', { usage: 100 });
    const dlq = eventBus.getDeadLetterQueue();
    expect(dlq.length).toBe(1);
    expect(dlq[0].topic).toBe('cost.alert');
  });

  it('should maintain configurable event history buffer', async () => {
    for (let i = 0; i < 10; i++) {
      await eventBus.publish('system.state_changed', `state_${i}`);
    }
    const history = eventBus.getHistory();
    expect(history.length).toBe(10);
    expect(history[9].payload).toBe('state_9');
  });

  it('should support event cancellation by middleware or metadata', async () => {
    let handlerCalled = false;

    eventBus.use(async (event, next) => {
      if (event.metadata) {
        event.metadata.cancelled = true;
      }
      await next();
    });

    eventBus.subscribe('audio.captured', () => {
      handlerCalled = true;
    });

    await eventBus.publish('audio.captured', { pcm: [] });
    expect(handlerCalled).toBe(false);
  });
});
