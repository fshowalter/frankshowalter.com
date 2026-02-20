import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";

import { HomeOpenGraphImage } from "./HomeOpenGraphImage";

describe("HomeOpenGraphImage", () => {
  it("renders site title", ({ expect }) => {
    render(<HomeOpenGraphImage />);
    expect(screen.getByTestId("title")).toBeDefined();
  });

  it("renders tagline", ({ expect }) => {
    render(<HomeOpenGraphImage />);
    expect(screen.getByTestId("tagline")).toBeDefined();
  });
});
