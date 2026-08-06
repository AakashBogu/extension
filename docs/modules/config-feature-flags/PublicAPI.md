# Configuration & Feature Flags Platform - Public API Specifications

```typescript
export class ConfigurationManager implements IConfigLoader {
  loadConfig(): Promise<AppConfig>;
  updateConfig(partial: Partial<ExtendedAppConfig>): Promise<void>;
  createSnapshot(): ConfigSnapshot;
  rollback(): void;
}
export class FeatureFlagManager {
  registerFlag(flag: FeatureFlag): void;
  isEnabled(flagId: string, currentEnv?: EnvironmentType): boolean;
  setOverride(flagId: string, enabled: boolean): void;
}
```
