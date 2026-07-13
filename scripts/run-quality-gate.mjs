#!/usr/bin/env node
/**
 * Quality Gate Orchestrator (MangaVerse)
 *
 * Runs the full quality gate used by the pre-push hook and CI:
 *   1. detect-no-verify   — refuse bypassed hooks
 *   2. lint (eslint)      — single-letter names, import order, comments/JSDoc, etc.
 *   3. check-test-stubs   — per-symbol test coverage
 *   4. check-types        — TypeScript type check across packages
 *   5. test:ci            — run the test suite with coverage
 *
 * Exits non-zero on the first failing stage.
 */

import { spawnSync } from 'child_process';

const projectRoot = process.cwd();

/**
 * Runs a command, exiting the process on non-zero status.
 *
 * @param {string} command - Command to execute.
 * @param {string[]} args - Command arguments.
 * @returns {void}
 */
function run(command, args) {
  console.log(`\n▶ ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: projectRoot });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('\n🚦 Running MangaVerse quality gate...\n');

run('node', ['scripts/detect-no-verify.mjs']);
run('pnpm', ['lint']);
run('pnpm', ['check-test-stubs']);
run('pnpm', ['check-types']);
run('pnpm', ['test:ci']);

console.log('\n✅ Quality gate passed.\n');
