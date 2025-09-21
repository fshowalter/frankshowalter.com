// @ts-check

/**
 * AIDEV-NOTE: Test suite for the separate-type-imports ESLint rule.
 * Documents the expected behavior and ensures the rule correctly splits
 * mixed type/value imports into separate import statements.
 *
 * We use the TypeScript ESLint parser to understand the `type` keyword in imports.
 */

import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import rule from "./separate-type-imports.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    parser: tseslint.parser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
    sourceType: "module",
  },
});

ruleTester.run("separate-type-imports", rule, {
  invalid: [
    // Basic mixed import - type and value
    {
      code: `import { type Foo, bar } from "module";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { Foo } from "module";
import { bar } from "module";`,
    },
    // Multiple types and values mixed
    {
      code: `import { type Foo, type Bar, baz, qux } from "module";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { Foo, Bar } from "module";
import { baz, qux } from "module";`,
    },
    // Mixed with renamed imports
    {
      code: `import { type Foo as FooType, bar as barValue } from "module";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { Foo as FooType } from "module";
import { bar as barValue } from "module";`,
    },
    // Default import with mixed named imports
    {
      code: `import React, { type ComponentType, useState } from "react";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { ComponentType } from "react";
import React, { useState } from "react";`,
    },
    // Complex scenario with default and mixed named imports
    {
      code: `import Default, { type TypeA, type TypeB, valueA, valueB } from "module";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { TypeA, TypeB } from "module";
import Default, { valueA, valueB } from "module";`,
    },
    // Import with different quote styles (should preserve)
    {
      code: `import { type Foo, bar } from 'single-quotes';`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { Foo } from 'single-quotes';
import { bar } from 'single-quotes';`,
    },
    // Scoped package names
    {
      code: `import { type Config, setup } from "@company/package";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { Config } from "@company/package";
import { setup } from "@company/package";`,
    },
    // File path imports
    {
      code: `import { type Props, Component } from "./components/MyComponent";`,
      errors: [{ messageId: "separateTypeImports" }],
      output: `import type { Props } from "./components/MyComponent";
import { Component } from "./components/MyComponent";`,
    },
  ],

  valid: [
    // Already separated type imports
    {
      code: `import type { Foo } from "module";
import { bar } from "module";`,
    },
    // Type-only imports
    {
      code: `import type { Foo, Bar } from "module";`,
    },
    // Value-only imports
    {
      code: `import { foo, bar } from "module";`,
    },
    // Default imports
    {
      code: `import React from "react";`,
    },
    // Namespace imports
    {
      code: `import * as Utils from "utils";`,
    },
    // Mixed default and named imports (no types)
    {
      code: `import React, { useState, useEffect } from "react";`,
    },
    // Empty import (side effects only)
    {
      code: `import "styles.css";`,
    },
  ],
});
