import type { BooklogUpdateValue } from "~/components/booklog-update/BooklogUpdate";
import type { MovielogUpdateValue } from "~/components/movielog-update/MovielogUpdate";

import { BooklogUpdate } from "~/components/booklog-update/BooklogUpdate";
import { MovielogUpdate } from "~/components/movielog-update/MovielogUpdate";
import { UpdateList } from "~/components/update-list/UpdateList";
import { UpdateListHeading } from "~/components/update-list/UpdateListHeading";

export type RecentUpdatesProps = {
  booklogUpdates: BooklogUpdateValue[];
  movielogUpdates: MovielogUpdateValue[];
};

export const RecentUpdatesImageConfig = {
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1280px) calc(11.8vw + 8px), (min-width: 960px) 248px, (min-width: 600px) calc(23.24vw + 30px), calc(41.43vw + 8px)",
  width: 248,
};

export function RecentUpdates({
  booklogUpdates,
  movielogUpdates,
}: RecentUpdatesProps): React.JSX.Element {
  return (
    <div className="bg-subtle pb-16">
      <nav
        className={`
          mx-auto w-full max-w-[908px]
          tablet:px-container
          laptop:max-w-(--breakpoint-desktop) laptop:px-container
        `}
      >
        <UpdateListHeading
          accentText="Movie Reviews"
          href="https://www.franksmovielog.com"
          text="Latest"
        />
        <UpdateList values={movielogUpdates}>
          {(value) => <MovielogUpdate key={value.slug} value={value} />}
        </UpdateList>

        <UpdateListHeading
          accentText="Book Reviews"
          href="https://www.franksbooklog.com"
          text="Latest"
        />
        <UpdateList values={booklogUpdates}>
          {(value) => <BooklogUpdate key={value.slug} value={value} />}
        </UpdateList>
      </nav>
    </div>
  );
}
