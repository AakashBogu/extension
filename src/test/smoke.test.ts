import { describe, it, expect } from 'vitest';
import { ConfigLoader } from '../core/config/ConfigLoader';
import { AppError } from '../core/error/AppError';

describe('Module 1A Foundation Smoke Tests', () => {
  it('should load default configuration successfully', async () => {
    const loader = new ConfigLoader();
    const config = await loader.loadConfig();
    expect(config.env).toBeDefined();
    expect(config.defaultAiProvider).toBe('gemini-1.5-flash');
  });

  it('should construct AppError hierarchy correctly', () => {
    const err = new AppError('Test error message', 'ERR_TEST');
    expect(err.message).toBe('Test error message');
    expect(err.code).toBe('ERR_TEST');
    expect(err).toBeInstanceOf(Error);
  });
});
