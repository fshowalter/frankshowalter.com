import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { getContainerRenderer as reactContainerRenderer } from "@astrojs/react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import * as prettier from "prettier";
import { describe, it } from "vitest";

import { normalizeSrcs } from "~/utils/normalizeSrcs";

import Index from "./index.astro";

describe("/", () => {
  it("matches snapshot", { timeout: 40_000 }, async ({ expect }) => {
    const renderers = await loadRenderers([reactContainerRenderer()]);
    const container = await AstroContainer.create({ renderers });
    const result = await container.renderToString(
      Index as AstroComponentFactory,
      {
        partial: false,
        request: new Request(`https://www.frankshowalter.com/`),
      },
    );

    await expect(
      await prettier.format(normalizeSrcs(result), {
        filepath: "index.html",
      }),
    ).toMatchFileSnapshot(`__snapshots__/index.html`);
  });
});
