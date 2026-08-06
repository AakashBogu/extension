import { ILogProvider, LogEntry } from './LogTypes';

export class ConsoleLogProvider implements ILogProvider {
  readonly name = 'ConsoleLogProvider';
  private logs: LogEntry[] = [];

  async writeLog(entry: LogEntry): Promise<void> {
    this.logs.push(entry);
    const prefix = `[${new Date(entry.timestamp).toISOString()}] [${entry.level.toUpperCase()}]${entry.moduleName ? ` [${entry.moduleName}]` : ''}`;
    
    switch (entry.level) {
      case 'debug':
      case 'trace':
        console.debug(prefix, entry.message, entry.context || '');
        break;
      case 'info':
        console.info(prefix, entry.message, entry.context || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, entry.context || '');
        break;
      case 'error':
      case 'fatal':
        console.error(prefix, entry.message, entry.error || '', entry.context || '');
        break;
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
