#!/usr/bin/env node
/**
 * check-import-order.mjs
 *
 * Enforces consistent import ordering via ESLint's `import/order` and
 * `import/no-duplicates` rules. Thin wrapper so the check can be run alone.
 *
 * Cross-platform.
 */

import { spawnSync } from 'child_process';

console.log('\n📚 Checking import sort order...\n');

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'eslint',
    '.',
    '--max-warnings',
    '0',
    '--rule',
    'import/order: error',
    '--rule',
    'import/no-duplicates: error',
  ],
  { stdio: 'inherit' }
);

if (result.status !== 0) {
  console.error('\n❌ Import ordering issues detected. Run `pnpm lint:fix` to sort imports.\n');
  process.exit(result.status ?? 1);
}

console.log('✅ Import ordering is correct.\n');
