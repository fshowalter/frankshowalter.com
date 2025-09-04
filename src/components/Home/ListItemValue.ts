import type { ImageProps } from "~/api/images";

export type ListItemValue = {
  displayDate: string;
  imageConfig: {
    sizes: string;
    width: number;
  };
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
};
