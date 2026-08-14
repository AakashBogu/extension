import { AudioContextState } from './OffscreenRuntimeTypes';
import { AudioContextRuntimeError } from '../error/OffscreenRuntimeErrors';

export class AudioContextRuntime {
  private audioCtx: AudioContext | null = null;
  private state: AudioContextState = 'closed';

  getState(): AudioContextState {
    return this.state;
  }

  initialize(): void {
    if (this.audioCtx) return;

    if (typeof AudioContext !== 'undefined') {
      try {
        this.audioCtx = new AudioContext();
        this.state = this.audioCtx.state as AudioContextState;
      } catch (err) {
        throw new AudioContextRuntimeError(err instanceof Error ? err.message : String(err));
      }
    } else {
      this.state = 'suspended';
    }
  }

  async resume(): Promise<void> {
    if (!this.audioCtx) this.initialize();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
      this.state = 'running';
    } else {
      this.state = 'running';
    }
  }

  async suspend(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      await this.audioCtx.suspend();
      this.state = 'suspended';
    } else {
      this.state = 'suspended';
    }
  }

  async close(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      await this.audioCtx.close();
      this.audioCtx = null;
    }
    this.state = 'closed';
  }
}
