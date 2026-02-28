import { getBackdropImageProps } from "~/assets/backdrops";

import { BackdropImageConfig } from "./BackdropImageConfig";

/**
 * Fetches backdrop image properties for the layout component.
 * @param slug - The slug identifier for the backdrop image
 * @returns Backdrop image properties configured for layout use
 */
export async function getHeroBackdropImageProps(slug: string) {
  return getBackdropImageProps(slug, BackdropImageConfig);
}
