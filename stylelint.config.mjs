/* eslint-disable unicorn/no-null */
/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "source",
          "utility",
          "variant",
          "custom-variant",
          "plugin",
        ],
      },
    ],
    "custom-property-pattern": null,
    "function-no-unknown": [
      true,
      {
        ignoreFunctions: ["theme"],
      },
    ],
    "import-notation": null,
    "media-query-no-invalid": [
      true,
      {
        ignoreFunctions: ["theme"],
      },
    ],
    "order/order": [["custom-properties", "declarations", "rules", "at-rules"]],
    "order/properties-order": [["all"], { unspecified: "bottomAlphabetical" }],
    "selector-class-pattern": null,
    "selector-id-pattern": null,
  },
};
