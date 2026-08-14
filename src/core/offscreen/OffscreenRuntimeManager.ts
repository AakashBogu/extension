import { OffscreenAudioRuntime } from './OffscreenAudioRuntime';
import { OffscreenDocumentManager } from './OffscreenDocumentManager';
import { AudioContextRuntime } from './AudioContextRuntime';
import { OffscreenBridge } from './OffscreenBridge';
import { OffscreenCapabilityManager } from './OffscreenCapabilityManager';
import { OffscreenHealthMonitor } from './OffscreenHealthMonitor';
import { OffscreenMessageRouter } from './OffscreenMessageRouter';
import { OffscreenRecoveryManager } from './OffscreenRecoveryManager';
import { IEventBus } from '../events/IEventBus';
import { GlobalStateStore } from '../state/GlobalStateStore';

export class OffscreenRuntimeManager {
  public readonly docManager: OffscreenDocumentManager;
  public readonly audioRuntime: AudioContextRuntime;
  public readonly bridge: OffscreenBridge;
  public readonly capabilityManager: OffscreenCapabilityManager;
  public readonly healthMonitor: OffscreenHealthMonitor;
  public readonly messageRouter: OffscreenMessageRouter;
  public readonly recoveryManager: OffscreenRecoveryManager;
  public readonly runtime: OffscreenAudioRuntime;

  constructor(eventBus?: IEventBus, stateStore?: GlobalStateStore) {
    this.docManager = new OffscreenDocumentManager(eventBus);
    this.audioRuntime = new AudioContextRuntime();
    this.bridge = new OffscreenBridge();
    this.capabilityManager = new OffscreenCapabilityManager();
    this.healthMonitor = new OffscreenHealthMonitor(this.docManager, this.audioRuntime, this.bridge, this.capabilityManager, eventBus);
    this.messageRouter = new OffscreenMessageRouter(this.bridge, this.audioRuntime);
    this.recoveryManager = new OffscreenRecoveryManager(this.docManager, this.audioRuntime, 5, 100, eventBus);
    this.runtime = new OffscreenAudioRuntime(this.docManager, this.audioRuntime);

    if (stateStore) {
      this.syncState(stateStore);
    }
  }

  private syncState(stateStore: GlobalStateStore): void {
    stateStore.setState({
      runtime: {
        version: '1.0.0',
        env: 'production',
        isRunning: true,
        startedAt: Date.now()
      }
    });
  }
}
