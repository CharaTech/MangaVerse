import { describe, it, expect } from 'vitest';

import { createApp } from './server';

describe('createApp', () => {
  it('returns a configured Express application', () => {
    const app = createApp();
    expect(app).toBeDefined();
  });
});
