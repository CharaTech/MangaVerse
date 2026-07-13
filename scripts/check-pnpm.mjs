#!/usr/bin/env node
/**
 * check-pnpm.mjs
 *
 * Verifies pnpm is installed and accessible before running pnpm commands
 * in hooks. Provides clear installation instructions if pnpm is missing.
 *
 * Cross-platform (Windows, macOS, Linux).
 */

import { execSync } from 'child_process';

/**
 * Determines whether pnpm is runnable by attempting to print its version.
 *
 * @returns {boolean} True if pnpm is available.
 */
function pnpmInstalled() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (pnpmInstalled()) process.exit(0);

console.error(`
❌ ERROR: pnpm is not installed or not in PATH.

   pnpm is required for this project. Choose an installation method:

     1. Install via npm (requires Node.js 18+):
        npm install -g pnpm

     2. Install via Corepack (Node.js 22+ ships with Corepack):
        corepack enable && corepack prepare pnpm@latest --activate

     3. Standalone install (cross-platform):
        curl -fsSL https://get.pnpm.io/install.sh | sh -

     4. Windows (PowerShell):
        iwr https://get.pnpm.io/install.ps1 -useb | iex

     5. Visit https://pnpm.io/installation for more options

   After installing, run 'pnpm install' in the project root.
`);
process.exit(1);
