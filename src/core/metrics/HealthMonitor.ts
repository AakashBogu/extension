export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

export interface HealthCheckResult {
  component: string;
  status: HealthStatus;
  message: string;
  timestamp: number;
}

export type HealthCheckFn = () => Promise<HealthCheckResult>;

export class HealthMonitor {
  private checks = new Map<string, HealthCheckFn>();

  registerCheck(component: string, checkFn: HealthCheckFn): void {
    this.checks.set(component, checkFn);
  }

  async runHealthCheck(): Promise<{ overallStatus: HealthStatus; results: HealthCheckResult[] }> {
    const results: HealthCheckResult[] = [];
    let overallStatus: HealthStatus = 'HEALTHY';

    for (const [component, check] of this.checks.entries()) {
      try {
        const res = await check();
        results.push(res);
        if (res.status === 'UNHEALTHY') overallStatus = 'UNHEALTHY';
        else if (res.status === 'DEGRADED' && overallStatus !== 'UNHEALTHY') overallStatus = 'DEGRADED';
      } catch (err) {
        results.push({
          component,
          status: 'UNHEALTHY',
          message: err instanceof Error ? err.message : String(err),
          timestamp: Date.now()
        });
        overallStatus = 'UNHEALTHY';
      }
    }

    return { overallStatus, results };
  }
}
