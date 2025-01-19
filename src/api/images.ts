import { getImage } from "astro:assets";

import { normalizeSources } from "./utils/normalizeSources";

export type ImageProps = {
  src: string;
  srcSet: string;
};

const covers = import.meta.glob<{ default: ImageMetadata }>(
  "/content/assets/covers/*.png"
);

const posters = import.meta.glob<{ default: ImageMetadata }>(
  "/content/assets/posters/*.png"
);

async function getCover(slug: string) {
  const coverKey = Object.keys(covers).find((image) => {
    return image.endsWith(`${slug}.png`);
  });

  let cover;

  if (coverKey) {
    cover = await covers[coverKey]();
  }

  if (!cover) {
    throw new Error(`No cover for ${slug}`);
  }

  return cover;
}

async function getPoster(slug: string) {
  const posterKey = Object.keys(posters).find((image) => {
    return image.endsWith(`${slug}.png`);
  });

  let poster;

  if (posterKey) {
    poster = await posters[posterKey]();
  }

  if (!poster) {
    throw new Error(`No poster for ${slug}`);
  }

  return poster;
}

export async function getFluidImageProps(
  kind: "cover" | "poster",
  slug: string,
  { height, width }: { height: number; width: number }
): Promise<ImageProps> {
  let image;

  switch (kind) {
    case "cover": {
      image = await getCover(slug);
      break;
    }
    case "poster": {
      image = await getPoster(slug);
      break;
    }
  }

  const optimizedImage = await getImage({
    format: "avif",
    height: height,
    quality: 80,
    src: image.default,
    width: width,
    widths: [0.25, 0.5, 1, 2].map((w) => w * width),
  });

  return {
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
  };
}
