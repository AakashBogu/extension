# System Changelog

## [1.5.0-module1f] - 2026-08-06
### Added
- Structured JSON `Logger` implementing `ILogger` supporting log levels (`trace`, `debug`, `info`, `warn`, `error`, `fatal`).
- Log providers: `MemoryLogProvider` (ring-buffer) and `ConsoleLogProvider`.
- `MetricsManager` supporting counters, gauges, histograms, and timers.
- `PerformanceMonitor` operation timers, moving averages, and min/max duration metrics.
- `Profiler` scoped execution profiling.
- `TraceManager` with parent-child span IDs and trace lifecycle tracking.
- `HealthMonitor` aggregated component health checks.
- `DiagnosticsManager` diagnostic report generator.
- `DebugManager` and `RuntimeInspector`.
- Custom errors (`LoggingError`, `MetricsError`, `TracingError`, `ProfilingError`, `DiagnosticsError`, `HealthCheckError`).
- 8 new unit tests across `src/test/logger.test.ts`, `src/test/metrics.test.ts`, `src/test/tracing.test.ts`, and `src/test/diagnostics.test.ts` (Total 47 passing tests).
- Technical documentation in `docs/modules/observability/`.
