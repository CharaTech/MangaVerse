#!/usr/bin/env node
/**
 * check-comments.mjs
 *
 * Enforces documentation standards via ESLint's JSDoc rules and the custom
 * `require-call-comment` rule: exported symbols must have JSDoc, and
 * non-trivial calls must have an inline comment. Thin wrapper so the check
 * can be run in isolation.
 *
 * Cross-platform.
 */

import { spawnSync } from 'child_process';

console.log('\n💬 Checking documentation / comment requirements...\n');

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'eslint',
    '.',
    '--max-warnings',
    '0',
    '--rule',
    'jsdoc/require-jsdoc: error',
    '--rule',
    'jsdoc/require-description: error',
    '--rule',
    'jsdoc/require-param: error',
    '--rule',
    'jsdoc/require-returns: error',
    '--rule',
    'jsdoc/require-returns-check: error',
    '--rule',
    'custom/require-call-comment: error',
  ],
  { stdio: 'inherit' }
);

if (result.status !== 0) {
  console.error(
    '\n❌ Documentation / comment requirements not met. Add JSDoc to exported symbols and inline comments to non-trivial calls.\n'
  );
  process.exit(result.status ?? 1);
}

console.log('✅ Documentation / comment requirements satisfied.\n');
