#!/usr/bin/env node
/**
 * Test Coverage Validator (MangaVerse)
 *
 * Enforces that every modularized domain folder under the configured
 * modularized directories has test coverage for each exported symbol.
 *
 * For each source file (excluding barrel re-export files), the validator
 * extracts every named export — functions, classes, consts, and methods
 * of exported object literals — and checks that each symbol appears in
 * at least one `describe`, `it`, or `test` string in the domain's test file(s).
 *
 * Modularized directories checked (components excluded by policy):
 *   services, lib, utils, types, hooks, store
 *
 * Scans the src/ tree for modularized domain folders so the check works
 * for this single-package project.
 *
 * Severity: errors (non-zero exit).
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { basename, join } from 'path';

const PROJECT_ROOT = process.cwd();

const MODULARIZED_DIRS = ['services', 'lib', 'utils', 'types', 'hooks', 'store'];

const EXCLUDED_SUBDIRS = new Set([
  'test',
  '__tests__',
  '__mocks__',
  'node_modules',
  'dist',
  'build',
  'mocks',
]);

const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx)$/;
const SOURCE_FILE_PATTERN = /\.(ts|tsx)$/;
const VALIDATION_FILE_PATTERN = /\.validation\.(ts|tsx)$/;

let errorCount = 0;
let missingSymbolsTotal = 0;

/**
 * Resolves the source root for the single-package project.
 *
 * @returns {string[]} Absolute source root paths.
 */
function resolveRoots() {
  const root = join(PROJECT_ROOT, 'src');
  if (existsSync(root) && statSync(root).isDirectory()) return [root];
  return [];
}

/**
 * @param {string} path - Path to test.
 * @returns {boolean} True if path is a directory.
 */
function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * @param {string} filename - Filename to test.
 * @returns {boolean} True if this is an implementation (non-test) file.
 */
function isImplementationFile(filename) {
  return (
    SOURCE_FILE_PATTERN.test(filename) &&
    !TEST_FILE_PATTERN.test(filename) &&
    !filename.endsWith('.d.ts')
  );
}

/**
 * @param {string} folderPath - Folder to test.
 * @returns {boolean} True if the folder has at least one test stub.
 */
function hasTestStub(folderPath) {
  let entries;
  try {
    entries = readdirSync(folderPath);
  } catch {
    return false;
  }
  return entries.some((entry) => TEST_FILE_PATTERN.test(entry));
}

/**
 * Strips line and block comments from source content.
 *
 * @param {string} content - Source content.
 * @returns {string} Content without comments.
 */
function removeComments(content) {
  return content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Detects whether a source file is a barrel (re-export only) file.
 *
 * @param {string} content - Source content.
 * @returns {boolean} True if the file declares no concrete symbols.
 */
function isBarrelFile(content) {
  const clean = removeComments(content);
  const hasDef =
    /export\s+(?:default\s+)?(?:async\s+)?function\s+\w+/g.test(clean) ||
    /export\s+(?:default\s+)?class\s+\w+/g.test(clean) ||
    /export\s+(?:default\s+)?(?:const|let|var)\s+\w+/g.test(clean) ||
    /export\s+default\s+\w+/g.test(clean);
  return !hasDef;
}

/**
 * Finds the position of the matching closing brace.
 *
 * @param {string} content - Source content.
 * @param {number} openPos - Index of the opening `{`.
 * @returns {number} Index of the closing `}`, or -1.
 */
function findMatchingBrace(content, openPos) {
  let depth = 0;
  let index = openPos;
  while (index < content.length) {
    const char = content[index];
    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) return index;
    } else if ((char === '"' || char === "'" || char === '`') && index > openPos) {
      const quoteChar = char;
      index++;
      while (index < content.length) {
        if (content[index] === '\\') index++;
        else if (content[index] === quoteChar) break;
        index++;
      }
    }
    index++;
  }
  return -1;
}

/**
 * Finds the function-body `{` while skipping type-annotation braces.
 *
 * @param {string} text - Text starting after the parameter list.
 * @returns {number} Index of the body `{`, or -1.
 */
function findFunctionBodyBrace(text) {
  let parenDepth = 0;
  let angleDepth = 0;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === '<') angleDepth++;
    else if (char === '>') angleDepth--;
    else if (char === '{' && parenDepth === 0 && angleDepth === 0) return index;
  }
  return -1;
}

const JS_KEYWORDS = new Set([
  'async',
  'function',
  'get',
  'set',
  'static',
  'constructor',
  'default',
  'delete',
  'new',
  'return',
  'throw',
  'try',
  'catch',
  'finally',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'in',
  'of',
  'void',
  'typeof',
  'instanceof',
  'this',
  'class',
  'extends',
  'super',
  'import',
  'export',
  'from',
  'as',
  'const',
  'let',
  'var',
  'true',
  'false',
  'null',
  'undefined',
]);

/**
 * Extracts method names from an object literal body.
 *
 * @param {string} content - Source content.
 * @param {number} openBracePos - Index of the object literal `{`.
 * @returns {string[]} Method names.
 */
function extractObjectMethods(content, openBracePos) {
  const closeBrace = findMatchingBrace(content, openBracePos);
  if (closeBrace === -1) return [];

  const body = content.slice(openBracePos + 1, closeBrace);
  const methods = [];
  let pos = 0;

  while (pos < body.length) {
    while (pos < body.length && /[\s,]/.test(body[pos])) pos++;
    if (pos >= body.length) break;

    if (body.startsWith('//', pos)) {
      const newlineIdx = body.indexOf('\n', pos);
      pos = newlineIdx !== -1 ? newlineIdx + 1 : body.length;
      continue;
    }
    if (body.startsWith('/*', pos)) {
      const endComment = body.indexOf('*/', pos + 2);
      pos = endComment !== -1 ? endComment + 2 : body.length;
      continue;
    }
    if (body.startsWith('...', pos)) {
      const nextComma = body.indexOf(',', pos);
      pos = nextComma !== -1 ? nextComma + 1 : body.length;
      continue;
    }

    const propMatch = body.slice(pos).match(/^(\w+)\s*[:()]/);
    if (propMatch) {
      const key = propMatch[1];
      const afterKey = body.slice(pos + propMatch[0].length);
      methods.push(key);
      if (propMatch[0].endsWith(':')) {
        const trimmed = afterKey.trimStart();
        if (trimmed.startsWith('{')) {
          const objStart =
            pos + propMatch[0].length + (afterKey.length - afterKey.trimStart().length);
          const objEnd = findMatchingBrace(body, objStart);
          pos = objEnd !== -1 ? objEnd + 1 : body.length;
        } else if (
          trimmed.startsWith('async') ||
          trimmed.startsWith('function') ||
          trimmed.startsWith('(')
        ) {
          const braceIdx = findFunctionBodyBrace(trimmed);
          if (braceIdx !== -1) {
            const absStart =
              pos +
              propMatch[0].length +
              (afterKey.length - afterKey.trimStart().length) +
              braceIdx;
            const blockEnd = findMatchingBrace(body, absStart);
            pos = blockEnd !== -1 ? blockEnd + 1 : body.length;
          } else {
            pos += propMatch[0].length;
          }
        } else {
          pos += propMatch[0].length;
        }
      } else {
        pos += propMatch[0].length;
        const rest = body.slice(pos).trimStart();
        if (rest.startsWith(')') || /^[a-zA-Z_]/.test(rest)) {
          const closeParen = body.indexOf(')', pos);
          if (closeParen !== -1) {
            pos = closeParen + 1;
            const afterParams = body.slice(pos).trimStart();
            const braceIdx = findFunctionBodyBrace(afterParams);
            if (braceIdx !== -1) {
              const blockStart =
                pos + (body.slice(pos).length - body.slice(pos).trimStart().length) + braceIdx;
              const blockEnd = findMatchingBrace(body, blockStart);
              pos = blockEnd !== -1 ? blockEnd + 1 : body.length;
            } else {
              pos = body.length;
            }
          }
        }
      }
      continue;
    }

    const shorthand = body.slice(pos).match(/^(\w+)\s*[,}]/);
    if (shorthand) {
      methods.push(shorthand[1]);
      pos += shorthand[0].length;
      continue;
    }

    pos++;
  }

  return [...new Set(methods)].filter((method) => !JS_KEYWORDS.has(method));
}

/**
 * Parses a named export list, returning exported symbol names.
 *
 * @param {string} listStr - Comma-separated export list.
 * @returns {string[]} Symbol names.
 */
function parseExportList(listStr) {
  return listStr
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      if (item.startsWith('type ')) return [];
      const asMatch = item.match(/^(\w+)\s+as\s+(\w+)/);
      if (asMatch) return [asMatch[2]];
      if (/^\w+$/.test(item)) return [item];
      return [];
    });
}

const SKIP_NAMED_EXPORTS = new Set(['default']);

/**
 * Extracts exported symbols from a source file.
 *
 * @param {string} content - Source content.
 * @returns {{name:string, kind:string}[]} Exported symbols.
 */
function extractExportSymbols(content) {
  if (isBarrelFile(content)) return [];

  const clean = removeComments(content);
  const symbols = [];

  const funcPattern = /export\s+(default\s+)?(async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = funcPattern.exec(clean)) !== null) {
    symbols.push({ name: match[3], kind: 'function' });
  }

  const classPattern = /export\s+(default\s+)?class\s+(\w+)/g;
  while ((match = classPattern.exec(clean)) !== null) {
    symbols.push({ name: match[2], kind: 'class' });
  }

  const constPattern = /export\s+(default\s+)?(const|let|var)\s+(\w+)/g;
  while ((match = constPattern.exec(clean)) !== null) {
    const name = match[3];
    if (SKIP_NAMED_EXPORTS.has(name)) continue;
    symbols.push({ name, kind: 'const' });
    const afterMatch = clean.slice(match.index + match[0].length);
    if (afterMatch.trimStart().startsWith('=')) {
      const eqIndex = match.index + match[0].length + afterMatch.indexOf('=');
      const afterEq = clean.slice(eqIndex + 1).trimStart();
      if (afterEq.startsWith('{')) {
        const methods = extractObjectMethods(
          clean,
          eqIndex + 1 + (afterEq.length - afterEq.trimStart().length)
        );
        for (const methodName of methods) {
          symbols.push({ name: methodName, kind: 'method' });
        }
      }
    }
  }

  const namedPattern = /export\s+\{([^}]+)\}(?:\s*;|$)/g;
  while ((match = namedPattern.exec(clean)) !== null) {
    for (const name of parseExportList(match[1])) {
      symbols.push({ name, kind: 'named-export' });
    }
  }

  const defaultObjPattern = /export\s+default\s*\{/g;
  while ((match = defaultObjPattern.exec(clean)) !== null) {
    const methods = extractObjectMethods(clean, match.index + match[0].length - 1);
    for (const methodName of methods) {
      symbols.push({ name: methodName, kind: 'method' });
    }
  }

  return symbols;
}

/**
 * Extracts test subject strings from test content.
 *
 * @param {string} content - Test file content.
 * @returns {string[]} Subject strings.
 */
function extractTestSubjects(content) {
  const subjects = [];
  const testPattern = /(?:describe|it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = testPattern.exec(content)) !== null) {
    subjects.push(match[1]);
  }
  return subjects;
}

/**
 * @param {string} symbolName - Symbol name.
 * @param {string[]} testSubjects - Test subjects.
 * @returns {boolean} True if the symbol is referenced in a test.
 */
function isSymbolTested(symbolName, testSubjects) {
  if (!testSubjects.length) return false;
  const escaped = symbolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundaryPattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return testSubjects.some((subject) => boundaryPattern.test(subject));
}

/**
 * Validates a single modularized root directory.
 *
 * @param {string} modularizedRoot - Absolute path to the directory (e.g. .../services).
 * @param {string} displayRoot - Display label (e.g. "services").
 * @returns {void}
 */
function validateModularizedRoot(modularizedRoot, displayRoot) {
  if (!existsSync(modularizedRoot) || !isDirectory(modularizedRoot)) return;

  let domains;
  try {
    domains = readdirSync(modularizedRoot);
  } catch {
    return;
  }

  for (const domain of domains) {
    if (EXCLUDED_SUBDIRS.has(domain)) continue;
    const domainPath = join(modularizedRoot, domain);
    if (!isDirectory(domainPath)) continue;

    const label = `${displayRoot}/${domain}`;

    const hasImplementation = readdirSync(domainPath).some((fileName) =>
      isImplementationFile(fileName)
    );
    if (!hasImplementation) {
      console.log(`  ⚪️  Skipped ${label}/ (no implementation files)`);
      continue;
    }

    if (!hasTestStub(domainPath)) {
      console.log(`  📁 ${label}/`);
      console.error(`  ❌ ERROR: ${label}/ is missing a test stub (*.test.ts(x) or *.spec.ts(x))`);
      errorCount++;
      continue;
    }

    const sourceFiles = readdirSync(domainPath).filter((fileName) =>
      isImplementationFile(fileName)
    );
    const testFiles = readdirSync(domainPath).filter((fileName) =>
      TEST_FILE_PATTERN.test(fileName)
    );

    const allSymbols = [];
    const untestedSymbols = [];

    for (const sourceFile of sourceFiles) {
      if (VALIDATION_FILE_PATTERN.test(sourceFile)) continue;
      const content = readFileSync(join(domainPath, sourceFile), 'utf-8');
      for (const sym of extractExportSymbols(content)) {
        allSymbols.push({ ...sym, source: sourceFile });
      }
    }

    let allTestSubjects = [];
    for (const testFileName of testFiles) {
      allTestSubjects.push(
        ...extractTestSubjects(readFileSync(join(domainPath, testFileName), 'utf-8'))
      );
    }

    for (const sym of allSymbols) {
      if (!isSymbolTested(sym.name, allTestSubjects)) {
        untestedSymbols.push(sym);
      }
    }

    if (untestedSymbols.length > 0) {
      console.log(`  📁 ${label}/`);
      for (const untestedSymbol of untestedSymbols) {
        const kindLabel = untestedSymbol.kind === 'method' ? 'method' : 'export';
        console.error(
          `  ❌   ${untestedSymbol.name} (${kindLabel} in ${basename(untestedSymbol.source)}) — no describe/it/test mentions "${untestedSymbol.name}"`
        );
      }
      missingSymbolsTotal += untestedSymbols.length;
      errorCount += untestedSymbols.length;
    } else {
      console.log(
        `  ✅ ${label}/ (${allSymbols.length} export${allSymbols.length !== 1 ? 's' : ''}, all covered)`
      );
    }
  }
}

console.log('\n🧪 Checking MangaVerse test coverage per modularized folder...\n');

const roots = resolveRoots();
if (roots.length === 0) {
  console.log('  ⚪️  No source roots found — nothing to check.\n');
}

for (const root of roots) {
  for (const dir of MODULARIZED_DIRS) {
    validateModularizedRoot(join(root, dir), dir);
  }
}

const status = errorCount === 0 ? '✅' : '❌';
console.log(
  `\n${status} Test coverage check complete. Errors: ${errorCount} (${missingSymbolsTotal} missing tests)\n`
);

if (errorCount > 0) {
  console.error(
    '  Every modularized domain folder must have a test stub and every exported symbol\n' +
      '  must be referenced in a describe/it/test string.\n'
  );
  process.exit(1);
}
