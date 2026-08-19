export interface OpenAIConfig {
  enabled: boolean;
  endpoint: string;
  model: string;
  credentialKey?: string;
  timeoutMs: number;
  priority: number;
}

export interface GeminiConfig {
  enabled: boolean;
  endpoint: string;
  model: string;
  credentialKey?: string;
  timeoutMs: number;
  priority: number;
}

export interface BraveConfig {
  enabled: boolean;
  endpoint: string;
  credentialKey?: string;
  timeoutMs: number;
  maxResults: number;
  priority: number;
}

export interface BingConfig {
  enabled: boolean;
  endpoint: string;
  credentialKey?: string;
  timeoutMs: number;
  maxResults: number;
  priority: number;
}

export interface ProviderSystemConfig {
  openai?: OpenAIConfig;
  gemini?: GeminiConfig;
  brave?: BraveConfig;
  bing?: BingConfig;
}
