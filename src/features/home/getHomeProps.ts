import type { BooklogData, MovielogData } from "~/content.config";

import { getFluidCoverImageProps } from "~/assets/covers";
import { getStillImageProps } from "~/assets/stills";

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
      sorted(booklogEntries).map(async (item) => {
        return {
          ...item,
          coverImageProps: await getFluidCoverImageProps(
            item.slug,
            CoverImageConfig,
          ),
          displayDate: formatDate(item.date),
          gradeValue: item.stars,
        };
      }),
    ),
    movielogUpdates: await Promise.all(
      sorted(movielogEntries).map(async (item, index) => {
        return {
          ...item,
          displayDate: formatDate(item.date),
          gradeValue: item.stars,
          releaseYear: item.year,
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

function sorted<T extends { date: Date }>(items: T[]): T[] {
  return items.toSorted((a, b) => {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });
}
