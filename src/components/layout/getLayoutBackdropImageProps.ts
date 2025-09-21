import { getBackdropImageProps } from "~/api/backdrops";

import { BackdropImageConfig } from "./Backdrop";

/**
 * Fetches backdrop image properties for the layout component.
 * @param slug - The slug identifier for the backdrop image
 * @returns Backdrop image properties configured for layout use
 */
export async function getLayoutBackdropImageProps(slug: string) {
  return getBackdropImageProps(slug, BackdropImageConfig);
}
