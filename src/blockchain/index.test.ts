import { describe, it, expect } from 'vitest';

import { getTargetChain } from './index';

describe('getTargetChain', () => {
  it('returns the polygon zkEVM chain identifier', () => {
    expect(getTargetChain()).toBe('polygon-zkevm');
  });
});
