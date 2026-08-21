import { ProviderQuotaReservation, ProviderQuotaReservationHandle } from './ProviderQuotaState';
import { ProviderUsageRecord } from './ProviderUsageTypes';
import { IEventBus } from '../../events/IEventBus';

export class ProviderQuotaReservationManager {
  private reservations = new Map<string, ProviderQuotaReservation>();

  constructor(private eventBus?: IEventBus) {}

  reserve(
    providerId: string,
    modelId: string | undefined,
    estimatedRequests: number = 1,
    estimatedTokens: number = 0,
    estimatedCost: number = 0,
    ttlMs: number = 30000
  ): ProviderQuotaReservationHandle {
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = Date.now();
    const expiresAt = createdAt + ttlMs;

    const reservation: ProviderQuotaReservation = {
      reservationId,
      providerId,
      modelId,
      estimatedRequests,
      estimatedTokens,
      estimatedCost,
      createdAt,
      expiresAt
    };

    this.reservations.set(reservationId, reservation);

    if (this.eventBus) {
      this.eventBus.publish('provider.quota_reservation_created', {
        reservationId,
        providerId,
        modelId,
        estimatedRequests,
        estimatedTokens,
        timestamp: createdAt
      });
    }

    return {
      reservationId,
      providerId,
      release: () => this.release(reservationId),
      commit: (usage: ProviderUsageRecord) => this.commit(reservationId, usage)
    };
  }

  release(reservationId: string): boolean {
    const existing = this.reservations.get(reservationId);
    if (!existing) return false;

    this.reservations.delete(reservationId);

    if (this.eventBus) {
      this.eventBus.publish('provider.quota_reservation_released', {
        reservationId,
        providerId: existing.providerId,
        timestamp: Date.now()
      });
    }

    return true;
  }

  commit(reservationId: string, usage: ProviderUsageRecord): boolean {
    const existing = this.reservations.get(reservationId);
    if (!existing) return false;

    this.reservations.delete(reservationId);

    if (this.eventBus) {
      this.eventBus.publish('provider.quota_reservation_committed', {
        reservationId,
        providerId: existing.providerId,
        usageCount: usage.requestCount,
        tokens: usage.totalTokens,
        timestamp: Date.now()
      });
    }

    return true;
  }

  getReservedTotals(providerId: string, modelId?: string): { reservedRequests: number; reservedTokens: number; reservedCost: number } {
    this.cleanupExpired();
    let reservedRequests = 0;
    let reservedTokens = 0;
    let reservedCost = 0;

    this.reservations.forEach(r => {
      const matchProvider = r.providerId === providerId;
      const matchModel = !modelId || r.modelId === modelId;
      if (matchProvider && matchModel) {
        reservedRequests += r.estimatedRequests;
        reservedTokens += r.estimatedTokens || 0;
        reservedCost += r.estimatedCost || 0;
      }
    });

    return { reservedRequests, reservedTokens, reservedCost };
  }

  cleanupExpired(): void {
    const now = Date.now();
    const expired: string[] = [];
    this.reservations.forEach((r, id) => {
      if (now >= r.expiresAt) expired.push(id);
    });
    expired.forEach(id => this.release(id));
  }

  reset(): void {
    this.reservations.clear();
  }
}
