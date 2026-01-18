import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import {
  getDefaultAttributes,
  getDefaultCallees,
} from "eslint-plugin-better-tailwindcss/api/defaults";
import perfectionist from "eslint-plugin-perfectionist";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

import separateTypeImports from "./eslint-rules/separate-type-imports.js";

export default defineConfig(
  {
    ignores: [
      "dist/",
      ".astro/",
      "coverage/",
      "content/",
      "public/",
      "scripts/",
    ],
  },
  eslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  reactHooks.configs.flat.recommended,
  perfectionist.configs["recommended-natural"],
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    files: ["*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    extends: [tseslint.configs.recommendedTypeChecked],
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    plugins: {
      local: {
        rules: {
          "separate-type-imports": separateTypeImports,
        },
      },
    },
    rules: {
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "off", // Turned off in favor of our custom rule
      "@typescript-eslint/no-import-type-side-effects": "error",
      "local/separate-type-imports": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "no relative imports outside current folder",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.astro"],
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      "better-tailwindcss/no-conflicting-classes": "error",
    },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/css/tailwind.css",
      },
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
      "react/boolean-prop-naming": "error",
      "react/button-has-type": "error",
      "react/react-in-jsx-scope": "off",
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      "@typescript-eslint/explicit-function-return-type": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-unknown-classes": [
        "error",
        { detectComponentClasses: true },
      ],
    },
    settings: {
      "better-tailwindcss": {
        attributes: [...getDefaultAttributes(), ".*Classes"],
        callees: [...getDefaultCallees(), "ccn"],
        entryPoint: "src/css/tailwind.css",
      },
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["src/**/?(*.)+(spec|test).[jt]s?(x)"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": [
        "error",
        {
          assertFunctionNames: [
            "expect",
            "filterDrawerTests.testOpenClose",
            "filterDrawerTests.testEscapeKey",
            "filterDrawerTests.testClickOutside",
            "filterDrawerTests.testViewResultsButton",
            "filterDrawerTests.testDesktopScroll",
          ],
        },
      ],
    },
  },
);
