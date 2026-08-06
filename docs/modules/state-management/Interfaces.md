# State Management Architecture - Interfaces & Type Contracts

```typescript
export interface GlobalState {
  application: AppState;
  runtime: RuntimeState;
  configuration: AppConfig;
  ui: UIState;
  overlay: OverlayState;
  providers: ProvidersState;
  plugins: PluginsState;
  diagnostics: DiagnosticsState;
  video: VideoSliceState;
  audio: AudioSliceState;
  transcript: TranscriptSliceState;
  claims: ClaimsSliceState;
  verification: VerificationSliceState;
  timeline: TimelineSliceState;
  debug: DebugSliceState;
}
```
