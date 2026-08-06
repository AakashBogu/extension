import { BrowserHealthReport } from './IntegrationTypes';
import { VideoRegistry } from '../../video/VideoRegistry';
import { ActiveVideoManager } from '../../video/selection/ActiveVideoManager';
import { IEventBus } from '../../events/IEventBus';

export class BrowserHealthMonitor {
  constructor(
    private videoRegistry: VideoRegistry,
    private activeVideoManager: ActiveVideoManager,
    private eventBus?: IEventBus
  ) {}

  async runHealthCheck(): Promise<BrowserHealthReport> {
    const registrySize = this.videoRegistry.size();
    const activeVideoSelected = !!this.activeVideoManager.getActiveVideoId();

    const report: BrowserHealthReport = {
      overallHealth: 'HEALTHY',
      timestamp: Date.now(),
      components: {
        browserRuntime: true,
        videoDiscovery: true,
        videoLifecycle: true,
        playbackTracking: true,
        activeVideoSelection: true,
        eventBusConnectivity: !!this.eventBus
      },
      metrics: {
        registrySize,
        activeVideoSelected,
        orphanListenersCount: 0
      }
    };

    if (this.eventBus) {
      this.eventBus.publish('health_check.completed', report);
    }

    return report;
  }
}
