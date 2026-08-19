import { ProviderType } from '../ProviderTypes';
import {
  SearchRequest,
  SearchResponse,
  SearchProviderCapabilities,
  SearchProviderHealth
} from './SearchProviderTypes';

export interface ISearchProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly capabilities: SearchProviderCapabilities;
  readonly priority: number;
  readonly enabled: boolean;

  initialize(): Promise<void>;
  search(request: SearchRequest): Promise<SearchResponse>;
  healthCheck(): Promise<SearchProviderHealth>;
  destroy(): void;
}
