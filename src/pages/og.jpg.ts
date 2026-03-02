import type { APIRoute } from "astro";

import fs from "node:fs/promises";
import { Renderer } from "@takumi-rs/core";
import { node, stylesheets } from "~/features/home/og";

const fonts = [
  {
    name: "FrankRuhlLibre",
    data: await fs.readFile(
      "./public/fonts/Frank-Ruhl-Libre/Frank-Ruhl-Libre-ExtraBold.ttf",
    ),
    weight: 800,
  },
  {
    name: "FrankRuhlLibre",
    data: await fs.readFile("./public/fonts/Assistant/Assistant-SemiBold.ttf"),
    weight: 600,
  },
];

const renderer = new Renderer({
  fonts,
});

/**
 * API route handler for generating the Open Graph image.
 * Returns a JPEG image for social media sharing.
 */
export const GET: APIRoute = async function get() {
  const jpeg = await renderer.render(node, {
    width: 1200,
    height: 630,
    format: "jpeg",
    stylesheets,
  });

  return new Response(jpeg as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "image/jpg",
    },
  });
};
