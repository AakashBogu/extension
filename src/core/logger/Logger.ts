import { ILogger } from './ILogger';
import { ILogProvider, LogEntry, ExtendedLogLevel } from './LogTypes';
import { MemoryLogProvider } from './MemoryLogProvider';
import { IEventBus } from '../events/IEventBus';

export class Logger implements ILogger {
  private providers: ILogProvider[] = [];
  private minLogLevel: ExtendedLogLevel = 'info';
  private moduleName: string;
  private eventBus?: IEventBus;

  private static LOG_LEVEL_SEVERITY: Record<ExtendedLogLevel, number> = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
  };

  constructor(
    moduleName: string = 'App',
    providers?: ILogProvider[],
    eventBus?: IEventBus
  ) {
    this.moduleName = moduleName;
    this.providers = providers && providers.length > 0 ? providers : [new MemoryLogProvider()];
    this.eventBus = eventBus;
  }

  setLogLevel(level: ExtendedLogLevel): void {
    this.minLogLevel = level;
  }

  addProvider(provider: ILogProvider): void {
    this.providers.push(provider);
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.emitLog('trace', message, undefined, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emitLog('debug', message, undefined, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emitLog('info', message, undefined, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emitLog('warn', message, undefined, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    this.emitLog('error', message, error, context);
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    this.emitLog('fatal', message, error, context);
  }

  getLogs(): LogEntry[] {
    return this.providers.flatMap(p => p.getLogs());
  }

  private emitLog(level: ExtendedLogLevel, message: string, error?: unknown, context?: Record<string, unknown>): void {
    if (Logger.LOG_LEVEL_SEVERITY[level] < Logger.LOG_LEVEL_SEVERITY[this.minLogLevel]) {
      return;
    }

    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      level,
      message,
      moduleName: this.moduleName,
      context,
      error
    };

    this.providers.forEach(p => p.writeLog(entry));

    if (this.eventBus) {
      this.eventBus.publish('system.diagnostic', entry);
    }
  }
}
