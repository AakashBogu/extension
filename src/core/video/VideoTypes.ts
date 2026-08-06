export interface DiscoveredVideoMetadata {
  id: string;
  src: string;
  currentSrc: string;
  poster: string;
  width: number;
  height: number;
  readyState: number;
  networkState: number;
  preload: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  crossOrigin: string | null;
  discoveredAt: number;
  isShadowDom: boolean;
}

export interface VideoDiscoveryConfig {
  autoDiscoveryEnabled: boolean;
  discoveryIntervalMs: number;
  mutationDebounceMs: number;
  scanShadowDom: boolean;
  maxRegistrySize: number;
}
