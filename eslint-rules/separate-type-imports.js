// @ts-check

/**
 * AIDEV-NOTE: This ESLint rule is written in JavaScript with JSDoc types instead of TypeScript.
 * While TypeScript would provide better type safety during development, ESLint cannot directly
 * consume TypeScript rules - they must be compiled to JavaScript first. Since this rule is
 * stable and unlikely to change frequently, we chose to avoid the compilation/build overhead
 * and write it directly in JavaScript with JSDoc types for editor support and @ts-check for
 * basic type checking.
 */

/**
 * ESLint rule to enforce separate type imports
 * Splits mixed imports like `import { type Foo, bar }` into:
 * - `import type { Foo }`
 * - `import { bar }`
 *
 * @typedef {import('estree').ImportDeclaration} ImportDeclaration
 * @typedef {import('estree').ImportSpecifier} ImportSpecifier
 * @typedef {import('estree').ImportDefaultSpecifier} ImportDefaultSpecifier
 * @typedef {import('estree').ImportNamespaceSpecifier} ImportNamespaceSpecifier
 * @typedef {import('estree').Identifier} Identifier
 * @typedef {import('estree').Literal} Literal
 */

/**
 * @typedef {ImportDeclaration & { importKind?: 'type' | 'value' }} ImportDeclarationWithKind
 * @typedef {ImportSpecifier & { importKind?: 'type' | 'value' }} ImportSpecifierWithKind
 */

/**
 * Build named imports part with proper comma placement
 * @param {ImportSpecifierWithKind[]} namedImports - The named import specifiers
 * @param {boolean} hasPrevious - Whether there are previous import parts (default or namespace)
 * @returns {string} The formatted named imports string
 */
function buildNamedImportsPart(namedImports, hasPrevious) {
  if (namedImports.length === 0) {
    return "";
  }
  const namedImportStr = namedImports
    .map((spec) => buildNamedSpecifier(spec))
    .join(", ");
  return hasPrevious ? `, { ${namedImportStr} }` : `{ ${namedImportStr} }`;
}

/**
 * Build import string for a named specifier
 * @param {ImportSpecifierWithKind} spec - The import specifier
 * @returns {string} The formatted specifier string
 */
function buildNamedSpecifier(spec) {
  const imported = /** @type {Identifier} */ (spec.imported);
  const local = spec.local;
  if (imported.name === local.name) {
    return imported.name;
  }
  return `${imported.name} as ${local.name}`;
}

/**
 * Build namespace import part with proper comma placement
 * @param {ImportNamespaceSpecifier[]} namespaceImports - The namespace import specifiers
 * @param {boolean} hasDefault - Whether there's a default import
 * @returns {string} The formatted namespace import string
 */
function buildNamespaceImportPart(namespaceImports, hasDefault) {
  if (namespaceImports.length === 0) {
    return "";
  }
  const namespaceStr = `* as ${namespaceImports[0].local.name}`;
  return hasDefault ? `, ${namespaceStr}` : namespaceStr;
}

/**
 * Safely format the import source string
 * @param {Literal} source - The import source literal
 * @returns {string} The properly quoted source string
 */
function formatImportSource(source) {
  // If source.raw exists and is a string, use it directly
  if (typeof source.raw === "string") {
    return source.raw;
  }

  // Otherwise, wrap source.value in quotes
  if (typeof source.value === "string") {
    // Check if it already has quotes
    if (source.value.startsWith('"') || source.value.startsWith("'")) {
      return source.value;
    }
    return `"${source.value}"`;
  }

  // Fallback - shouldn't happen in practice
  return `"${String(source.value)}"`;
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  create(context) {
    return {
      ImportDeclaration(node) {
        const importNode = /** @type {ImportDeclarationWithKind} */ (node);

        // Skip if it's already a type-only import
        if (importNode.importKind === "type") {
          return;
        }

        // Check if there are mixed type and value specifiers
        /** @type {ImportSpecifierWithKind[]} */
        const typeSpecifiers = [];
        /** @type {(ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifierWithKind)[]} */
        const valueSpecifiers = [];

        for (const specifier of importNode.specifiers) {
          if (specifier.type === "ImportSpecifier") {
            const importSpec = /** @type {ImportSpecifierWithKind} */ (
              specifier
            );
            if (importSpec.importKind === "type") {
              typeSpecifiers.push(importSpec);
            } else {
              valueSpecifiers.push(importSpec);
            }
          } else {
            // ImportDefaultSpecifier or ImportNamespaceSpecifier
            valueSpecifiers.push(specifier);
          }
        }

        // If we have both type and value specifiers, report and fix
        if (typeSpecifiers.length > 0 && valueSpecifiers.length > 0) {
          context.report({
            fix(fixer) {
              /** @type {import('eslint').Rule.Fix[]} */
              const fixes = [];
              const sourceStr = formatImportSource(importNode.source);

              // Build the type import statement
              const typeImports = typeSpecifiers
                .map((spec) => buildNamedSpecifier(spec))
                .join(", ");

              const typeImportStatement = `import type { ${typeImports} } from ${sourceStr};`;

              // Build the value import statement
              let valueImportStatement = "";

              if (valueSpecifiers.length > 0) {
                // Handle default imports separately
                const defaultImports = valueSpecifiers.filter(
                  (s) => s.type === "ImportDefaultSpecifier",
                );
                const namespaceImports = valueSpecifiers.filter(
                  (s) => s.type === "ImportNamespaceSpecifier",
                );
                const namedImports = /** @type {ImportSpecifierWithKind[]} */ (
                  valueSpecifiers.filter((s) => s.type === "ImportSpecifier")
                );

                /** @type {string[]} */
                const importParts = [];

                // Add default import
                if (defaultImports.length > 0) {
                  importParts.push(defaultImports[0].local.name);
                }

                // Add namespace import with proper comma
                const namespaceImportPart = buildNamespaceImportPart(
                  /** @type {ImportNamespaceSpecifier[]} */ (namespaceImports),
                  defaultImports.length > 0,
                );
                if (namespaceImportPart) {
                  importParts.push(namespaceImportPart);
                }

                // Add named imports with proper comma
                const namedImportsPart = buildNamedImportsPart(
                  namedImports,
                  defaultImports.length > 0 || namespaceImports.length > 0,
                );
                if (namedImportsPart) {
                  importParts.push(namedImportsPart);
                }

                valueImportStatement = `import ${importParts.join("")} from ${sourceStr};`;
              }

              // Replace the original import with both statements
              const replacement =
                valueSpecifiers.length > 0
                  ? `${typeImportStatement}\n${valueImportStatement}`
                  : typeImportStatement;

              fixes.push(fixer.replaceText(importNode, replacement));

              return fixes;
            },
            messageId: "separateTypeImports",
            node: importNode,
          });
        }
      },
    };
  },

  meta: {
    docs: {
      category: "Style",
      description: "Enforce separate type imports",
      recommended: false,
    },
    fixable: "code",
    messages: {
      separateTypeImports:
        "Type imports should be in a separate import type declaration",
    },
    schema: [],
    type: "suggestion",
  },
};

export default rule;
