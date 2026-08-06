import { DiscoveredVideoMetadata } from './VideoTypes';
import { RegistryError } from '../error/VideoDiscoveryErrors';
import { IEventBus } from '../events/IEventBus';

export class VideoRegistry {
  private registry = new Map<string, DiscoveredVideoMetadata>();
  private elementMap = new WeakMap<HTMLVideoElement, string>();
  private activeVideoId: string | null = null;
  private maxCapacity: number;
  private eventBus?: IEventBus;

  constructor(maxCapacity: number = 50, eventBus?: IEventBus) {
    this.maxCapacity = maxCapacity;
    this.eventBus = eventBus;
  }

  registerVideo(videoEl: HTMLVideoElement, metadata: DiscoveredVideoMetadata): string {
    if (this.elementMap.has(videoEl)) {
      const existingId = this.elementMap.get(videoEl)!;
      this.registry.set(existingId, metadata);
      return existingId;
    }

    if (this.registry.size >= this.maxCapacity) {
      const oldestKey = this.registry.keys().next().value;
      if (oldestKey) this.unregisterVideo(oldestKey);
    }

    this.registry.set(metadata.id, metadata);
    this.elementMap.set(videoEl, metadata.id);

    if (!this.activeVideoId) {
      this.activeVideoId = metadata.id;
    }

    if (this.eventBus) {
      this.eventBus.publish('video.registered', metadata);
      this.eventBus.publish('video.registry_updated', { count: this.registry.size });
    }

    return metadata.id;
  }

  unregisterVideo(id: string): void {
    if (!this.registry.has(id)) return;

    this.registry.delete(id);
    if (this.activeVideoId === id) {
      const remaining = Array.from(this.registry.keys());
      this.activeVideoId = remaining.length > 0 ? remaining[0] : null;
    }

    if (this.eventBus) {
      this.eventBus.publish('video.removed', { id });
      this.eventBus.publish('video.registry_updated', { count: this.registry.size });
    }
  }

  getVideo(id: string): DiscoveredVideoMetadata {
    const meta = this.registry.get(id);
    if (!meta) throw new RegistryError(id, 'Video not found in registry');
    return meta;
  }

  getActiveVideo(): DiscoveredVideoMetadata | undefined {
    if (this.activeVideoId) {
      return this.registry.get(this.activeVideoId);
    }
    return undefined;
  }

  setActiveVideo(id: string): void {
    if (!this.registry.has(id)) {
      throw new RegistryError(id, 'Cannot set active: Video not in registry');
    }
    this.activeVideoId = id;
  }

  listVideos(): DiscoveredVideoMetadata[] {
    return Array.from(this.registry.values());
  }

  size(): number {
    return this.registry.size;
  }

  clear(): void {
    this.registry.clear();
    this.activeVideoId = null;
  }
}
