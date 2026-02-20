import type { AstroIntegration } from "astro";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import compressor from "astro-compressor";
import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createIndex } from "pagefind";

function pagefind(): AstroIntegration {
  let outDir: string;

  return {
    hooks: {
      "astro:build:done": async ({ logger }) => {
        if (!outDir) {
          logger.warn(
            "astro-pagefind couldn't reliably determine the output directory. Search index will not be built.",
          );
          return;
        }

        const { errors: createErrors, index } = await createIndex({});

        if (!index) {
          logger.error("Pagefind failed to create index");
          for (const e of createErrors) logger.error(e);
          return;
        }

        const { errors: addErrors, page_count } = await index.addDirectory({
          path: outDir,
        });

        if (addErrors.length > 0) {
          logger.error("Pagefind failed to index files");
          for (const e of addErrors) logger.error(e);
          return;
        } else {
          logger.info(`Pagefind indexed ${page_count} pages`);
        }

        const { errors: writeErrors, outputPath } = await index.writeFiles({
          outputPath: path.join(outDir, "pagefind"),
        });

        if (writeErrors.length > 0) {
          logger.error("Pagefind failed to write index");
          for (const e of writeErrors) logger.error(e);
          return;
        } else {
          logger.info(`Pagefind wrote index to ${outputPath}`);
        }
      },
      "astro:config:setup": ({ config }) => {
        outDir = fileURLToPath(config.outDir);
      },
    },
    name: "pagefind",
  };
}

// https://astro.build/config
export default defineConfig({
  build: {
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
  image: {
    service: {
      config: {
        kernel: "mks2021",
      },
      entrypoint: "astro/assets/services/sharp",
    },
  },
  integrations: [
    react({
      babel: {
        plugins: process.env.TEST_COVERAGE
          ? []
          : [["babel-plugin-react-compiler"]],
      },
    }),
    sitemap({
      filter: (page) => page !== "https://www.frankshowalter.com/gone/",
    }),
    pagefind(),
    compressor(),
  ],
  site: "https://www.frankshowalter.com",
  trailingSlash: "always",
  vite: {
    optimizeDeps: {
      exclude: ["fsevents"],
    },
    plugins: [tailwindcss()],
  },
});
