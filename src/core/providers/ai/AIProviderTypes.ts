import { ProviderHealth, ProviderType } from '../ProviderTypes';

export type AIOperationType =
  | 'QUERY_GENERATION'
  | 'CLAIM_ANALYSIS'
  | 'SOURCE_ANALYSIS'
  | 'EVIDENCE_SUMMARY';

export interface AIRequest {
  requestId: string;
  correlationId: string;
  operation: AIOperationType;
  input: string | Record<string, unknown>;
  systemInstructions?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  createdAt: number;
}

export interface AIResponse {
  requestId: string;
  correlationId: string;
  providerId: string;
  operation: AIOperationType;
  content: string;
  structuredOutput?: Record<string, unknown>;
  confidence?: number;
  modelName?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  createdAt: number;
}

export interface AIProviderCapabilities {
  providerId: string;
  operations: AIOperationType[];
  maxContextTokens: number;
  supportsStreaming: boolean;
  supportsStructuredOutput: boolean;
}

export interface AIProviderHealth extends ProviderHealth {
  activeRequestsCount?: number;
  totalTokensProcessed?: number;
}

export interface AIProviderMetadata {
  id: string;
  name: string;
  version: string;
  type: ProviderType;
  capabilities: AIProviderCapabilities;
  priority: number;
  enabled: boolean;
}

export interface AIProviderConfiguration {
  enabled: boolean;
  defaultTemperature: number;
  defaultMaxTokens: number;
  defaultTimeoutMs: number;
}
