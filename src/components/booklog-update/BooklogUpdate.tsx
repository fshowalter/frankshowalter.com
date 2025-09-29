import type { ImageProps } from "~/api/images";

import { UpdateDate } from "~/components/update-date/UpdateDate";
import { UpdateDetails } from "~/components/update-details/UpdateDetails";
import { UpdateGrade } from "~/components/update-grade/UpdateGrade";
import { UpdateTitle } from "~/components/update-title/UpdateTitle";
import { toSentenceArray } from "~/utils/toSentenceArray";

import { ReviewCard } from "./ReviewCard";
import { UpdateCover } from "./UpdateCover";

/**
 * Configuration for cover images in review cards
 */
export const CoverImageConfig = {
  height: 372,
  sizes:
    "(min-width: 1860px) 200px, (min-width: 1440px) calc(9.75vw + 21px), (min-width: 1280px) calc(16.43vw - 59px), (min-width: 1040px) calc(6.36vw + 120px), (min-width: 960px) 200px, (min-width: 780px) calc(11.25vw + 94px), (min-width: 620px) 200px, (min-width: 460px) calc(25.71vw + 46px), calc(42.14vw - 12px)",
  width: 248,
};

/**
 * Data structure for a book review update.
 */
export type BooklogUpdateValue = {
  authors: string[];
  displayDate: string;
  imageProps: ImageProps;
  kind: string;
  slug: string;
  stars: number;
  synopsis: string;
  title: string;
  workYear: string;
};

/**
 * Displays a book review update with cover image, title, authors, and rating.
 */
export function BooklogUpdate({
  value,
}: {
  value: BooklogUpdateValue;
}): React.JSX.Element {
  return (
    <ReviewCard
      value={{
        authors: value.authors,
        coverImageProps: value.imageProps,
        excerpt: value.synopsis,
        gradeValue: value.stars,
        kind: value.kind,
        reviewDate: value.displayDate,
        slug: value.slug,
        title: value.title,
        workYear: value.workYear,
      }}
    />
  );
}
