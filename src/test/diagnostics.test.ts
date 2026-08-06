import { describe, it, expect } from 'vitest';
import { DiagnosticsManager } from '../core/metrics/DiagnosticsManager';
import { Logger } from '../core/logger/Logger';
import { MetricsManager } from '../core/metrics/MetricsManager';
import { HealthMonitor } from '../core/metrics/HealthMonitor';
import { StateManager } from '../core/state/StateManager';
import { GlobalStateStore } from '../core/state/GlobalStateStore';
import { RuntimeInspector } from '../core/metrics/RuntimeInspector';
import { GlobalState } from '../core/state/StateTypes';

describe('Module 1F: Diagnostics Manager & Runtime Inspector', () => {
  it('should generate complete diagnostic report', async () => {
    const logger = new Logger('Test');
    const metrics = new MetricsManager();
    const health = new HealthMonitor();

    const emptySlice = {};
    const defaultState: GlobalState = {
      application: { status: 'IDLE', activeVideoId: null, activeTabId: null, claimsProcessedCount: 0, lastError: null },
      runtime: { version: '1.0.0', env: 'dev', isRunning: true, startedAt: Date.now() },
      configuration: { env: 'development', logLevel: 'info', defaultAiProvider: 'gemini', defaultSearchProvider: 'tavily', maxTokensPerDay: 100, enableDebugConsole: true },
      ui: { theme: 'dark', overlayVisible: true, activeTab: 'main' },
      overlay: { position: { x: 0, y: 0 }, opacity: 1 },
      providers: { activeAiProvider: 'gemini', activeSearchProvider: 'tavily' },
      plugins: { registeredCount: 0, activeCount: 0 },
      diagnostics: { errorCount: 0, lastDiagnosticAt: null },
      video: emptySlice,
      audio: emptySlice,
      transcript: emptySlice,
      claims: emptySlice,
      verification: emptySlice,
      timeline: emptySlice,
      debug: emptySlice
    };

    const store = new GlobalStateStore(defaultState);
    const stateManager = new StateManager(store);

    const diag = new DiagnosticsManager(logger, metrics, health, stateManager);
    const report = await diag.generateReport();

    expect(report.overallHealth).toBe('HEALTHY');
    expect(report.appStatus).toBe('IDLE');
  });

  it('should inspect runtime context via RuntimeInspector', () => {
    const inspector = new RuntimeInspector();
    expect(inspector).toBeDefined();
  });
});
