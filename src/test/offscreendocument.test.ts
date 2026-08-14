import { describe, it, expect, beforeEach } from 'vitest';
import { OffscreenDocumentManager } from '../core/offscreen/OffscreenDocumentManager';
import { AudioContextRuntime } from '../core/offscreen/AudioContextRuntime';
import { EventBus } from '../core/events/EventBus';

describe('Module 3A: OffscreenDocumentManager & AudioContextRuntime', () => {
  let docManager: OffscreenDocumentManager;
  let audioRuntime: AudioContextRuntime;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    docManager = new OffscreenDocumentManager(eventBus);
    audioRuntime = new AudioContextRuntime();
  });

  it('should create document and prevent duplicate creation requests', async () => {
    let createdEvent = false;
    eventBus.subscribe('offscreen.created', () => { createdEvent = true; });

    await docManager.createDocument();
    expect(docManager.getStatus()).toBe('CREATED');
    expect(createdEvent).toBe(true);

    // Concurrent call reuse
    await docManager.createDocument();
    expect(docManager.getStatus()).toBe('CREATED');
  });

  it('should initialize and transition AudioContext states cleanly', async () => {
    audioRuntime.initialize();
    expect(audioRuntime.getState()).toBe('suspended');

    await audioRuntime.resume();
    expect(audioRuntime.getState()).toBe('running');

    await audioRuntime.suspend();
    expect(audioRuntime.getState()).toBe('suspended');

    await audioRuntime.close();
    expect(audioRuntime.getState()).toBe('closed');
  });
});
