import { describe, it, expect } from 'vitest';

import { add, formatTitle } from './utils';

describe('add', () => {
  it('returns the sum of two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});

describe('formatTitle', () => {
  it('capitalizes a lower-case title', () => {
    expect(formatTitle('hello world')).toBe('Hello World');
  });

  it('trims surrounding whitespace', () => {
    expect(formatTitle('  one piece  ')).toBe('One Piece');
  });
});
