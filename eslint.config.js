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
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  {
    ignores: ["dist/", ".astro/", "coverage/", "content/", "public/"],
  },
  eslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  perfectionist.configs["recommended-natural"],
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      "unicorn/filename-case": "off",
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
    extends: [...tsEslint.configs.recommendedTypeChecked],
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
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
    },
    settings: {
      "better-tailwindcss": {
        // tailwindcss 4: the path to the entry file of the css based tailwind config (eg: `src/global.css`)
        entryPoint: "src/layouts/tailwind.css",
      },
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      "better-tailwindcss": eslintPluginBetterTailwindcss,
      react,
      "react-compiler": reactCompiler,
    },
    rules: {
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      ...react.configs.recommended.rules,
      "react-compiler/react-compiler": "error",
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      "better-tailwindcss": {
        attributes: [...getDefaultAttributes(), ".*Classes"],
        callees: [...getDefaultCallees(), "ccn"],
        entryPoint: "src/layouts/tailwind.css",
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
    },
  },
);
