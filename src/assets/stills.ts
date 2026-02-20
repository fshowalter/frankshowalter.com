import { getImage } from "astro:assets";

/**
 * Props for still images.
 */
export type StillImageProps = {
  src: string;
  srcSet: string;
};

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/content/assets/stills/*.png",
);

/**
 * Retrieves still image properties for a given slug.
 * @param slug - Identifier for the still image
 * @param options - Image dimensions
 * @param options.height - Desired image height
 * @param options.width - Desired image width
 * @returns Still image properties with src and srcSet
 */
export async function getStillImageProps(
  slug: string,
  {
    height,
    width,
  }: {
    height: number;
    width: number;
  },
): Promise<StillImageProps> {
  const stillFilePath = Object.keys(images).find((path) => {
    return path.endsWith(`/${slug}.png`);
  })!;

  const stillFile = await images[stillFilePath]();

  const optimizedImage = await getImage({
    format: "avif",
    height: height,
    quality: 80,
    src: stillFile.default,
    width: width,
    widths: [0.25, 0.5, 1, 2].map((w) => w * width),
  });

  return {
    src: optimizedImage.src,
    srcSet: optimizedImage.srcSet.attribute,
  };
}
