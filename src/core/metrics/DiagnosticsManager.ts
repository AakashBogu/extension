import { Logger } from '../logger/Logger';
import { MetricsManager } from './MetricsManager';
import { HealthMonitor } from './HealthMonitor';
import { StateManager } from '../state/StateManager';

export interface DiagnosticReport {
  timestamp: number;
  overallHealth: string;
  logsCount: number;
  metricsCount: number;
  appStatus: string;
}

export class DiagnosticsManager {
  constructor(
    private logger: Logger,
    private metricsManager: MetricsManager,
    private healthMonitor: HealthMonitor,
    private stateManager: StateManager
  ) {}

  async generateReport(): Promise<DiagnosticReport> {
    const health = await this.healthMonitor.runHealthCheck();
    const appState = this.stateManager.getState();

    return {
      timestamp: Date.now(),
      overallHealth: health.overallStatus,
      logsCount: this.logger.getLogs().length,
      metricsCount: this.metricsManager.getMetricsSummary().length,
      appStatus: appState.status
    };
  }
}
