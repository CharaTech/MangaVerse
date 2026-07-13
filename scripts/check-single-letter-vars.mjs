#!/usr/bin/env node
/**
 * check-single-letter-vars.mjs
 *
 * Enforces the "no single-letter variable names" standard via ESLint's
 * `id-length` and `no-restricted-syntax` rules. This thin wrapper focuses
 * ESLint on those rules so the check can be run in isolation.
 *
 * Cross-platform.
 */

import { spawnSync } from 'child_process';

console.log('\n🔤 Checking for single-letter / meaningless variable names...\n');

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'eslint',
    '.',
    '--max-warnings',
    '0',
    '--rule',
    'id-length: error',
    '--rule',
    'no-restricted-syntax: error',
  ],
  { stdio: 'inherit' }
);

if (result.status !== 0) {
  console.error(
    '\n❌ Single-letter / meaningless variable names detected. Use descriptive names.\n'
  );
  process.exit(result.status ?? 1);
}

console.log('✅ No single-letter / meaningless variable names found.\n');
