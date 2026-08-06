export interface PipelineStatus {
  isInitialized: boolean;
  isRunning: boolean;
  activeVideoId: string | null;
  discoveredVideosCount: number;
  lastScanAt: number;
  healthy: boolean;
}

export interface BrowserHealthReport {
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: number;
  components: {
    browserRuntime: boolean;
    videoDiscovery: boolean;
    videoLifecycle: boolean;
    playbackTracking: boolean;
    activeVideoSelection: boolean;
    eventBusConnectivity: boolean;
  };
  metrics: {
    registrySize: number;
    activeVideoSelected: boolean;
    orphanListenersCount: number;
  };
}

export interface CompatibilityReport {
  isSupported: boolean;
  browserVendor: string;
  hasShadowDomSupport: boolean;
  hasIntersectionObserver: boolean;
  hasOffscreenSupport: boolean;
  hasTabCaptureSupport: boolean;
}

export interface PerformanceReport {
  timestamp: number;
  discoveryLatencyMs: number;
  selectionLatencyMs: number;
  activeListenersCount: number;
  memoryUsageEstimateBytes: number;
}
