import { TabCaptureSessionManager } from './TabCaptureSessionManager';
import { TabCaptureStreamManager } from './TabCaptureStreamManager';
import { TabCaptureSessionRecord } from './TabAudioCaptureTypes';
import { IEventBus } from '../../events/IEventBus';

export class TabCaptureHealthMonitor {
  constructor(
    private sessionManager: TabCaptureSessionManager,
    private streamManager: TabCaptureStreamManager,
    private eventBus?: IEventBus
  ) {}

  checkHealth(): { status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'; session?: TabCaptureSessionRecord } {
    const session = this.sessionManager.getActiveSession();

    if (!session || session.status === 'IDLE' || session.status === 'STOPPED') {
      return { status: 'HEALTHY', session };
    }

    if (session.status === 'ERROR') {
      const report = { status: 'UNHEALTHY' as const, session };
      if (this.eventBus) this.eventBus.publish('audio.capture_health_changed', report);
      return report;
    }

    const stream = this.streamManager.getStream(session.sessionId);
    if (!stream || stream.getAudioTracks().length === 0) {
      const report = { status: 'UNHEALTHY' as const, session };
      if (this.eventBus) this.eventBus.publish('audio.capture_health_changed', report);
      return report;
    }

    const liveTrack = stream.getAudioTracks().find(t => t.readyState === 'live');
    if (!liveTrack) {
      const report = { status: 'DEGRADED' as const, session };
      if (this.eventBus) this.eventBus.publish('audio.capture_health_changed', report);
      return report;
    }

    const report = { status: 'HEALTHY' as const, session };
    if (this.eventBus) this.eventBus.publish('audio.capture_health_changed', report);
    return report;
  }
}
