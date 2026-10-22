import { VerificationMetrics, VerdictLabel } from '../VerificationTypes';
import { MetricsManager } from '../../metrics/MetricsManager';
import { IEventBus } from '../../events/IEventBus';
import { EventTopic } from '../../events/EventTypes';

export class VerificationHealthMonitor {
  private startedCount = 0;
  private completedCount = 0;
  private failedCount = 0;
  private rejectedCount = 0;
  private expiredCount = 0;
  private totalExecutionTimeMs = 0;
  private verdictDist: Record<VerdictLabel, number> = {
    TRUE: 0,
    MOSTLY_TRUE: 0,
    HALF_TRUE: 0,
    MOSTLY_FALSE: 0,
    FALSE: 0,
    UNVERIFIABLE: 0,
    MIXTURE: 0
  };

  constructor(
    private readonly metricsManager?: MetricsManager,
    private readonly eventBus?: IEventBus
  ) {}

  public recordStarted(): void {
    this.startedCount++;
    if (this.metricsManager) {
      this.metricsManager.incrementCounter('verification.started_count');
    }
  }

  public recordCompleted(executionTimeMs: number, verdict: VerdictLabel): void {
    this.completedCount++;
    this.totalExecutionTimeMs += executionTimeMs;
    this.verdictDist[verdict] = (this.verdictDist[verdict] || 0) + 1;

    if (this.metricsManager) {
      this.metricsManager.incrementCounter('verification.completed_count');
      this.metricsManager.recordTimer('verification.execution_time_ms', executionTimeMs);
      this.metricsManager.incrementCounter(`verification.verdict.${verdict.toLowerCase()}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('verification.completed' as EventTopic, {
        executionTimeMs,
        verdict,
        timestamp: Date.now()
      });
    }
  }

  public recordFailed(): void {
    this.failedCount++;
    if (this.metricsManager) {
      this.metricsManager.incrementCounter('verification.failed_count');
    }
  }

  public recordRejected(): void {
    this.rejectedCount++;
    if (this.metricsManager) {
      this.metricsManager.incrementCounter('verification.rejected_count');
    }
  }

  public recordExpired(): void {
    this.expiredCount++;
    if (this.metricsManager) {
      this.metricsManager.incrementCounter('verification.expired_count');
    }
  }

  public getMetrics(queueDepth: number = 0, queueCapacity: number = 50, cacheHitRate: number = 0): VerificationMetrics {
    const avgTime = this.completedCount > 0 ? this.totalExecutionTimeMs / this.completedCount : 0;
    const utilization = queueCapacity > 0 ? (queueDepth / queueCapacity) * 100 : 0;

    return {
      totalVerificationsStarted: this.startedCount,
      totalVerificationsCompleted: this.completedCount,
      totalVerificationsFailed: this.failedCount,
      totalVerificationsRejected: this.rejectedCount,
      totalVerificationsExpired: this.expiredCount,
      averageExecutionTimeMs: Number(avgTime.toFixed(2)),
      cacheHitRate: Number(cacheHitRate.toFixed(4)),
      queueDepth,
      queueUtilizationPercent: Number(utilization.toFixed(2)),
      verdictDistribution: { ...this.verdictDist }
    };
  }

  public reset(): void {
    this.startedCount = 0;
    this.completedCount = 0;
    this.failedCount = 0;
    this.rejectedCount = 0;
    this.expiredCount = 0;
    this.totalExecutionTimeMs = 0;
    this.verdictDist = {
      TRUE: 0,
      MOSTLY_TRUE: 0,
      HALF_TRUE: 0,
      MOSTLY_FALSE: 0,
      FALSE: 0,
      UNVERIFIABLE: 0,
      MIXTURE: 0
    };
  }
}
