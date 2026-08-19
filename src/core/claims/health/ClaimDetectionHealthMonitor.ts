import { IEventBus } from '../../events/IEventBus';

export class ClaimDetectionHealthMonitor {
  constructor(private eventBus?: IEventBus) {}

  async checkHealth(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'; details: Record<string, unknown> }> {
    const report = { status: 'HEALTHY' as 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY', details: { ready: true } };
    if (this.eventBus) {
      this.eventBus.publish('claim.health_changed', report);
    }
    return report;
  }
}
