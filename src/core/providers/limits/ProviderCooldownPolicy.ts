export interface ProviderCooldownPolicyConfig {
  readonly enabled?: boolean;
  readonly baseDurationMs?: number;
  readonly maxDurationMs?: number;
  readonly backoffFactor?: number;
  readonly maxConsecutiveFailures?: number;
  readonly successResetsFailures?: boolean;
  readonly rateLimitTriggersCooldown?: boolean;
  readonly quotaTriggersCooldown?: boolean;
  readonly timeoutTriggersCooldown?: boolean;
  readonly unknownErrorTriggersCooldown?: boolean;
  readonly maxRecoveryAttempts?: number;
  readonly recoveryDelayMs?: number;
}

export class ProviderCooldownPolicy {
  public readonly enabled: boolean;
  public readonly baseDurationMs: number;
  public readonly maxDurationMs: number;
  public readonly backoffFactor: number;
  public readonly maxConsecutiveFailures: number;
  public readonly successResetsFailures: boolean;
  public readonly rateLimitTriggersCooldown: boolean;
  public readonly quotaTriggersCooldown: boolean;
  public readonly timeoutTriggersCooldown: boolean;
  public readonly unknownErrorTriggersCooldown: boolean;
  public readonly maxRecoveryAttempts: number;
  public readonly recoveryDelayMs: number;

  constructor(config: ProviderCooldownPolicyConfig = {}) {
    this.enabled = config.enabled ?? true;
    this.baseDurationMs = config.baseDurationMs ?? 5000; // 5s default base
    this.maxDurationMs = config.maxDurationMs ?? 300000; // 5 min default max
    this.backoffFactor = config.backoffFactor ?? 2.0;
    this.maxConsecutiveFailures = config.maxConsecutiveFailures ?? 5;
    this.successResetsFailures = config.successResetsFailures ?? true;
    this.rateLimitTriggersCooldown = config.rateLimitTriggersCooldown ?? true;
    this.quotaTriggersCooldown = config.quotaTriggersCooldown ?? true;
    this.timeoutTriggersCooldown = config.timeoutTriggersCooldown ?? true;
    this.unknownErrorTriggersCooldown = config.unknownErrorTriggersCooldown ?? false;
    this.maxRecoveryAttempts = config.maxRecoveryAttempts ?? 3;
    this.recoveryDelayMs = config.recoveryDelayMs ?? 1000;
  }
}
