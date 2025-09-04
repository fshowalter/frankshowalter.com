import type { ImageProps } from "~/api/images";

export type ListItemValue = {
  displayDate: string;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
};
