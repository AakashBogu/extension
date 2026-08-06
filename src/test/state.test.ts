import { describe, it, expect, beforeEach } from 'vitest';
import { GlobalStateStore } from '../core/state/GlobalStateStore';
import { StateRegistry } from '../core/state/StateRegistry';
import { StatePersistenceManager, MemoryStatePersistenceAdapter } from '../core/state/StatePersistenceManager';
import { GlobalState } from '../core/state/StateTypes';

describe('Module 1D: State Management & Persistence', () => {
  let initialState: GlobalState;
  let store: GlobalStateStore;

  beforeEach(() => {
    initialState = {
      application: { status: 'IDLE', activeVideoId: null, activeTabId: null, claimsProcessedCount: 0, lastError: null },
      runtime: { version: '1.0.0', env: 'development', isRunning: true, startedAt: Date.now() },
      configuration: { env: 'development', logLevel: 'info', defaultAiProvider: 'gemini', defaultSearchProvider: 'tavily', maxTokensPerDay: 100, enableDebugConsole: true },
      ui: { theme: 'dark', overlayVisible: true, activeTab: 'main' },
      overlay: { position: { x: 0, y: 0 }, opacity: 1 },
      providers: { activeAiProvider: 'gemini', activeSearchProvider: 'tavily' },
      plugins: { registeredCount: 0, activeCount: 0 },
      diagnostics: { errorCount: 0, lastDiagnosticAt: null },
      video: {},
      audio: {},
      transcript: {},
      claims: {},
      verification: {},
      timeline: {},
      debug: {}
    };
    store = new GlobalStateStore(initialState);
  });

  it('should update state immutably and increment store version', () => {
    const v1 = store.getVersion();
    store.setState({ ui: { theme: 'light', overlayVisible: false, activeTab: 'settings' } });
    expect(store.getVersion()).toBe(v1 + 1);
    expect(store.getState().ui.theme).toBe('light');
  });

  it('should memoize select queries correctly', () => {
    const themeSelector = (s: GlobalState) => s.ui.theme;
    const res1 = store.select(themeSelector);
    const res2 = store.select(themeSelector);
    expect(res1).toBe('dark');
    expect(res1).toBe(res2);
  });

  it('should create and restore state snapshots accurately', () => {
    const snap1 = store.createSnapshot();
    store.setState({ ui: { theme: 'light', overlayVisible: true, activeTab: 'test' } });

    expect(store.getState().ui.theme).toBe('light');
    store.restoreSnapshot(snap1);
    expect(store.getState().ui.theme).toBe('dark');
  });

  it('should persist and hydrate state via StatePersistenceManager', async () => {
    const adapter = new MemoryStatePersistenceAdapter();
    const manager = new StatePersistenceManager(adapter);

    await manager.persist(initialState);
    const hydrated = await manager.hydrate();
    expect(hydrated?.ui?.theme).toBe('dark');
  });

  it('should register state slice metadata in StateRegistry', () => {
    const registry = new StateRegistry();
    registry.registerSlice('custom_slice', { version: 1, persistent: true });
    expect(registry.hasSlice('custom_slice')).toBe(true);
  });
});
