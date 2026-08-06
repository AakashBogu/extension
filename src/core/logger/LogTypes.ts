import { LogLevel } from './ILogger';

export type ExtendedLogLevel = 'trace' | LogLevel | 'fatal';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: ExtendedLogLevel;
  message: string;
  moduleName?: string;
  correlationId?: string;
  tags?: string[];
  context?: Record<string, unknown>;
  error?: unknown;
}

export interface ILogProvider {
  readonly name: string;
  writeLog(entry: LogEntry): Promise<void>;
  getLogs(): LogEntry[];
  clearLogs(): void;
}
