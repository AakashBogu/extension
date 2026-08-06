import { ProviderRegistry } from './ProviderRegistry';

export interface IStorageProviderContract {
  readonly id: string;
  readonly name: string;
}

export class StorageProviderRegistry extends ProviderRegistry<IStorageProviderContract> {}
