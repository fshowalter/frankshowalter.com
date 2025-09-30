import { getImage } from "astro:assets";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { normalizeSources } from "./utils/normalizeSources";

/**
 * Type representing optimized cover image properties for display.
 * Contains dimensions and responsive image sources.
 */
export type CoverImageProps = {
  height: number;
  src: string;
  srcSet: string;
  width: number;
};

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/content/assets/covers/*.png",
);

/**
 * Calculates the proportional height for a cover image given a target width.
 * Maintains the original aspect ratio of the cover image.
 *
 * @param coverPath - File system path to the cover image
 * @param targetWidth - Desired width in pixels
 * @returns Promise resolving to calculated height, or 0 if error occurs
 *
 * @example
 * ```typescript
 * const height = await getCoverHeight('/path/to/cover.png', 300);
 * console.log(height); // e.g., 450 for a 2:3 aspect ratio
 * ```
 */
export async function getCoverHeight(coverPath: string, targetWidth: number) {
  try {
    const { height, width } = await sharp(coverPath).metadata();

    return (height / width) * targetWidth;
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
}

/**
 * Generates optimized cover image properties with responsive widths.
 * Creates AVIF images with multiple breakpoints (0.25x, 0.5x, 1x, 2x) for responsive display.
 *
 * @param work - Work object containing slug for cover identification
 * @param options - Configuration object
 * @param options.width - Base width in pixels for responsive calculations
 * @returns Promise resolving to cover image properties with responsive srcSet
 *
 * @example
 * ```typescript
 * const fluidCover = await getFluidCoverImageProps({ slug: 'book-slug' }, { width: 300 });
 * console.log(fluidCover.srcSet); // Multiple widths: 75w, 150w, 300w, 600w
 * ```
 */
export async function getFluidCoverImageProps(
  slug: string,
  { width }: { width: number },
): Promise<CoverImageProps> {
  const workCoverFile = await getWorkCoverFile(slug);
  const coverFilePath = getWorkCoverPath(slug);
  const height = await getCoverHeight(coverFilePath, width);

  const optimizedImage = await getImage({
    format: "avif",
    height,
    quality: 80,
    src: workCoverFile.default,
    width: width,
    widths: [0.25, 0.5, 1, 2].map((w) => w * width),
  });

  return {
    height,
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
    width,
  };
}

/**
 * Retrieves the file system path for a work's cover image.
 * Falls back to default cover if the specific work cover doesn't exist.
 *
 * @param work - Work object containing slug for cover identification
 * @returns File system path to cover image, or empty string if none exists
 *
 * @example
 * ```typescript
 * const coverPath = getWorkCoverPath({ slug: 'book-slug' });
 * console.log(coverPath); // '/path/to/content/assets/covers/book-slug.png'
 * ```
 */
export function getWorkCoverPath(slug: string) {
  const workCover = coverPath(slug);

  if (workCover) {
    return workCover;
  }

  return coverPath("default") || "";
}

/**
 * Internal function to resolve the file system path for a cover image.
 * Checks if the cover file exists in the content/assets/covers directory.
 *
 * @param slug - The work's unique slug identifier
 * @returns Absolute file path if cover exists, undefined otherwise
 */
function coverPath(slug: string) {
  const coverPath = path.resolve(`./content/assets/covers/${slug}.png`);
  if (fs.existsSync(coverPath)) {
    return coverPath;
  }

  return;
}

/**
 * Internal function to load cover file metadata using Vite's glob imports.
 * Falls back to default cover if the specific work cover doesn't exist.
 *
 * @param work - Work object containing slug for cover identification
 * @returns Promise resolving to cover image metadata
 */
async function getWorkCoverFile(slug: string) {
  const coverKey = Object.keys(images).find((image) => {
    return image.endsWith(`${slug}.png`);
  });

  if (coverKey) {
    return await images[coverKey]();
  }

  const defaultWorkCoverKey = Object.keys(images).find((image) => {
    return image.endsWith(`default.png`);
  })!;

  return await images[defaultWorkCoverKey]();
}
