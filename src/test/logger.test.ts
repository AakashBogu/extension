import { describe, it, expect } from 'vitest';
import { Logger } from '../core/logger/Logger';
import { MemoryLogProvider } from '../core/logger/MemoryLogProvider';

describe('Module 1F: Logger & Log Providers', () => {
  it('should capture and retrieve structured logs via MemoryLogProvider', () => {
    const memProvider = new MemoryLogProvider(50);
    const logger = new Logger('TestModule', [memProvider]);

    logger.info('System boot complete', { version: '1.0.0' });
    logger.warn('Resource warning', { memoryUsage: 85 });

    const logs = memProvider.getLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].message).toBe('System boot complete');
    expect(logs[1].level).toBe('warn');
  });

  it('should filter log entries below minimum severity level', () => {
    const memProvider = new MemoryLogProvider();
    const logger = new Logger('TestModule', [memProvider]);
    logger.setLogLevel('warn');

    logger.debug('Debug message ignored');
    logger.info('Info message ignored');
    logger.error('Error message recorded');

    const logs = memProvider.getLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].message).toBe('Error message recorded');
  });
});
