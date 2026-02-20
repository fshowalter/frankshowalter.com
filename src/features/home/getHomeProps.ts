import { booklogUpdates } from "~/api/booklog";
import { getFluidCoverImageProps } from "~/api/covers";
import { movielogUpdates } from "~/api/movielog";
import { getStillImageProps } from "~/api/stills";

import type { HomeProps } from "./Home";

import {
  CoverImageConfig,
  StillImageConfig,
  StillSplashImageConfig,
} from "./Home";

/**
 * Fetches and prepares data for the Home component.
 * Retrieves book and movie updates with formatted dates and optimized images.
 */
export async function getHomeProps(): Promise<HomeProps> {
  const booklogItems = await booklogUpdates();
  const movielogItems = await movielogUpdates();

  return {
    booklogUpdates: await Promise.all(
      booklogItems.map(async (item) => {
        return {
          ...item,
          coverImageProps: await getFluidCoverImageProps(
            item.slug,
            CoverImageConfig,
          ),
          gradeValue: item.stars,
          reviewDisplayDate: formatDate(item.date),
        };
      }),
    ),
    movielogUpdates: await Promise.all(
      movielogItems.map(async (item, index) => {
        return {
          ...item,
          displayDate: formatDate(item.date),
          gradeValue: item.stars,
          releaseYear: item.year,
          reviewDisplayDate: formatDate(item.date),
          stillImageProps: await getStillImageProps(
            item.slug,
            index === 0 ? StillSplashImageConfig : StillImageConfig,
          ),
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
