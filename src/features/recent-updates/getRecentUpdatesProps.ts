import { booklogUpdates } from "~/api/booklog";
import { getFluidImageProps } from "~/api/images";
import { movielogUpdates } from "~/api/movielog";

import type { RecentUpdatesProps } from "./RecentUpdates";

import { RecentUpdatesImageConfig } from "./RecentUpdates";
import { getStillImageProps } from "~/api/stills";
import { StillImageConfig } from "~/components/movielog-update/MovielogUpdate";

/**
 * Fetches and prepares data for the RecentUpdates component.
 * Retrieves book and movie updates with formatted dates and optimized images.
 */
export async function getRecentUpdatesProps(): Promise<RecentUpdatesProps> {
  const booklogItems = await booklogUpdates();
  const movielogItems = await movielogUpdates();

  return {
    booklogUpdates: await Promise.all(
      booklogItems.map(async (item) => {
        return {
          ...item,
          displayDate: formatDate(item.date),
          imageProps: await getFluidImageProps(
            "cover",
            item.slug,
            RecentUpdatesImageConfig,
          ),
        };
      }),
    ),
    movielogUpdates: await Promise.all(
      movielogItems.map(async (item) => {
        return {
          ...item,
          displayDate: formatDate(item.date),
          imageProps: await getStillImageProps(item.slug, StillImageConfig),
        };
      }),
    ),
  };
}

function formatDate(reviewDate: Date) {
  return reviewDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}
