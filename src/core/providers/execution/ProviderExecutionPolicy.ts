export interface ExecutionPolicyConfig {
  defaultAiTimeoutMs?: number;
  defaultSearchTimeoutMs?: number;
  retryEnabled?: boolean;
  maxRetryAttempts?: number;
  initialRetryDelayMs?: number;
  maxRetryDelayMs?: number;
  fallbackEnabled?: boolean;
  maxFallbackProviders?: number;
  maxConcurrentRequests?: number;
  requestRetentionLimit?: number;
}

export class ProviderExecutionPolicy {
  public readonly defaultAiTimeoutMs: number;
  public readonly defaultSearchTimeoutMs: number;
  public readonly retryEnabled: boolean;
  public readonly maxRetryAttempts: number;
  public readonly initialRetryDelayMs: number;
  public readonly maxRetryDelayMs: number;
  public readonly fallbackEnabled: boolean;
  public readonly maxFallbackProviders: number;
  public readonly maxConcurrentRequests: number;
  public readonly requestRetentionLimit: number;

  constructor(config: ExecutionPolicyConfig = {}) {
    this.defaultAiTimeoutMs = config.defaultAiTimeoutMs ?? 30000;
    this.defaultSearchTimeoutMs = config.defaultSearchTimeoutMs ?? 15000;
    this.retryEnabled = config.retryEnabled ?? true;
    this.maxRetryAttempts = config.maxRetryAttempts ?? 3;
    this.initialRetryDelayMs = config.initialRetryDelayMs ?? 500;
    this.maxRetryDelayMs = config.maxRetryDelayMs ?? 5000;
    this.fallbackEnabled = config.fallbackEnabled ?? true;
    this.maxFallbackProviders = config.maxFallbackProviders ?? 3;
    this.maxConcurrentRequests = config.maxConcurrentRequests ?? 10;
    this.requestRetentionLimit = config.requestRetentionLimit ?? 100;
  }
}
