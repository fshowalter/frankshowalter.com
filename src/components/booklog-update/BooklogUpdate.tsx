import type { ImageProps } from "~/api/images";

import { UpdateDate } from "~/components/update-date/UpdateDate";
import { UpdateDetails } from "~/components/update-details/UpdateDetails";
import { UpdateGrade } from "~/components/update-grade/UpdateGrade";
import { UpdateTitle } from "~/components/update-title/UpdateTitle";
import { toSentenceArray } from "~/utils/toSentenceArray";

import { UpdateCover } from "./UpdateCover";

/**
 * Data structure for a book review update.
 */
export type BooklogUpdateValue = {
  authors: string[];
  displayDate: string;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
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
    <>
      <UpdateCover imageProps={value.imageProps} />

      <UpdateDetails>
        <UpdateDate displayDate={value.displayDate} />
        <UpdateTitle
          href={`https://www.franksbooklog.com/reviews/${value.slug}/`}
        >
          {value.title}
        </UpdateTitle>
        <div
          className={`
            -mt-1 text-[15px] leading-4 font-normal tracking-prose text-muted
          `}
        >
          {toSentenceArray(
            value.authors.map((value) => <span key={value}>{value}</span>),
          )}
        </div>
        <UpdateGrade stars={value.stars} />
      </UpdateDetails>
    </>
  );
}
