import { OffscreenMessage } from './OffscreenRuntimeTypes';
import { OffscreenBridge } from './OffscreenBridge';
import { AudioContextRuntime } from './AudioContextRuntime';

export class OffscreenMessageRouter {
  constructor(
    private bridge: OffscreenBridge,
    private audioRuntime: AudioContextRuntime
  ) {
    this.registerRoutes();
  }

  validateMessage(msg: Partial<OffscreenMessage>): boolean {
    if (!msg || typeof msg !== 'object') return false;
    if (!msg.messageId || !msg.type || !msg.correlationId) return false;
    return true;
  }

  private registerRoutes(): void {
    this.bridge.subscribe('OFFSCREEN_INIT', (_msg) => {
      this.audioRuntime.initialize();
    });

    this.bridge.subscribe('OFFSCREEN_START', async (_msg) => {
      await this.audioRuntime.resume();
    });

    this.bridge.subscribe('OFFSCREEN_STOP', async (_msg) => {
      await this.audioRuntime.suspend();
    });

    this.bridge.subscribe('OFFSCREEN_DESTROY', async (_msg) => {
      await this.audioRuntime.close();
    });
  }
}
