import type { ReactNode } from "react";

import { Renderer } from "@takumi-rs/core";
import { fromJsx } from "@takumi-rs/helpers/jsx";
import fs from "node:fs/promises";

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

export async function componentToImageResponse(
  component: ReactNode,
  fetchedResources: { data: ArrayBuffer; src: string }[],
): Promise<Response> {
  const { node, stylesheets } = await fromJsx(component);

  const image = await renderer.render(node, {
    fetchedResources,
    format: "jpeg",
    height: 630,
    quality: 80,
    stylesheets,
    width: 1200,
  });

  return new Response(image as ArrayBufferView<ArrayBuffer>, {
    headers: {
      "Content-Type": "image/jpg",
    },
  });
}
