import { ProviderRegistry } from './ProviderRegistry';

export interface ISpeechProviderContract {
  readonly id: string;
  readonly name: string;
}

export class SpeechProviderRegistry extends ProviderRegistry<ISpeechProviderContract> {}
