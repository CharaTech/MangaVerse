import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import process from 'node:process';
import * as espree from 'espree';
import tseslint from 'typescript-eslint';

import requireCallComment from './scripts/eslint-rules/require-call-comment.mjs';

/**
 * MangaVerse ESLint flat config.
 *
 * Emulates the AO Holdings standards: strict naming (no single-letter
 * variables), enforced import ordering, required JSDoc on exported symbols,
 * required inline comments before non-trivial calls, and Prettier alignment.
 */

const rootDir = process.cwd();

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      'node_modules/**',
      'coverage/**',
      'pnpm-lock.yaml',
      'package-lock.json',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,

  // ===== TypeScript / React source =====
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      jsdoc: jsdoc,
      custom: { rules: { 'require-call-comment': requireCallComment } },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser, ...globals.es2022 },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: {
          allowDefaultProject: ['eslint.config.js', 'commitlint.config.js', 'prettier.config.js'],
        },
        tsconfigRootDir: rootDir,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['tsconfig.json'],
        },
      },
    },
    rules: {
      // ===== NAMING: no single-letter / meaningless variable names =====
      'id-length': ['error', { min: 2, max: 50, properties: 'never', exceptions: ['i', 'j', 'k'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "VariableDeclarator[id.name='data']",
          message:
            "Variable name 'data' is banned. Use a descriptive name like 'manga' or 'response'.",
        },
        {
          selector: "VariableDeclarator[id.name='temp']",
          message: "Variable name 'temp' is banned. Use a descriptive name like 'formattedDate'.",
        },
        {
          selector: "VariableDeclarator[id.name='arr']",
          message: "Variable name 'arr' is banned. Use a descriptive name like 'permissions'.",
        },
        {
          selector: "VariableDeclarator[id.name='obj']",
          message: "Variable name 'obj' is banned. Use a descriptive name like 'config'.",
        },
        {
          selector: "VariableDeclarator[id.name='str']",
          message: "Variable name 'str' is banned. Use a descriptive name like 'message'.",
        },
        {
          selector: "VariableDeclarator[id.name='result']",
          message:
            "Variable name 'result' is banned. Use a descriptive name like 'validationResult'.",
        },
        {
          selector: "VariableDeclarator[id.name='myVar']",
          message: "Variable name 'myVar' is banned. Use a descriptive name like 'username'.",
        },
        {
          selector: "FunctionDeclaration[id.name='handle'], FunctionExpression[id.name='handle']",
          message:
            "Function name 'handle' is banned. Use a descriptive name like 'handleFormSubmit'.",
        },
        {
          selector:
            'VariableDeclarator[id.name=/^_[a-z]$/], FunctionDeclaration[id.name=/^_[a-z]$/], FunctionExpression[id.name=/^_[a-z]$/]',
          message:
            "Do not use '_'-prefixed single-letter names (e.g. '_d', '_e'). Use meaningful names like 'date', 'employee'.",
        },
      ],

      // ===== IMPORT ORDER =====
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@mangaverse/**', group: 'internal', position: 'before' },
            { pattern: '@/*', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',

      // ===== JSDOC / COMMENTS =====
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'ExportNamedDeclaration > VariableDeclarator > ArrowFunctionExpression',
            'ExportNamedDeclaration > FunctionDeclaration',
            'VariableDeclarator[id.type="Identifier"] > ArrowFunctionExpression',
            'VariableDeclarator[id.type="Identifier"] > FunctionExpression',
            'FunctionDeclaration',
            'MethodDefinition',
            'ClassDeclaration',
          ],
          checkConstructors: false,
          enableFixer: false,
        },
      ],
      'jsdoc/require-description': ['error', { contexts: ['any'] }],
      'jsdoc/require-param': ['error', { contexts: ['any'] }],
      'jsdoc/require-param-name': 'error',
      'jsdoc/require-param-type': 'off',
      'jsdoc/require-returns': ['error', { contexts: ['any'] }],
      'jsdoc/require-returns-type': 'off',
      'jsdoc/require-returns-check': 'error',
      'jsdoc/check-tag-names': 'error',
      'jsdoc/check-types': 'error',
      'jsdoc/empty-tags': 'error',
      'jsdoc/no-missing-syntax': 'off',
      'custom/require-call-comment': 'error',

      // ===== CONSOLE / DEBUG =====
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',

      // ===== TYPE SAFETY =====
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],

      // ===== GENERAL QUALITY =====
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'error',
    },
  },

  // ===== JavaScript config files (relaxed, espree parser) =====
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: espree,
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'custom/require-call-comment': 'off',
      'jsdoc/require-jsdoc': 'off',
      'import/order': 'off',
    },
  },

  // ===== Test files (relaxed) =====
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**',
      '**/__mocks__/**',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'custom/require-call-comment': 'off',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-returns-check': 'off',
    },
  }
);
