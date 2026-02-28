import type { APIRoute } from "astro";
import type { Font } from "satori";

import fs from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";

// Font data cache to avoid reading fonts multiple times
let fontDataCache: Font[] | undefined;

async function getFontData(): Promise<Font[]> {
  if (fontDataCache) {
    return fontDataCache;
  }

  const [frankRuhlLibreExtraBold, assistantSemiBold] = await Promise.all([
    fs.readFile(
      "./public/fonts/Frank-Ruhl-Libre/Frank-Ruhl-Libre-ExtraBold.ttf",
    ),
    fs.readFile("./public/fonts/Assistant/Assistant-SemiBold.ttf"),
  ]);

  fontDataCache = [
    {
      data: frankRuhlLibreExtraBold.buffer,
      name: "FrankRuhlLibre",
      weight: 800,
    },
    {
      data: assistantSemiBold.buffer,
      name: "Assistant",
      weight: 600,
    },
  ];

  return fontDataCache;
}

/**
 * API route handler for generating the Open Graph image.
 * Returns a JPEG image for social media sharing.
 */
export const GET: APIRoute = async function get() {
  const fonts = await getFontData();

  const svg = await satori(
    {
      key: null, // eslint-disable-line  unicorn/no-null
      props: {
        children: [
          {
            props: {
              children: [
                {
                  props: {
                    children: "Frank Showalter",
                    style: {
                      color: "#252525",
                      display: "flex",
                      fontFamily: "FrankRuhlLibre",
                      fontSize: "72px",
                      fontWeight: 800,
                      lineHeight: 1,
                    },
                  },
                  type: "div",
                },
                {
                  props: {
                    children: [
                      "Mostly ",
                      {
                        props: {
                          children: "movie reviews",
                          style: {
                            color: "#bf8a00",
                          },
                        },
                        type: "span",
                      },
                      ", sometimes ",
                      {
                        props: {
                          children: "book reviews",
                          style: {
                            color: "#bf8a00",
                          },
                        },
                        type: "span",
                      },
                      ".",
                    ],
                    style: {
                      color: "rgb(0,0,0,.6)",
                      display: "flex",
                      fontFamily: "Assistant",
                      fontSize: "20px",
                      fontWeight: 600,
                      lineHeight: "1.25",
                      marginTop: "8px",
                    },
                  },
                  type: "div",
                },
              ],
              style: {
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
                width: "100%",
              },
            },
            type: "div",
          },
        ],
        key: null, // eslint-disable-line  unicorn/no-null
        style: {
          backgroundColor: "#f4f1ea",
          display: "flex",
          height: "630px",
          position: "relative",
          width: "1200px",
        },
      },
      type: "div",
    },
    {
      fonts,
      height: 630,
      width: 1200,
    },
  );

  const jpeg = (await sharp(Buffer.from(svg))
    .jpeg()
    .toBuffer()) as Uint8Array<ArrayBuffer>;

  return new Response(jpeg, {
    headers: {
      "Content-Type": "image/jpg",
    },
  });
};
