import { getImage } from "astro:assets";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { normalizeSources } from "./utils/normalizeSources";

export type ImageProps = {
  height: number;
  sizes: string;
  src: string;
  srcSet: string;
  width: number;
};

let covers = import.meta.glob<{ default: ImageMetadata }>(
  `/content/assets/covers/*.png`,
);

if (import.meta.env.MODE === "test") {
  covers = import.meta.glob<{ default: ImageMetadata }>(
    `/src/api/fixtures/assets/covers/*.png`,
  );
}

let posters = import.meta.glob<{ default: ImageMetadata }>(
  `/content/assets/posters/*.png`,
);

if (import.meta.env.MODE === "test") {
  posters = import.meta.glob<{ default: ImageMetadata }>(
    `/src/api/fixtures/assets/posters/*.png`,
  );
}

export async function getFluidImageProps(
  kind: "cover" | "poster",
  slug: string,
  imageProps: {
    sizes: string;
    width: number;
  },
): Promise<ImageProps> {
  let image;
  let height;
  const { sizes, width } = imageProps;

  switch (kind) {
    case "cover": {
      image = await getCover(slug);
      height = await getImageHeight(getCoverPath(slug), width);
      break;
    }
    case "poster": {
      image = await getPoster(slug);
      height = await getImageHeight(getPosterPath(slug), width);
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
    height,
    sizes,
    src: normalizeSources(optimizedImage.src),
    srcSet: normalizeSources(optimizedImage.srcSet.attribute),
    width,
  };
}

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

function getCoverPath(slug: string) {
  const coverPath = path.resolve(`./content/assets/covers/${slug}.png`);
  if (fs.existsSync(coverPath)) {
    return coverPath;
  }

  throw new Error(`No cover for ${slug}`);
}

async function getImageHeight(coverPath: string, targetWidth: number) {
  try {
    const { height, width } = await sharp(coverPath).metadata();

    return (height / width) * targetWidth;
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
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

function getPosterPath(slug: string) {
  const posterPath = path.resolve(`./content/assets/posters/${slug}.png`);
  if (fs.existsSync(posterPath)) {
    return posterPath;
  }

  throw new Error(`No poster for ${slug}`);
}
