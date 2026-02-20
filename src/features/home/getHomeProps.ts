import type { BooklogData, MovielogData } from "~/content.config";

import { getFluidCoverImageProps } from "~/api/covers";
import { getStillImageProps } from "~/api/stills";

import type { HomeProps } from "./Home";

import {
  CoverImageConfig,
  StillImageConfig,
  StillSplashImageConfig,
} from "./Home";

/**
 * Transforms pre-fetched booklog and movielog data into props for the Home component.
 * Accepts data from Astro Content Collections instead of fetching internally.
 */
export async function getHomeProps(
  booklogEntries: BooklogData[],
  movielogEntries: MovielogData[],
): Promise<HomeProps> {
  return {
    booklogUpdates: await Promise.all(
      booklogEntries.map(async (item) => {
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
      movielogEntries.map(async (item, index) => {
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
