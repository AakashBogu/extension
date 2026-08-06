# Browser Runtime & Context Manager - Public API Specifications

```typescript
export class BrowserRuntime {
  getContext(): BrowserContext;
}
export class TabManager {
  getActiveTab(): TabInfo | undefined;
  getTab(tabId: number): TabInfo;
  listTabs(): TabInfo[];
}
export class NavigationManager {
  handleNavigation(newUrl: string, isSpa?: boolean): void;
  getPageState(): PageLifecycleState;
}
```
