import type { ListItemValue } from "./ListItemValue";

import { UpdateDate } from "./UpdateDate";
import { UpdateDetails } from "./UpdateDetails";
import { UpdateGrade } from "./UpdateGrade";
import { UpdateListItem } from "./UpdateListItem";
import { UpdatePoster } from "./UpdatePoster";
import { UpdateTitle } from "./UpdateTitle";

export type MovielogListItemValue = ListItemValue & {
  year: string;
};

export function MovielogUpdateListItem({
  value,
}: {
  value: MovielogListItemValue;
}): React.JSX.Element {
  return (
    <UpdateListItem>
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
    </UpdateListItem>
  );
}
