import { experimental_AstroContainer as AstroContainer } from "astro/container";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";

import * as OgEndpoint from "./og.jpg.ts";

describe("/og.jpg", () => {
  it("matches file", { timeout: 40_000 }, async ({ expect }) => {
    const container = await AstroContainer.create();

    // @ts-expect-error astro signature is wrong
    const response = await container.renderToResponse(OgEndpoint, {
      routeType: "endpoint",
    });

    const result = Buffer.from(await response.arrayBuffer());

    const snapshotFile = path.join(
      import.meta.dirname,
      "__image_snapshots__",
      "og.jpg",
    );

    if (!fs.existsSync(snapshotFile)) {
      fs.writeFileSync(snapshotFile, result);
    }

    const snapshot = fs.readFileSync(snapshotFile);

    void expect(result.compare(snapshot)).toBe(0);
  });
});
