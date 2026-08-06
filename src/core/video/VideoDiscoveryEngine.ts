import { VideoLocator } from './VideoLocator';
import { VideoMetadataExtractor } from './VideoMetadataExtractor';
import { VideoRegistry } from './VideoRegistry';
import { VideoScanner } from './VideoScanner';
import { VideoObserver } from './VideoObserver';
import { IEventBus } from '../events/IEventBus';
import { GlobalStateStore } from '../state/GlobalStateStore';
import { VideoDiscoveryConfig } from './VideoTypes';

export class VideoDiscoveryEngine {
  public readonly locator: VideoLocator;
  public readonly extractor: VideoMetadataExtractor;
  public readonly registry: VideoRegistry;
  public readonly scanner: VideoScanner;
  public readonly observer: VideoObserver;
  private config: VideoDiscoveryConfig;

  constructor(eventBus?: IEventBus, stateStore?: GlobalStateStore, config?: Partial<VideoDiscoveryConfig>) {
    this.config = {
      autoDiscoveryEnabled: true,
      discoveryIntervalMs: 2000,
      mutationDebounceMs: 250,
      scanShadowDom: true,
      maxRegistrySize: 50,
      ...config
    };

    this.locator = new VideoLocator();
    this.extractor = new VideoMetadataExtractor();
    this.registry = new VideoRegistry(this.config.maxRegistrySize, eventBus);
    this.scanner = new VideoScanner(this.locator, this.extractor, this.registry);
    this.observer = new VideoObserver();

    if (stateStore) {
      this.syncState(stateStore);
    }
  }

  startDiscovery(): void {
    if (!this.config.autoDiscoveryEnabled) return;

    this.scanner.scan(document, this.config.scanShadowDom);

    this.observer.startObserving(document.body || document.documentElement, (added, removed) => {
      added.forEach(el => {
        const meta = this.extractor.extractMetadata(el);
        this.registry.registerVideo(el, meta);
      });
      removed.forEach(_el => {
        // Handle removal cleanup if ID attached
      });
    });
  }

  stopDiscovery(): void {
    this.observer.stopObserving();
  }

  private syncState(stateStore: GlobalStateStore): void {
    stateStore.subscribe(() => {
      // Sync video slice if needed
    });
  }
}
