# Video Discovery Engine - Interfaces & Type Contracts

```typescript
export interface DiscoveredVideoMetadata {
  id: string;
  src: string;
  currentSrc: string;
  poster: string;
  width: number;
  height: number;
  readyState: number;
  preload: string;
  autoplay: boolean;
  isShadowDom: boolean;
}
```
