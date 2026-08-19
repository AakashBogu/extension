import { ProviderHealthStatus } from '../ProviderTypes';
import { IEventBus } from '../../events/IEventBus';

export interface ProviderHealthRecord {
  providerId: string;
  status: ProviderHealthStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheckedAt: number;
  latencyMs?: number;
  lastError?: string;
}

export class ProviderHealthManager {
  private healthRecords = new Map<string, ProviderHealthRecord>();

  constructor(private eventBus?: IEventBus) {}

  getHealth(providerId: string): ProviderHealthStatus {
    const record = this.healthRecords.get(providerId);
    return record ? record.status : 'HEALTHY';
  }

  getHealthRecord(providerId: string): ProviderHealthRecord | undefined {
    return this.healthRecords.get(providerId);
  }

  recordSuccess(providerId: string, latencyMs: number): void {
    const existing = this.healthRecords.get(providerId) || {
      providerId,
      status: 'HEALTHY',
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastCheckedAt: Date.now()
    };

    existing.consecutiveFailures = 0;
    existing.consecutiveSuccesses++;
    existing.latencyMs = latencyMs;
    existing.lastCheckedAt = Date.now();
    existing.status = 'HEALTHY';

    this.healthRecords.set(providerId, existing);
    if (this.eventBus) {
      this.eventBus.publish('provider.health_changed', { providerId, status: 'HEALTHY', timestamp: Date.now() });
    }
  }

  recordFailure(providerId: string, error: string): void {
    const existing = this.healthRecords.get(providerId) || {
      providerId,
      status: 'HEALTHY',
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastCheckedAt: Date.now()
    };

    existing.consecutiveSuccesses = 0;
    existing.consecutiveFailures++;
    existing.lastError = error;
    existing.lastCheckedAt = Date.now();

    if (existing.consecutiveFailures >= 3) {
      existing.status = 'UNHEALTHY';
    } else {
      existing.status = 'DEGRADED';
    }

    this.healthRecords.set(providerId, existing);
    if (this.eventBus) {
      this.eventBus.publish('provider.health_changed', { providerId, status: existing.status, error, timestamp: Date.now() });
    }
  }

  clear(): void {
    this.healthRecords.clear();
  }
}
