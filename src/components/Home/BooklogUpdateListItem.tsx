import { toSentenceArray } from "~/utils/toSentenceArray";

import type { ListItemValue } from "./ListItemValue";

import { UpdateCover } from "./UpdateCover";
import { UpdateDate } from "./UpdateDate";
import { UpdateDetails } from "./UpdateDetails";
import { UpdateGrade } from "./UpdateGrade";
import { UpdateListItem } from "./UpdateListItem";
import { UpdateTitle } from "./UpdateTitle";

export type BooklogListItemValue = ListItemValue & {
  authors: string[];
};

export function BooklogUpdateListItem({
  value,
}: {
  value: BooklogListItemValue;
}): React.JSX.Element {
  return (
    <UpdateListItem>
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
    </UpdateListItem>
  );
}
