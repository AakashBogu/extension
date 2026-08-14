import { TabCaptureSessionManager } from './TabCaptureSessionManager';
import { TabCaptureStreamManager } from './TabCaptureStreamManager';
import { TabCapturePermissionManager } from './TabCapturePermissionManager';
import { TabCaptureCapabilityManager } from './TabCaptureCapabilityManager';
import { TabCaptureHealthMonitor } from './TabCaptureHealthMonitor';
import { TabCaptureRecoveryManager } from './TabCaptureRecoveryManager';
import { TabAudioCaptureController } from './TabAudioCaptureController';
import { TabAudioCaptureHarness } from './TabAudioCaptureHarness';
import { TabCaptureSessionRecord, TabCaptureStatus } from './TabAudioCaptureTypes';
import { OffscreenAudioRuntime } from '../../offscreen/OffscreenAudioRuntime';
import { IEventBus } from '../../events/IEventBus';
import { GlobalStateStore } from '../../state/GlobalStateStore';

export class TabAudioCaptureManager {
  public readonly sessionManager: TabCaptureSessionManager;
  public readonly streamManager: TabCaptureStreamManager;
  public readonly permissionManager: TabCapturePermissionManager;
  public readonly capabilityManager: TabCaptureCapabilityManager;
  public readonly healthMonitor: TabCaptureHealthMonitor;
  public readonly recoveryManager: TabCaptureRecoveryManager;
  public readonly controller: TabAudioCaptureController;
  public readonly harness: TabAudioCaptureHarness;

  constructor(
    public readonly offscreenRuntime: OffscreenAudioRuntime,
    private eventBus?: IEventBus,
    private stateStore?: GlobalStateStore
  ) {
    this.sessionManager = new TabCaptureSessionManager();
    this.streamManager = new TabCaptureStreamManager();
    this.permissionManager = new TabCapturePermissionManager();
    this.capabilityManager = new TabCaptureCapabilityManager();
    this.healthMonitor = new TabCaptureHealthMonitor(this.sessionManager, this.streamManager, eventBus);
    this.recoveryManager = new TabCaptureRecoveryManager(this.sessionManager, 5, 100, eventBus);
    this.controller = new TabAudioCaptureController(this.sessionManager, eventBus);
    this.harness = new TabAudioCaptureHarness(this.capabilityManager, this.permissionManager);
  }

  async initialize(): Promise<void> {
    await this.offscreenRuntime.initialize();
  }

  async startCapture(tabId: number, streamMock?: MediaStream): Promise<TabCaptureSessionRecord> {
    const existing = this.sessionManager.getActiveSession();
    if (existing && existing.status === 'ACTIVE' && existing.tabId === tabId) {
      return existing; // Idempotent start
    }

    const session = this.sessionManager.createSession(tabId);
    this.sessionManager.updateSessionStatus(session.sessionId, 'STARTING');

    if (this.eventBus) {
      this.eventBus.publish('audio.capture_requested', { sessionId: session.sessionId, tabId });
    }

    try {
      if (streamMock) {
        const tracks = this.streamManager.registerStream(session.sessionId, streamMock, (_trackId) => {
          if (this.eventBus) this.eventBus.publish('audio.capture_track_ended', { sessionId: session.sessionId });
        });
        session.audioTrackCount = tracks.length;
      } else {
        session.audioTrackCount = 1;
      }

      this.sessionManager.updateSessionStatus(session.sessionId, 'ACTIVE');

      if (this.eventBus) {
        this.eventBus.publish('audio.capture_started', session);
        this.eventBus.publish('audio.capture_active', session);
      }

      this.syncState();
      return session;
    } catch (err) {
      this.sessionManager.updateSessionStatus(session.sessionId, 'ERROR', { error: String(err) });
      if (this.eventBus) this.eventBus.publish('audio.capture_error', { sessionId: session.sessionId, error: String(err) });
      throw err;
    }
  }

  async stopCapture(): Promise<void> {
    const active = this.sessionManager.getActiveSession();
    if (!active || active.status === 'STOPPED') return; // Idempotent stop

    this.sessionManager.updateSessionStatus(active.sessionId, 'STOPPING');
    this.streamManager.releaseStream(active.sessionId);
    this.sessionManager.closeSession(active.sessionId);

    if (this.eventBus) {
      this.eventBus.publish('audio.capture_stopping', { sessionId: active.sessionId });
      this.eventBus.publish('audio.capture_stopped', { sessionId: active.sessionId });
    }

    this.syncState();
  }

  async pauseCapture(): Promise<void> {
    const active = this.sessionManager.getActiveSession();
    if (active && active.status === 'ACTIVE') {
      this.sessionManager.updateSessionStatus(active.sessionId, 'PAUSED');
      if (this.eventBus) this.eventBus.publish('audio.capture_paused', { sessionId: active.sessionId });
      this.syncState();
    }
  }

  async resumeCapture(): Promise<void> {
    const active = this.sessionManager.getActiveSession();
    if (active && active.status === 'PAUSED') {
      this.sessionManager.updateSessionStatus(active.sessionId, 'ACTIVE');
      if (this.eventBus) this.eventBus.publish('audio.capture_resumed', { sessionId: active.sessionId });
      this.syncState();
    }
  }

  getStatus(): TabCaptureStatus {
    const active = this.sessionManager.getActiveSession();
    return active ? active.status : 'IDLE';
  }

  getCurrentSession(): TabCaptureSessionRecord | undefined {
    return this.sessionManager.getActiveSession();
  }

  healthCheck() {
    return this.healthMonitor.checkHealth();
  }

  destroy(): void {
    this.stopCapture();
    this.streamManager.clear();
    this.sessionManager.clear();
  }

  private syncState(): void {
    if (this.stateStore) {
      const session = this.sessionManager.getActiveSession();
      this.stateStore.setState({
        runtime: {
          version: '1.0.0',
          env: 'production',
          isRunning: true,
          startedAt: session ? session.startedAt : Date.now()
        }
      });
    }
  }
}
