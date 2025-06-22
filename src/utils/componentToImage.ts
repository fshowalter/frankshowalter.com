import type { JSX } from "react";

import fs from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";

export async function componentToImage(component: JSX.Element) {
  return await sharp(Buffer.from(await componentToSvg(component)))
    .jpeg()
    .toBuffer();
}

async function componentToSvg(component: JSX.Element) {
  return await satori(component, {
    fonts: [
      {
        data: await fs.readFile(
          "./public/fonts/Frank-Ruhl-Libre/Frank-Ruhl-Libre-Regular.ttf",
        ),
        name: "FrankRuhlLibre",
        weight: 400,
      },
      {
        data: await fs.readFile(
          "./public/fonts/ArgentumSans/ArgentumSans-Regular.ttf",
        ),
        name: "ArgentumSans",
        weight: 400,
      },
      {
        data: await fs.readFile(
          "./public/fonts/ArgentumSans/ArgentumSans-SemiBold.ttf",
        ),
        name: "ArgentumSans",
        weight: 600,
      },
    ],
    height: 630,
    width: 1200,
  });
}
