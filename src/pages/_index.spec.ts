import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import { getContainerRenderer as reactContainerRenderer } from "@astrojs/react";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { promises as fs } from "node:fs";
import path from "node:path";
import { beforeEach, describe, it } from "vitest";

import Index from "./index.astro";

describe("/", () => {
  let result: string;

  beforeEach(async () => {
    const renderers = await loadRenderers([reactContainerRenderer()]);
    const container = await AstroContainer.create({ renderers });
    result = await container.renderToString(Index as AstroComponentFactory, {
      partial: false,
      request: new Request(`https://www.frankshowalter.com/`),
    });
  });

  it("includes movielog updates", async ({ expect }) => {
    const movielogData = await fs.readFile(
      path.join(__dirname, "../api/fixtures/data/movielog.json"),
      "utf8",
    );

    const updates = JSON.parse(movielogData) as { title: string }[];

    expect(updates.length).toBe(5);

    for (const update of updates) {
      expect(result).toContain(update.title.replaceAll("'", "&#x27;"));
    }
  });

  it("includes booklog updates", async ({ expect }) => {
    const movielogData = await fs.readFile(
      path.join(__dirname, "../api/fixtures/data/booklog.json"),
      "utf8",
    );

    const updates = JSON.parse(movielogData) as { title: string }[];

    expect(updates.length).toBe(4);

    for (const update of updates) {
      expect(result).toContain(update.title.replaceAll("'", "&#x27;"));
    }
  });
});
