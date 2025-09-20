import { toSentenceArray } from "~/utils/toSentenceArray";

import { UpdateCover } from "./UpdateCover";
import { UpdateDate } from "../update-date/UpdateDate";
import { UpdateDetails } from "../update-details/UpdateDetails";
import { UpdateGrade } from "../update-grade/UpdateGrade";
import { UpdateTitle } from "../update-title/UpdateTitle";
import type { ImageProps } from "~/api/images";

export type BooklogUpdateValue = {
  displayDate: string;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
  authors: string[];
};

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
