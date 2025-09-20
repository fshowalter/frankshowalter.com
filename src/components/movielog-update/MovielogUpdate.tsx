import { UpdateDate } from "../update-date/UpdateDate";
import { UpdateDetails } from "../update-details/UpdateDetails";
import { UpdateGrade } from "../update-grade/UpdateGrade";
import { UpdatePoster } from "./UpdatePoster";
import { UpdateTitle } from "../update-title/UpdateTitle";
import type { ImageProps } from "~/api/images";

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
