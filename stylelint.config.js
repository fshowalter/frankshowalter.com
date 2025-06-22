/* eslint-disable unicorn/no-null */
/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-order"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["theme", "layer", "utility", "component"],
      },
    ],
    "custom-property-empty-line-before": null,
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
    "no-descending-specificity": null,
    "order/order": [["custom-properties", "declarations", "rules", "at-rules"]],
    "order/properties-order": [["all"], { unspecified: "bottomAlphabetical" }],
    "selector-class-pattern": null,
    "selector-id-pattern": null,
  },
};
