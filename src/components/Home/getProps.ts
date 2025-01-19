import { booklogUpdates } from "~/api/booklog";
import { getFluidImageProps } from "~/api/images";
import { movielogUpdates } from "~/api/movielog";

import type { Props } from "./Home";

import { ImageConfig } from "./HomeListItem";

export async function getProps(): Promise<Props> {
  const booklogItems = await booklogUpdates();
  const movielogItems = await movielogUpdates();

  return {
    booklogUpdates: await Promise.all(
      booklogItems.map(async (item) => {
        return {
          ...item,
          imageProps: await getFluidImageProps("cover", item.slug, ImageConfig),
        };
      }),
    ),
    movielogUpdates: await Promise.all(
      movielogItems.map(async (item) => {
        return {
          ...item,
          imageProps: await getFluidImageProps(
            "poster",
            item.slug,
            ImageConfig,
          ),
        };
      }),
    ),
  };
}
