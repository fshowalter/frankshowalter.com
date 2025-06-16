/** @type {import("prettier").Config} */
export default {
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
    {
      files: ["**/__snapshots__/**/*.html"],
      options: {
        plugins: [],
      },
    },
  ],
  plugins: ["prettier-plugin-astro"],
};
