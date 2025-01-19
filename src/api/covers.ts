import { getImage } from "astro:assets";

import { normalizeSources } from "./utils/normalizeSources";

export type CoverImageProps = {
  src: string;
  srcSet: string;
};

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/content/assets/covers/*.png"
);

export async function getFluidCoverImageProps(
  slug: string,
  { height, width }: { height: number; width: number }
): Promise<CoverImageProps> {
  const coverKey = Object.keys(images).find((image) => {
    return image.endsWith(`${slug}.png`);
  });

  let cover;

  if (coverKey) {
    cover = await images[coverKey]();
  }

  if (!cover) {
    throw new Error(`No image for ${slug}`);
  }

  const optimizedImage = await getImage({
    format: "avif",
    height: height,
    quality: 80,
    src: cover.default,
    width: width,
    widths: [0.25, 0.5, 1, 2].map((w) => w * width),
  });

  return {
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
  };
}
