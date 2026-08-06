import { BrowserRuntime } from '../BrowserRuntime';
import { VideoDiscoveryEngine } from '../../video/VideoDiscoveryEngine';
import { VideoLifecycleManager } from '../../video/lifecycle/VideoLifecycleManager';
import { PlaybackTrackingEngine } from '../../video/playback/PlaybackTrackingEngine';
import { ActiveVideoManager } from '../../video/selection/ActiveVideoManager';
import { PipelineStatus } from './IntegrationTypes';
import { IEventBus } from '../../events/IEventBus';

export class BrowserPipeline {
  public readonly runtime: BrowserRuntime;
  public readonly discoveryEngine: VideoDiscoveryEngine;
  public readonly lifecycleManager: VideoLifecycleManager;
  public readonly trackingEngine: PlaybackTrackingEngine;
  public readonly activeVideoManager: ActiveVideoManager;
  private isInitialized = false;
  private isRunning = false;

  constructor(eventBus?: IEventBus) {
    this.runtime = new BrowserRuntime(eventBus);
    this.discoveryEngine = new VideoDiscoveryEngine(eventBus);
    this.lifecycleManager = new VideoLifecycleManager(eventBus);
    this.trackingEngine = new PlaybackTrackingEngine(eventBus);
    this.activeVideoManager = new ActiveVideoManager(eventBus);
  }

  initialize(): void {
    this.isInitialized = true;
  }

  start(): void {
    if (!this.isInitialized) this.initialize();
    this.discoveryEngine.startDiscovery();
    this.isRunning = true;
  }

  stop(): void {
    this.discoveryEngine.stopDiscovery();
    this.isRunning = false;
  }

  getStatus(): PipelineStatus {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      activeVideoId: this.activeVideoManager.getActiveVideoId(),
      discoveredVideosCount: this.discoveryEngine.registry.size(),
      lastScanAt: Date.now(),
      healthy: true
    };
  }
}
