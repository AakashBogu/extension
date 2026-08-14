import { AudioContextRuntime } from './AudioContextRuntime';
import { OffscreenDocumentManager } from './OffscreenDocumentManager';
import { OffscreenDocumentStatus, AudioContextState } from './OffscreenRuntimeTypes';

export class OffscreenAudioRuntime {
  constructor(
    public readonly docManager: OffscreenDocumentManager,
    public readonly audioRuntime: AudioContextRuntime
  ) {}

  async initialize(): Promise<void> {
    await this.docManager.createDocument();
    this.audioRuntime.initialize();
  }

  async start(): Promise<void> {
    await this.initialize();
    await this.audioRuntime.resume();
  }

  async stop(): Promise<void> {
    await this.audioRuntime.suspend();
  }

  async suspend(): Promise<void> {
    await this.audioRuntime.suspend();
  }

  async resume(): Promise<void> {
    await this.audioRuntime.resume();
  }

  async destroy(): Promise<void> {
    await this.audioRuntime.close();
    await this.docManager.closeDocument();
  }

  getStatus(): { docStatus: OffscreenDocumentStatus; audioState: AudioContextState } {
    return {
      docStatus: this.docManager.getStatus(),
      audioState: this.audioRuntime.getState()
    };
  }
}
