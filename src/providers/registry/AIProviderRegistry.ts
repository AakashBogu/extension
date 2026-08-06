import { ProviderRegistry } from './ProviderRegistry';

export interface IAIProviderContract {
  readonly id: string;
  readonly name: string;
}

export class AIProviderRegistry extends ProviderRegistry<IAIProviderContract> {}
