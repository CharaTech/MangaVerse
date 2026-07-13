#!/usr/bin/env node
/**
 * show-commands.mjs
 *
 * Prints the available development / quality commands for MangaVerse.
 */

const commands = [
  ['pnpm install', 'Install workspace dependencies'],
  ['pnpm dev', 'Start all apps in development (see app-specific scripts)'],
  ['pnpm build', 'Build every workspace package'],
  ['pnpm lint', 'ESLint + max-warnings 0 (single-letter names, import order, comments)'],
  ['pnpm lint:fix', 'Auto-fix ESLint issues'],
  ['pnpm format', 'Format with Prettier'],
  ['pnpm format:check', 'Verify Prettier formatting'],
  ['pnpm check-types', 'Type-check every package'],
  ['pnpm check-single-letter-vars', 'Check for single-letter / meaningless variable names'],
  ['pnpm check-import-order', 'Check import sort order'],
  ['pnpm check-comments', 'Check JSDoc + inline comment requirements'],
  ['pnpm check-test-stubs', 'Verify every exported symbol has test coverage'],
  ['pnpm check-no-verify', 'Check for --no-verify bypass patterns'],
  ['pnpm run-quality-gate', 'Run the full pre-push quality gate'],
  ['pnpm test', 'Run tests in watch mode'],
  ['pnpm test:ci', 'Run tests with coverage (CI mode)'],
  ['pnpm validate', 'Run lint + all checks + types + tests'],
  ['pnpm clean', 'Remove node_modules / dist / coverage'],
];

console.log('\n📖 MangaVerse — available commands\n');
for (const [cmd, desc] of commands) {
  console.log(`  ${cmd.padEnd(34)} ${desc}`);
}
console.log('');
