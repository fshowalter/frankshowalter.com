import type { Font } from "satori";

import fs from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";

import type { OpenGraphImageComponentType } from "~/components/Home/OpenGraphImage";

// Font data cache to avoid reading fonts multiple times
let fontDataCache: Font[] | undefined;

type OpenGraphImageComponent = OpenGraphImageComponentType;

export async function componentToImage(
  component: ReturnType<OpenGraphImageComponent>,
): Promise<Uint8Array<ArrayBuffer>> {
  const svg = await componentToSvg(component);
  return (await sharp(Buffer.from(svg))
    .jpeg({
      mozjpeg: false,
      progressive: false,
      quality: 90,
    })
    .toBuffer()) as Uint8Array<ArrayBuffer>;
}

async function componentToSvg(component: ReturnType<OpenGraphImageComponent>) {
  const fonts = await getFontData();

  return await satori(component, {
    fonts,
    height: 630,
    width: 1200,
  });
}

async function getFontData() {
  if (fontDataCache) {
    return fontDataCache;
  }

  const [frankRuhlLibreExtraBold, assistantBold, assistantSemiBold] =
    await Promise.all([
      fs.readFile(
        "./public/fonts/Frank-Ruhl-Libre/Frank-Ruhl-Libre-ExtraBold.ttf",
      ),
      fs.readFile("./public/fonts/Assistant/Assistant-Bold.ttf"),
      fs.readFile("./public/fonts/Assistant/Assistant-SemiBold.ttf"),
    ]);

  fontDataCache = [
    {
      data: frankRuhlLibreExtraBold.buffer as ArrayBuffer,
      name: "FrankRuhlLibre",
      weight: 800,
    },
    {
      data: assistantBold.buffer as ArrayBuffer,
      name: "Assistant",
      weight: 700,
    },
    {
      data: assistantSemiBold.buffer as ArrayBuffer,
      name: "Assistant",
      weight: 600,
    },
  ];

  return fontDataCache;
}
