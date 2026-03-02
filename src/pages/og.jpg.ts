import type { APIRoute } from "astro";

import { Renderer } from "@takumi-rs/core";
import fs from "node:fs/promises";

import { node, stylesheets } from "~/features/home/og";

const fonts = [
  {
    data: await fs.readFile(
      "./public/fonts/Frank-Ruhl-Libre/Frank-Ruhl-Libre-ExtraBold.ttf",
    ),
    name: "FrankRuhlLibre",
    weight: 800,
  },
  {
    data: await fs.readFile("./public/fonts/Assistant/Assistant-SemiBold.ttf"),
    name: "FrankRuhlLibre",
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
    format: "jpeg",
    height: 630,
    stylesheets,
    width: 1200,
  });

  return new Response(jpeg as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": "image/jpg",
    },
  });
};
