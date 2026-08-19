import { SearchCapabilityFlag } from '../search/SearchProviderTypes';
import { AIOperationType } from '../ai/AIProviderTypes';

export interface SearchRoutingOptions {
  requiredCapabilities?: SearchCapabilityFlag[];
  allowDegraded?: boolean;
}

export interface AIRoutingOptions {
  requiredOperation?: AIOperationType;
  allowDegraded?: boolean;
}
