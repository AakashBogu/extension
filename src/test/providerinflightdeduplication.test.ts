import { describe, it, expect, vi } from 'vitest';
import { ProviderInFlightDeduplicator } from '../core/providers/cache/ProviderInFlightDeduplicator';

describe('Module 6E: ProviderInFlightDeduplicator', () => {
  it('should deduplicate concurrent requests so executor runs only once', async () => {
    const deduplicator = new ProviderInFlightDeduplicator();
    const executorFn = vi.fn().mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 50));
      return 'Deduplicated Output';
    });

    const p1 = deduplicator.execute('key_dup', executorFn);
    const p2 = deduplicator.execute('key_dup', executorFn);
    const p3 = deduplicator.execute('key_dup', executorFn);

    const [res1, res2, res3] = await Promise.all([p1, p2, p3]);

    expect(res1).toBe('Deduplicated Output');
    expect(res2).toBe('Deduplicated Output');
    expect(res3).toBe('Deduplicated Output');
    expect(executorFn).toHaveBeenCalledTimes(1);
    expect(deduplicator.has('key_dup')).toBe(false);
  });
});
