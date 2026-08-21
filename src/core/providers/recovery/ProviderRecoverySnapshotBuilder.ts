import { ProviderCircuitRecord, ProviderCircuitSnapshot } from './ProviderCircuitState';

export class ProviderRecoverySnapshotBuilder {
  static createSnapshot(record: ProviderCircuitRecord): ProviderCircuitSnapshot {
    return {
      providerId: record.providerId,
      state: record.state,
      openUntil: record.openUntil,
      isBlocking: record.state === 'OPEN',
      timestamp: Date.now()
    };
  }
}
