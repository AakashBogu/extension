import { describe, it, expect, beforeEach } from 'vitest';
import { TabAudioCaptureManager } from '../core/audio/capture/TabAudioCaptureManager';
import { OffscreenAudioRuntime } from '../core/offscreen/OffscreenAudioRuntime';
import { OffscreenDocumentManager } from '../core/offscreen/OffscreenDocumentManager';
import { AudioContextRuntime } from '../core/audio/capture/../../../core/offscreen/AudioContextRuntime';
import { EventBus } from '../core/events/EventBus';

describe('Module 3B: TabAudioCaptureManager Facade', () => {
  let captureManager: TabAudioCaptureManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    const docManager = new OffscreenDocumentManager(eventBus);
    const audioRuntime = new AudioContextRuntime();
    const offscreen = new OffscreenAudioRuntime(docManager, audioRuntime);

    captureManager = new TabAudioCaptureManager(offscreen, eventBus);
  });

  it('should start, pause, resume, and stop tab capture idempotently', async () => {
    let captureStarted = false;
    let captureStopped = false;

    eventBus.subscribe('audio.capture_started', () => { captureStarted = true; });
    eventBus.subscribe('audio.capture_stopped', () => { captureStopped = true; });

    const session = await captureManager.startCapture(101);
    expect(session.status).toBe('ACTIVE');
    expect(captureStarted).toBe(true);

    // Idempotent start
    const sameSession = await captureManager.startCapture(101);
    expect(sameSession.sessionId).toBe(session.sessionId);

    await captureManager.pauseCapture();
    expect(captureManager.getStatus()).toBe('PAUSED');

    await captureManager.resumeCapture();
    expect(captureManager.getStatus()).toBe('ACTIVE');

    await captureManager.stopCapture();
    expect(captureManager.getStatus()).toBe('IDLE');
    expect(captureStopped).toBe(true);

    // Idempotent stop
    await captureManager.stopCapture();
    expect(captureManager.getStatus()).toBe('IDLE');
  });
});
