# Plugin Architecture Blueprint

Allows dynamic registration of custom plugins:

```typescript
export interface IPlugin {
  id: string;
  name: string;
  version: string;
  initialize(container: IServiceContainer): Promise<void>;
  destroy(): Promise<void>;
}
```

Supported plugin types:
- `IClaimDetectorPlugin`
- `IVerifierPlugin`
- `IUIOverlayPlugin`
