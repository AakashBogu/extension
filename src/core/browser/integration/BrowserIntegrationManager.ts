import { BrowserPipeline } from './BrowserPipeline';
import { BrowserHealthMonitor } from './BrowserHealthMonitor';
import { BrowserCleanupManager } from './BrowserCleanupManager';
import { BrowserCompatibilityManager } from './BrowserCompatibilityManager';
import { BrowserPerformanceManager } from './BrowserPerformanceManager';
import { BrowserValidationManager } from './BrowserValidationManager';
import { DeveloperValidationHarness } from './DeveloperValidationHarness';
import { IEventBus } from '../../events/IEventBus';

export class BrowserIntegrationManager {
  public readonly pipeline: BrowserPipeline;
  public readonly healthMonitor: BrowserHealthMonitor;
  public readonly cleanupManager: BrowserCleanupManager;
  public readonly compatibilityManager: BrowserCompatibilityManager;
  public readonly performanceManager: BrowserPerformanceManager;
  public readonly validationManager: BrowserValidationManager;
  public readonly developerHarness: DeveloperValidationHarness;

  constructor(eventBus?: IEventBus) {
    this.pipeline = new BrowserPipeline(eventBus);
    this.healthMonitor = new BrowserHealthMonitor(this.pipeline.discoveryEngine.registry, this.pipeline.activeVideoManager, eventBus);
    this.cleanupManager = new BrowserCleanupManager(this.pipeline.discoveryEngine.registry, this.pipeline.trackingEngine.snapshotManager);
    this.compatibilityManager = new BrowserCompatibilityManager();
    this.performanceManager = new BrowserPerformanceManager();
    this.validationManager = new BrowserValidationManager();
    this.developerHarness = new DeveloperValidationHarness(this);
  }

  boot(): void {
    const compat = this.compatibilityManager.checkCompatibility();
    if (!compat.hasIntersectionObserver) {
      // Graceful fallback logging
    }

    this.pipeline.start();
  }

  shutdown(): void {
    this.pipeline.stop();
    this.cleanupManager.cleanupDetachedVideos();
  }

  getPipelineStatus() {
    return this.pipeline.getStatus();
  }
}
