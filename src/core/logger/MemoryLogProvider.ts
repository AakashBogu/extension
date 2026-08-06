import { ILogProvider, LogEntry } from './LogTypes';

export class MemoryLogProvider implements ILogProvider {
  readonly name = 'MemoryLogProvider';
  private logs: LogEntry[] = [];
  private maxCapacity: number;

  constructor(maxCapacity: number = 1000) {
    this.maxCapacity = maxCapacity;
  }

  async writeLog(entry: LogEntry): Promise<void> {
    if (this.logs.length >= this.maxCapacity) {
      this.logs.shift();
    }
    this.logs.push(entry);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}
