import type { HmrContext } from "vite";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
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
  build: {
    inlineStylesheets: "always",
  },
  devToolbar: {
    enabled: false,
  },
  experimental: {
    fonts: [
      {
        cssVariable: "--font-argentum-sans",
        fallbacks: [],
        name: "ArgentumSans",
        provider: "local",
        variants: [
          {
            display: "swap",
            src: ["./src/fonts/ArgentumSans/ArgentumSans-Light.woff2"],
            style: "normal",
            weight: 300,
          },
          {
            display: "swap",
            src: ["./src/fonts/ArgentumSans/ArgentumSans-Regular.woff2"],
            style: "normal",
            weight: 400,
          },
          {
            display: "swap",
            src: ["./src/fonts/ArgentumSans/ArgentumSans-Medium.woff2"],
            style: "normal",
            weight: 500,
          },
          {
            display: "swap",
            src: ["./src/fonts/ArgentumSans/ArgentumSans-SemiBold.woff2"],
            style: "normal",
            weight: 600,
          },
        ],
      },
      {
        cssVariable: "--font-frank-ruhl-libre",
        fallbacks: [],
        name: "FrankRuhlLibre",
        provider: "local",
        variants: [
          {
            display: "swap",
            src: [
              "./src/fonts/Frank-Ruhl-Libre/Frank-Ruhl-Libre_latin_300 900_normal.woff2",
            ],
            style: "normal",
            unicodeRange: [
              "U+0000-00FF",
              "U+0131",
              "U+0152-0153",
              "U+02BB-02BC",
              "U+02C6",
              "U+02DA",
              "U+02DC",
              "U+0304",
              "U+0308",
              "U+0329",
              "U+2000-206F",
              "U+2074",
              "U+20AC",
              "U+2122",
              "U+2191",
              "U+2193",
              "U+2212",
              "U+2215",
              "U+FEFF",
              "U+FFFD",
            ],
            weight: "300 900",
          },
        ],
      },
    ],
  },
  integrations: [
    react(),
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
