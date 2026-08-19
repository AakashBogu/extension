export interface CachePolicyConfig {
  aiTtlMs?: number;
  searchTtlMs?: number;
  maxEntries?: number;
  maxApproximateSizeBytes?: number;
  enabled?: boolean;
}

export class ProviderCachePolicy {
  public readonly aiTtlMs: number;
  public readonly searchTtlMs: number;
  public readonly maxEntries: number;
  public readonly maxApproximateSizeBytes: number;
  public readonly enabled: boolean;

  constructor(config: CachePolicyConfig = {}) {
    this.aiTtlMs = config.aiTtlMs ?? 300000; // 5 minutes
    this.searchTtlMs = config.searchTtlMs ?? 600000; // 10 minutes
    this.maxEntries = config.maxEntries ?? 500;
    this.maxApproximateSizeBytes = config.maxApproximateSizeBytes ?? 5242880; // 5MB
    this.enabled = config.enabled ?? true;
  }
}
