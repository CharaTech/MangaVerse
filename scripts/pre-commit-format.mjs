#!/usr/bin/env node
/**
 * pre-commit-format.mjs
 *
 * Runs Prettier on all staged files and re-stages them before commit.
 * This ensures formatting is always consistent, preventing CI format:check
 * failures caused by version or config discrepancies between local and CI.
 *
 * Cross-platform (Windows, macOS, Linux). Called from .husky/pre-commit
 * BEFORE lint-staged runs.
 */

import { spawnSync } from 'child_process';

const PRETTIER_EXTENSIONS = [
  'js',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'jsx',
  'json',
  'md',
  'css',
  'scss',
  'html',
  'yaml',
  'yml',
  'vue',
  'svelte',
];

/**
 * Returns staged files (added, copied, modified, renamed) as an array.
 *
 * @returns {string[]} Staged file paths.
 */
function getStagedFiles() {
  const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
    encoding: 'utf-8',
  });
  const raw = (result.stdout || '').trim();
  if (!raw) return [];
  return raw.split(/\r?\n/).filter(Boolean);
}

const stagedFiles = getStagedFiles();
if (stagedFiles.length === 0) process.exit(0);

const formatFiles = stagedFiles.filter((file) =>
  PRETTIER_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`))
);

if (formatFiles.length === 0) process.exit(0);

console.log('✨ Auto-formatting staged files with Prettier...');

const prettier = spawnSync(
  'npx',
  ['--yes', 'prettier', '--write', '--ignore-unknown', ...formatFiles],
  {
    stdio: 'inherit',
  }
);
if (prettier.status !== 0) process.exit(prettier.status ?? 1);

const add = spawnSync('git', ['add', ...formatFiles], { stdio: 'inherit' });
if (add.status !== 0) process.exit(add.status ?? 1);

console.log('✅ Prettier formatting applied and files re-staged.');
