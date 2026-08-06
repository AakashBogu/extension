import { describe, it, expect } from 'vitest';
import { ChromeMessagingBridge } from '../core/messaging/ChromeMessagingBridge';
import { BaseEvent } from '../core/events/EventTypes';

describe('Module 1C: Messaging Bridge Abstraction', () => {
  it('should serialize and deserialize event payloads cleanly', () => {
    const bridge = new ChromeMessagingBridge();
    const original = { text: 'Claim text sample', confidence: 0.95 };
    const serialized = bridge.serialize(original);
    const deserialized = bridge.deserialize<{ text: string; confidence: number }>(serialized);

    expect(deserialized.text).toBe(original.text);
    expect(deserialized.confidence).toBe(0.95);
  });

  it('should route message bridge context handlers', async () => {
    const bridge = new ChromeMessagingBridge();
    let receivedCtx = '';

    bridge.onMessage((_msg, ctx) => {
      receivedCtx = ctx;
    });

    const testEvt: BaseEvent = {
      id: 'e1',
      topic: 'verdict.ready',
      timestamp: Date.now(),
      payload: { claimId: 'c1' }
    };

    await bridge.sendMessage('content_script', testEvt);
    expect(receivedCtx).toBe('content_script');
  });
});
