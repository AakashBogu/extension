import { ProviderRegistry } from './ProviderRegistry';

export interface IOCRProviderContract {
  readonly id: string;
  readonly name: string;
}

export class OCRProviderRegistry extends ProviderRegistry<IOCRProviderContract> {}
