import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import compressor from "astro-compressor";
import { defineConfig } from "astro/config";

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
