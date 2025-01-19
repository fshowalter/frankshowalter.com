import { booklogUpdates } from "~/api/booklog";
import type { Props } from "./Home";
import { getFluidImageProps } from "~/api/images";
import { ImageConfig } from "./HomeListItem";
import { movielogUpdates } from "~/api/movielog";

export async function getProps(): Promise<Props> {
  const booklogItems = await booklogUpdates();
  const movielogItems = await movielogUpdates();

  return {
    movielogUpdates: await Promise.all(
      movielogItems.map(async (item) => {
        return {
          ...item,
          imageProps: await getFluidImageProps(
            "poster",
            item.slug,
            ImageConfig
          ),
        };
      })
    ),
    booklogUpdates: await Promise.all(
      booklogItems.map(async (item) => {
        return {
          ...item,
          imageProps: await getFluidImageProps("cover", item.slug, ImageConfig),
        };
      })
    ),
  };
}
