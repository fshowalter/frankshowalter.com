import type { HmrContext } from "vite";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import playformInline from "@playform/inline";
import tailwindcss from "@tailwindcss/vite";
import compressor from "astro-compressor";
import { defineConfig } from "astro/config";

function contentHmr() {
  return {
    enforce: "post" as const,
    // HMR
    handleHotUpdate({ file, server }: HmrContext) {
      console.log(file);
      if (file.includes("/content/")) {
        console.log("reloading content file...");
        server.ws.send({
          path: "*",
          type: "full-reload",
        });
      }
    },
    name: "content-hmr",
  };
}

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) => page !== "https://www.frankshowalter.com/gone/",
    }),
    playformInline(),
    compressor(),
  ],
  site: "https://www.frankshowalter.com",
  trailingSlash: "always",
  vite: {
    optimizeDeps: {
      exclude: ["fsevents"],
    },
    plugins: [
      tailwindcss(),
      contentHmr(),
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", {}]],
        },
      }),
    ],
  },
});
