import { RecognitionSessionManager } from '../session/RecognitionSessionManager';
import { SpeechProviderRouter } from '../provider/SpeechProviderRouter';
import { IEventBus } from '../../events/IEventBus';

export class SpeechRecognitionHealthMonitor {
  constructor(
    private sessionManager: RecognitionSessionManager,
    private router: SpeechProviderRouter,
    private eventBus?: IEventBus
  ) {}

  async checkHealth(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'; details: Record<string, unknown> }> {
    const activeSession = this.sessionManager.getActiveSession();
    let providerHealthy = true;

    try {
      const provider = this.router.selectProvider(activeSession?.providerId);
      const pHealth = await provider.healthCheck();
      providerHealthy = pHealth.ready;
    } catch (_err) {
      providerHealthy = false;
    }

    const status = providerHealthy ? 'HEALTHY' : 'DEGRADED';
    const report = { status: status as 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY', details: { activeSession, providerHealthy } };

    if (this.eventBus) {
      this.eventBus.publish('speech.health_changed', report);
    }

    return report;
  }
}
