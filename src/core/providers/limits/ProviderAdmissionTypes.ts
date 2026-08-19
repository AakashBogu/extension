export type AdmissionDecision =
  | 'ALLOWED'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'COOLDOWN'
  | 'CAPACITY_EXCEEDED'
  | 'DISABLED'
  | 'UNKNOWN';

export interface AdmissionResult {
  readonly providerId: string;
  readonly decision: AdmissionDecision;
  readonly reason: string;
  readonly checkedAt: number;
  readonly retryAt?: number;
  readonly remainingCapacity?: number;
  readonly reservationId?: string;
}
