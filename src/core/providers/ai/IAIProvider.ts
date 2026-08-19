import { ProviderType } from '../ProviderTypes';
import {
  AIRequest,
  AIResponse,
  AIProviderCapabilities,
  AIProviderHealth
} from './AIProviderTypes';

export interface IAIProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly capabilities: AIProviderCapabilities;
  readonly priority: number;
  readonly enabled: boolean;

  initialize(): Promise<void>;
  analyze(request: AIRequest): Promise<AIResponse>;
  healthCheck(): Promise<AIProviderHealth>;
  destroy(): void;
}
