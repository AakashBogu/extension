import { OffscreenDocumentManager } from './OffscreenDocumentManager';
import { AudioContextRuntime } from './AudioContextRuntime';
import { OffscreenBridge } from './OffscreenBridge';
import { OffscreenCapabilityManager } from './OffscreenCapabilityManager';
import { IEventBus } from '../events/IEventBus';

export class OffscreenHealthMonitor {
  private lastHeartbeat = Date.now();

  constructor(
    private docManager: OffscreenDocumentManager,
    private audioRuntime: AudioContextRuntime,
    private bridge: OffscreenBridge,
    private capabilityManager: OffscreenCapabilityManager,
    private eventBus?: IEventBus
  ) {}

  recordHeartbeat(): void {
    this.lastHeartbeat = Date.now();
    if (this.eventBus) {
      this.eventBus.publish('offscreen.heartbeat', { timestamp: this.lastHeartbeat });
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    const bridgeHealthy = await this.bridge.healthCheck();
    const docStatus = this.docManager.getStatus();
    const audioState = this.audioRuntime.getState();
    const capabilities = this.capabilityManager.detectCapabilities();

    const healthy = (docStatus === 'READY' || docStatus === 'CREATED') && audioState !== 'closed';

    const details = {
      docStatus,
      audioState,
      bridgeHealthy,
      lastHeartbeat: this.lastHeartbeat,
      capabilities
    };

    if (this.eventBus) {
      this.eventBus.publish('offscreen.health_changed', { healthy, details });
    }

    return { healthy, details };
  }
}
