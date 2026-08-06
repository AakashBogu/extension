import { ProviderRegistry } from './ProviderRegistry';

export interface ISearchProviderContract {
  readonly id: string;
  readonly name: string;
}

export class SearchProviderRegistry extends ProviderRegistry<ISearchProviderContract> {}
