const EXCLUDED_NAMES = new Set([
  'navigate',
  'redirect',
  'dispatch',
  'reload',
  'refresh',
  'toString',
  'toFixed',
  'toLocaleString',
  'preventDefault',
  'stopPropagation',
  'forwardRef',
  'memo',
  'createContext',
  'createRef',
]);

const ARRAY_METHODS = new Set([
  'map',
  'filter',
  'reduce',
  'forEach',
  'find',
  'some',
  'every',
  'flatMap',
  'flat',
  'includes',
  'indexOf',
  'findIndex',
]);

const TEST_FRAMEWORK = new Set([
  'describe',
  'it',
  'test',
  'expect',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll',
  'vi',
  'jest',
]);

/**
 * Determine whether a call name is exempt from the inline-comment requirement.
 *
 * @param {string|null} name - The resolved call name.
 * @param {object} callee - The ESTree callee node.
 * @returns {boolean} True if the call is exempt.
 */
function isExcludedCall(name, callee) {
  if (!name) return true;
  if (/^use[A-Z]/.test(name)) return true; // React hooks
  if (/^set[A-Z]/.test(name)) return true; // React state setters
  if (TEST_FRAMEWORK.has(name)) return true;
  if (EXCLUDED_NAMES.has(name)) return true;

  if (ARRAY_METHODS.has(name) && callee.type === 'MemberExpression') return true;

  if (
    callee.type === 'MemberExpression' &&
    callee.object?.type === 'Identifier' &&
    (callee.object.name === 'console' || callee.object.name === 'Math')
  ) {
    return true;
  }

  return false;
}

/**
 * MangaVerse custom ESLint rule: require an inline comment immediately above
 * (or on the same line as) any statement-level function call that performs
 * non-trivial work. Mirrors the AO Holdings `require-call-comment` standard.
 */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require an inline comment before function calls that perform complex logic.',
    },
    messages: {
      missingComment: 'Add a brief inline comment describing what this function call does.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    /**
     * Checks whether a comment exists on the line above or the same line as the node.
     *
     * @param {object} node - The CallExpression node.
     * @returns {boolean} True if a comment is present.
     */
    function hasCommentOnLineAboveOrSame(node) {
      const line = node.loc.start.line;
      const comments = sourceCode.getAllComments();
      return comments.some(
        (comment) => comment.loc.end.line === line || comment.loc.end.line === line - 1
      );
    }

    /**
     * Resolves the called function name from a callee node.
     *
     * @param {object} callee - The callee node.
     * @returns {string|null} The call name.
     */
    function getCallName(callee) {
      if (!callee) return null;
      if (callee.type === 'Identifier') return callee.name;
      if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
        return callee.property.name;
      }
      return null;
    }

    /**
     * Validates a call expression and reports if no comment is present.
     *
     * @param {object} node - The CallExpression node.
     * @returns {void}
     */
    function checkCall(node) {
      if (!node || node.type !== 'CallExpression') return;
      if (isExcludedCall(getCallName(node.callee), node.callee)) return;
      if (hasCommentOnLineAboveOrSame(node)) return;
      context.report({ node, messageId: 'missingComment' });
    }

    return {
      'ExpressionStatement > CallExpression'(node) {
        checkCall(node);
      },
      'ExpressionStatement > AwaitExpression > CallExpression'(node) {
        checkCall(node);
      },
      'VariableDeclarator > CallExpression'(node) {
        checkCall(node);
      },
      'VariableDeclarator > AwaitExpression > CallExpression'(node) {
        checkCall(node);
      },
    };
  },
};
