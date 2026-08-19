import { IClaimAnalysisProvider } from './IClaimAnalysisProvider';

export class ClaimAnalysisProviderRegistry {
  private providers = new Map<string, IClaimAnalysisProvider>();

  registerProvider(provider: IClaimAnalysisProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregisterProvider(providerId: string): void {
    const p = this.providers.get(providerId);
    if (p) {
      p.destroy();
      this.providers.delete(providerId);
    }
  }

  getProvider(providerId: string): IClaimAnalysisProvider | undefined {
    return this.providers.get(providerId);
  }

  listProviders(): IClaimAnalysisProvider[] {
    return Array.from(this.providers.values());
  }

  clear(): void {
    this.providers.forEach(p => p.destroy());
    this.providers.clear();
  }
}
