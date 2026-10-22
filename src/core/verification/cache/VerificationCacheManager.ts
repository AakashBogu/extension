import { FactCheckVerdict } from '../VerificationTypes';
import { IEventBus } from '../../events/IEventBus';
import { EventTopic } from '../../events/EventTypes';

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
}

export class VerificationCacheManager {
  private cache = new Map<string, CacheEntry<FactCheckVerdict>>();
  private inFlightClaims = new Map<string, Promise<FactCheckVerdict>>();

  private hits = 0;
  private misses = 0;

  constructor(
    private readonly maxCapacity: number = 200,
    private readonly defaultTtlMs: number = 3600000, // 1 hour
    private readonly eventBus?: IEventBus
  ) {}

  /**
   * Retrieves a cached FactCheckVerdict by claimId or normalized text hash.
   */
  public get(key: string): FactCheckVerdict | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);

    if (this.eventBus) {
      this.eventBus.publish('system.diagnostic' as EventTopic, {
        topic: 'verification.cache_hit',
        key,
        timestamp: Date.now()
      });
    }

    return { ...entry.value, cached: true };
  }

  /**
   * Caches a FactCheckVerdict object.
   */
  public set(key: string, verdict: FactCheckVerdict, ttlMs?: number): void {
    if (this.cache.size >= this.maxCapacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const ttl = ttlMs || this.defaultTtlMs;
    const entry: CacheEntry<FactCheckVerdict> = {
      key,
      value: verdict,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl
    };

    this.cache.set(key, entry);
  }

  /**
   * Checks if an identical claim verification is currently in flight.
   */
  public getInFlight(dedupKey: string): Promise<FactCheckVerdict> | undefined {
    return this.inFlightClaims.get(dedupKey);
  }

  /**
   * Registers an in-flight verification promise to prevent duplicate concurrent executions.
   */
  public setInFlight(dedupKey: string, promise: Promise<FactCheckVerdict>): void {
    this.inFlightClaims.set(dedupKey, promise);
    promise.finally(() => {
      this.inFlightClaims.delete(dedupKey);
    });
  }

  public clear(): void {
    this.cache.clear();
    this.inFlightClaims.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  public getStats(): { capacity: number; size: number; hits: number; misses: number; hitRate: number } {
    return {
      capacity: this.maxCapacity,
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate()
    };
  }
}
