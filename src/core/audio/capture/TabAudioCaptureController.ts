import { IEventBus } from '../../events/IEventBus';
import { TabCaptureSessionManager } from './TabCaptureSessionManager';
import { BaseEvent } from '../../events/EventTypes';

export class TabAudioCaptureController {
  constructor(
    private sessionManager: TabCaptureSessionManager,
    private eventBus?: IEventBus
  ) {
    this.registerEventSubscribers();
  }

  private registerEventSubscribers(): void {
    if (!this.eventBus) return;

    this.eventBus.subscribe('tab.removed', (event: BaseEvent<{ tabId?: number }>) => {
      const activeSession = this.sessionManager.getActiveSession();
      if (activeSession && activeSession.tabId === event.payload?.tabId) {
        this.eventBus?.publish('audio.capture_tab_invalid', { tabId: activeSession.tabId, sessionId: activeSession.sessionId });
      }
    });

    this.eventBus.subscribe('active_video.changed', (_event: BaseEvent<unknown>) => {
      const activeSession = this.sessionManager.getActiveSession();
      if (activeSession) {
        // Update context metadata without destroying stream
      }
    });
  }
}
