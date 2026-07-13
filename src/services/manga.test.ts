import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fetchMangaSummary } from './manga';

describe('fetchMangaSummary', () => {
  beforeEach(() => {
    // Stub the global fetch implementation for an isolated unit test.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ id: 'abc', title: 'Test' }) }))
    );
  });

  it('returns a manga summary for a valid id', async () => {
    const summary = await fetchMangaSummary('abc');
    expect(summary.title).toBe('Test');
  });
});
