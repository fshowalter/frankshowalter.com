import type { ImageProps } from "~/api/images";

import { UpdateDate } from "~/components/update-date/UpdateDate";
import { UpdateDetails } from "~/components/update-details/UpdateDetails";
import { UpdateGrade } from "~/components/update-grade/UpdateGrade";
import { UpdateTitle } from "~/components/update-title/UpdateTitle";

import { UpdatePoster } from "./UpdatePoster";

export type MovielogUpdateValue = {
  displayDate: string;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
  year: string;
};

export function MovielogUpdate({
  value,
}: {
  value: MovielogUpdateValue;
}): React.JSX.Element {
  return (
    <>
      <UpdatePoster imageProps={value.imageProps} />
      <UpdateDetails>
        <UpdateDate displayDate={value.displayDate} />
        <UpdateTitle
          href={`https://www.franksmovielog.com/reviews/${value.slug}/`}
        >
          {value.title}&#x202F;&#x202F;
          <span className={`text-xxs leading-none font-light text-subtle`}>
            ({value.year})
          </span>
        </UpdateTitle>
        <UpdateGrade stars={value.stars} />
      </UpdateDetails>
    </>
  );
}
