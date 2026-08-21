import { ProviderCircuitPolicy } from './ProviderCircuitPolicy';

export class ProviderRecoveryProbeManager {
  private activeProbes = new Map<string, Set<string>>();

  canProbe(providerId: string, policy: ProviderCircuitPolicy): boolean {
    const current = this.activeProbes.get(providerId)?.size || 0;
    return current < policy.maxHalfOpenProbes;
  }

  startProbe(providerId: string, policy: ProviderCircuitPolicy): string | null {
    if (!this.canProbe(providerId, policy)) return null;
    const probeId = `probe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let set = this.activeProbes.get(providerId);
    if (!set) {
      set = new Set();
      this.activeProbes.set(providerId, set);
    }
    set.add(probeId);
    return probeId;
  }

  finishProbe(providerId: string, probeId: string): boolean {
    const set = this.activeProbes.get(providerId);
    if (!set) return false;
    const deleted = set.delete(probeId);
    if (set.size === 0) this.activeProbes.delete(providerId);
    return deleted;
  }

  clear(providerId?: string): void {
    if (providerId) {
      this.activeProbes.delete(providerId);
    } else {
      this.activeProbes.clear();
    }
  }
}
