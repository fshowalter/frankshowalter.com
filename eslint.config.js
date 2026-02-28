import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import perfectionist from "eslint-plugin-perfectionist";
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
    files: ["**/*.ts"],
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
);
