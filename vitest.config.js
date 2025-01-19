/// <reference types="vitest" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    coverage: {
      include: ["src/**"],
      provider: "istanbul",
    },
    globals: true, // needed for testing-library teardown
    // Vitest configuration options
    setupFiles: ["setupTests.ts"],
    workspace: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["src/pages/**/*.spec.ts"],
          name: "pages-node",
        },
      },
    ],
  },
});
