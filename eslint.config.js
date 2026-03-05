import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginSeparateTypeImports from "eslint-plugin-separate-type-imports";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tsEslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/", ".astro/", "coverage/", "content/", "public/"],
  },
  eslint.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  eslintPluginSeparateTypeImports.configs.recommended,
  perfectionist.configs["recommended-natural"],
  tsEslint.configs.recommendedTypeChecked,
  eslintPluginAstro.configs.recommended,
  eslintPluginBetterTailwindcss.configs["recommended-error"],
  {
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/css/tailwind.css",
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "off", // Turned off in favor of our custom rule
      "@typescript-eslint/no-import-type-side-effects": "error",
      ...eslintPluginBetterTailwindcss.configs["recommended-error"].rules,
      "better-tailwindcss/no-conflicting-classes": "error",
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
      "unicorn/filename-case": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/prevent-abbreviations": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        extraFileExtensions: [".astro"],
        project: true,
        tsconfigRootDir: import.meta.dirname,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
  },
  {
    extends: [tsEslint.configs.disableTypeChecked],
    ...tsEslint.configs.eslintRecommended,
    files: ["**/*.astro"],
  },
);
