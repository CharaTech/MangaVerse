#!/usr/bin/env node
/**
 * detect-no-verify.mjs
 *
 * Warns developers when --no-verify bypass patterns are detected. Runs in
 * pre-commit and pre-push hooks. It does NOT block git itself (which cannot
 * be done at the OS level), but it:
 *   1. Detects known --no-verify aliases in global/local git config
 *   2. Logs a dated violation entry to .git/no-verify-violations.log
 *   3. Exits non-zero so the hook chain fails loudly
 *
 * The CI pipeline independently re-validates all commits via commitlint.
 *
 * Cross-platform (Windows, macOS, Linux).
 */

import { execSync } from 'child_process';
import { appendFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Runs a git command and returns trimmed stdout, or empty string on failure.
 *
 * @param {string} command - Git command to run.
 * @returns {string} Command output.
 */
function git(command) {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

let violations = 0;

console.log('');
console.log('🛡️  Checking for --no-verify bypass patterns...');

const allAliases = git('git config --list')
  .split(/\r?\n/)
  .filter((line) => line.startsWith('alias.'));

const badAlias = allAliases.find((line) => /no[-.]verify/i.test(line));
if (badAlias) {
  console.error('');
  console.error('❌ ERROR: A git alias containing --no-verify was found in your git config!');
  console.error('');
  console.error(`   ${badAlias}`);
  console.error('');
  console.error('   Please remove this alias. The standards require all commits to pass hooks.');
  console.error('   Run: git config --global --unset alias.<name>');
  violations += 1;
}

if (process.env.HUSKY === '0') {
  console.error('');
  console.error('❌ ERROR: HUSKY=0 is set — this bypasses ALL Husky hooks!');
  console.error('   Unset HUSKY or remove it from your shell profile.');
  violations += 1;
}

const gitDir = git('git rev-parse --git-dir');
const violationLog = join(gitDir, 'no-verify-violations.log');
if (gitDir && existsSync(violationLog)) {
  const lines = readFileSync(violationLog, 'utf-8').split(/\r?\n/).filter(Boolean);
  const lastLine = lines[lines.length - 1];
  const today = new Date().toISOString().slice(0, 10);
  if (lastLine && lastLine.includes(today)) {
    console.error('');
    console.error('❌ ERROR: A recent --no-verify bypass was detected!');
    console.error(`   ${lastLine}`);
    console.error('');
    console.error('   The post-commit hook detected that the pre-commit hook was skipped.');
    console.error('   All commits must pass hooks. Do not use --no-verify.');
    violations += 1;
  }
}

if (violations > 0) {
  const timestamp = new Date().toISOString();
  const email = git('git config user.email') || 'unknown';
  appendFileSync(violationLog, `${timestamp}  user=${email}  violations=${violations}\n`);
  console.error('');
  console.error(
    '   ☝️  A record of this violation has been written to .git/no-verify-violations.log'
  );
  console.error(
    '   ☝️  Note: even if you bypass this hook, the CI pipeline will re-run commitlint'
  );
  console.error('       on every PR and will reject commits that skipped required validation.');
  console.error('');
  process.exit(1);
}

console.log('✅  No --no-verify bypass patterns detected.');
console.log('');
