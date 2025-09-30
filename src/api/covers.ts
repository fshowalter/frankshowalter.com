import { getImage } from "astro:assets";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import {
  createCacheConfig,
  createCacheKey,
  ensureCacheDir,
  getCachedItem,
  saveCachedItem,
} from "~/utils/cache";

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

/**
 * Type representing a work with a slug identifier.
 * Used for cover image processing functions.
 */
type Work = {
  slug: string;
};

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/content/assets/covers/*.png",
);

const cacheConfig = createCacheConfig("cover-base64");

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
 * Calculates the proportional width for a work's cover image given a target height.
 * Maintains the original aspect ratio of the cover image.
 *
 * @param work - Work object containing slug for cover identification
 * @param targetHeight - Desired height in pixels
 * @returns Promise resolving to calculated width, or 0 if error occurs
 *
 * @example
 * ```typescript
 * const width = await getCoverWidth({ slug: 'book-slug' }, 400);
 * console.log(width); // e.g., 267 for a 2:3 aspect ratio
 * ```
 */
export async function getCoverWidth(work: Work, targetHeight: number) {
  try {
    const coverPath = getWorkCoverPath(work);
    const { height, width } = await sharp(coverPath).metadata();

    return (width / height) * targetHeight;
  } catch (error) {
    console.error(`Error processing cover ${work.slug}:`, error);
    return 0;
  }
}

/**
 * Generates optimized cover image properties for RSS/Atom feeds.
 * Creates a fixed-size JPEG image (500x750) suitable for feed readers.
 *
 * @param work - Work object containing slug for cover identification
 * @returns Promise resolving to cover image properties for feeds
 *
 * @example
 * ```typescript
 * const feedCover = await getFeedCoverProps({ slug: 'book-slug' });
 * console.log(feedCover.width, feedCover.height); // 500, 750
 * ```
 */
export async function getFeedCoverProps(work: Work): Promise<CoverImageProps> {
  const workCoverFile = await getWorkCoverFile(work);

  const optimizedImage = await getImage({
    format: "jpeg",
    height: 750,
    quality: 80,
    src: workCoverFile.default,
    width: 500,
  });

  return {
    height: 750,
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
    width: 500,
  };
}

/**
 * Generates optimized cover image properties with fixed dimensions and 2x density support.
 * Creates AVIF images with the exact specified width and calculated proportional height.
 *
 * @param work - Work object containing slug for cover identification
 * @param options - Configuration object
 * @param options.width - Target width in pixels
 * @returns Promise resolving to cover image properties with fixed dimensions
 *
 * @example
 * ```typescript
 * const fixedCover = await getFixedCoverImageProps({ slug: 'book-slug' }, { width: 200 });
 * console.log(fixedCover.width); // 200
 * console.log(fixedCover.srcSet); // Includes 1x and 2x density variants
 * ```
 */
export async function getFixedCoverImageProps(
  work: Work,
  { width }: { width: number },
): Promise<CoverImageProps> {
  const workCoverFile = await getWorkCoverFile(work);
  const workCoverPath = getWorkCoverPath(work);

  const height = await getCoverHeight(workCoverPath, width);

  const optimizedImage = await getImage({
    densities: [1, 2],
    format: "avif",
    height,
    quality: 80,
    src: workCoverFile.default,
    width: width,
  });

  return {
    height,
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
    width: width,
  };
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
  work: Work,
  { width }: { width: number },
): Promise<CoverImageProps> {
  const workCoverFile = await getWorkCoverFile(work);
  const coverFilePath = getWorkCoverPath(work);
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
 * Generates a base64-encoded cover image for Open Graph meta tags.
 * Creates a 420px wide PNG with caching support for better build performance.
 *
 * @param work - Work object containing slug for cover identification
 * @returns Promise resolving to base64 data URL string
 *
 * @example
 * ```typescript
 * const ogCover = await getOpenGraphCoverAsBase64String({ slug: 'book-slug' });
 * // Use in meta tag: <meta property="og:image" content={ogCover} />
 * ```
 */
export async function getOpenGraphCoverAsBase64String(work: Work) {
  const width = 420;
  const format = "png";
  let cacheKey = "";

  if (cacheConfig.enableCache) {
    await ensureCacheDir(cacheConfig.cacheDir);

    const cacheKeyData = `${work.slug}-${width}-${format}`;
    cacheKey = createCacheKey(cacheKeyData);

    const cachedCover = await getCachedItem<string>(
      cacheConfig.cacheDir,
      cacheKey,
      "txt",
      false,
      cacheConfig.debugCache,
      `Cover base64: ${work.slug}`,
    );

    if (cachedCover) {
      return cachedCover;
    }
  }

  const imageBuffer = await sharp(getWorkCoverPath(work))
    .resize(width)
    .toFormat(format)
    .toBuffer();

  const base64String = `data:${"image/png"};base64,${imageBuffer.toString("base64")}`;

  if (cacheConfig.enableCache) {
    await saveCachedItem(cacheConfig.cacheDir, cacheKey, "txt", base64String);
  }

  return base64String;
}

/**
 * Generates optimized cover image URL for structured data (JSON-LD).
 * Creates a fixed-size JPEG image (500x750) suitable for search engine markup.
 *
 * @param work - Work object containing slug for cover identification
 * @returns Promise resolving to optimized image URL
 *
 * @example
 * ```typescript
 * const structuredDataSrc = await getStructuredDataCoverSrc({ slug: 'book-slug' });
 * // Use in JSON-LD structured data
 * ```
 */
export async function getStructuredDataCoverSrc(work: Work): Promise<string> {
  const workCoverFile = await getWorkCoverFile(work);

  const optimizedImage = await getImage({
    format: "jpeg",
    height: 750,
    quality: 80,
    src: workCoverFile.default,
    width: 500,
  });

  return normalizeSources(optimizedImage.src);
}

/**
 * Generates high-quality cover image properties for update notifications.
 * Creates a PNG image with maximum quality (100%) for newsletter/update contexts.
 *
 * @param work - Work object containing slug for cover identification
 * @returns Promise resolving to high-quality cover image properties
 *
 * @example
 * ```typescript
 * const updateCover = await getUpdateCoverProps({ slug: 'book-slug' });
 * console.log(updateCover.width); // Always 500px
 * ```
 */
export async function getUpdateCoverProps(
  work: Work,
): Promise<CoverImageProps> {
  const coverFile = await getWorkCoverFile(work);

  const coverFilePath = getWorkCoverPath(work);
  const height = await getCoverHeight(coverFilePath, 500);

  const optimizedImage = await getImage({
    format: "png",
    height,
    quality: 100,
    src: coverFile.default,
    width: 500,
  });

  return {
    height,
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
    width: 500,
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
export function getWorkCoverPath(work: Work) {
  const workCover = coverPath(work.slug);

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
async function getWorkCoverFile(work: Work) {
  const coverKey = Object.keys(images).find((image) => {
    return image.endsWith(`${work.slug}.png`);
  });

  if (coverKey) {
    return await images[coverKey]();
  }

  const defaultWorkCoverKey = Object.keys(images).find((image) => {
    return image.endsWith(`default.png`);
  })!;

  return await images[defaultWorkCoverKey]();
}
