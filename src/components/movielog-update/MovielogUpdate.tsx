import type { ImageProps } from "~/api/images";

import { UpdateDate } from "~/components/update-date/UpdateDate";
import { UpdateDetails } from "~/components/update-details/UpdateDetails";
import { UpdateGrade } from "~/components/update-grade/UpdateGrade";
import { UpdateTitle } from "~/components/update-title/UpdateTitle";

import { ReviewCard } from "./ReviewCard";
import { UpdatePoster } from "./UpdatePoster";

/**
 * Data structure for a movie review update.
 */
export type MovielogUpdateValue = {
  displayDate: string;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  synopsis: string;
  title: string;
  year: string;
};

export const StillImageConfig = {
  height: 360,
  sizes:
    "(min-width: 1800px) 481px, (min-width: 1280px) calc(26vw + 18px), (min-width: 780px) calc(47.08vw - 46px), 83.91vw",
  width: 640,
};

/**
 * Displays a movie review update with poster image, title, year, and rating.
 */
export function MovielogUpdate({
  className,
  value,
}: {
  className?: string;
  value: MovielogUpdateValue;
}): React.JSX.Element {
  return (
    <ReviewCard
      as="li"
      className={className}
      imageConfig={StillImageConfig}
      value={{
        excerpt: value.synopsis,
        gradeValue: value.stars,
        releaseYear: value.year,
        reviewDisplayDate: value.displayDate,
        slug: value.slug,
        stillImageProps: value.imageProps,
        title: value.title,
      }}
    />
  );
}
