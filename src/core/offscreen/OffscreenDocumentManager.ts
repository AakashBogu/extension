import { OffscreenDocumentStatus } from './OffscreenRuntimeTypes';
import { OffscreenCreationError } from '../error/OffscreenRuntimeErrors';
import { IEventBus } from '../events/IEventBus';

export class OffscreenDocumentManager {
  private status: OffscreenDocumentStatus = 'UNAVAILABLE';
  private creatingPromise: Promise<void> | null = null;
  private documentUrl = 'src/offscreen/index.html';

  constructor(private eventBus?: IEventBus) {
    if (this.isOffscreenApiAvailable()) {
      this.status = 'DESTROYED';
    }
  }

  getStatus(): OffscreenDocumentStatus {
    return this.status;
  }

  isOffscreenApiAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.offscreen;
  }

  async hasDocument(): Promise<boolean> {
    if (!this.isOffscreenApiAvailable()) {
      return this.status === 'CREATED' || this.status === 'READY';
    }

    try {
      const offscreen = chrome.offscreen as unknown as { hasDocument?: () => Promise<boolean> };
      const matchedClients = offscreen.hasDocument ? await offscreen.hasDocument() : false;
      return !!matchedClients;
    } catch (_err) {
      return this.status === 'CREATED' || this.status === 'READY';
    }
  }

  async createDocument(): Promise<void> {
    if (this.creatingPromise) {
      return this.creatingPromise;
    }

    if (await this.hasDocument()) {
      this.status = 'READY';
      return;
    }

    this.status = 'CREATING';
    if (this.eventBus) this.eventBus.publish('offscreen.creating', { timestamp: Date.now() });

    this.creatingPromise = (async () => {
      try {
        if (this.isOffscreenApiAvailable()) {
          const reason = (chrome.offscreen.Reason.USER_MEDIA || 'AUDIO_PLAYBACK') as chrome.offscreen.Reason;
          await chrome.offscreen.createDocument({
            url: this.documentUrl,
            reasons: [reason],
            justification: 'Real-time audio stream ingestion for speech fact-checking'
          });
        }
        this.status = 'CREATED';
        if (this.eventBus) this.eventBus.publish('offscreen.created', { timestamp: Date.now() });
      } catch (err) {
        this.status = 'ERROR';
        if (this.eventBus) this.eventBus.publish('offscreen.error', { error: String(err) });
        throw new OffscreenCreationError(err instanceof Error ? err.message : String(err));
      } finally {
        this.creatingPromise = null;
      }
    })();

    return this.creatingPromise;
  }

  async closeDocument(): Promise<void> {
    this.status = 'STOPPING';
    try {
      if (this.isOffscreenApiAvailable()) {
        await chrome.offscreen.closeDocument();
      }
      this.status = 'DESTROYED';
      if (this.eventBus) this.eventBus.publish('offscreen.destroyed', { timestamp: Date.now() });
    } catch (err) {
      this.status = 'ERROR';
      throw new OffscreenCreationError(`Close document failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
