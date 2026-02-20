/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    coverage: {
      include: ["src/**"],
      provider: "istanbul",
    },
    globals: true, // needed for testing-library teardown
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["src/pages/**/*.spec.ts"],
          name: "pages-node",
        },
      },
      {
        extends: true,
        test: {
          environment: "node",
          include: ["src/astro/**/*.spec.ts"],
          name: "layouts-node",
        },
      },
    ],
    // Vitest configuration options
    setupFiles: ["setupTests.ts"],
  },
});
