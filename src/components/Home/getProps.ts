import { getBackdropImageProps } from "~/api/backdrops";
import { booklogUpdates } from "~/api/booklog";
import { getFluidImageProps } from "~/api/images";
import { movielogUpdates } from "~/api/movielog";
import { BackdropImageConfig } from "~/components/Backdrop";
import { ImageConfig } from "~/components/LatestUpdates";

import type { Props } from "./Home";

export async function getProps(): Promise<Props> {
  const booklogItems = await booklogUpdates();
  const movielogItems = await movielogUpdates();

  return {
    backdropImageProps: await getBackdropImageProps(
      "home",
      BackdropImageConfig,
    ),
    booklogUpdates: await Promise.all(
      booklogItems.map(async (item) => {
        return {
          ...item,
          imageProps: await getFluidImageProps(
            "cover",
            item.slug,
            ImageConfig.width,
          ),
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
            ImageConfig.width,
          ),
        };
      }),
    ),
  };
}
