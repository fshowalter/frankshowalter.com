import type { BooklogUpdateValue } from "~/components/booklog-update/BooklogUpdate";
import type { MovielogUpdateValue } from "~/components/movielog-update/MovielogUpdate";

import { BooklogUpdate } from "~/components/booklog-update/BooklogUpdate";
import { MovielogUpdate } from "~/components/movielog-update/MovielogUpdate";
import { UpdateList } from "~/components/update-list/UpdateList";
import { UpdateListHeading } from "~/components/update-list/UpdateListHeading";
import { UpdateListItem } from "~/components/update-list/UpdateListItem";

/**
 * Props for the RecentUpdates component.
 */
export type RecentUpdatesProps = {
  booklogUpdates: BooklogUpdateValue[];
  movielogUpdates: MovielogUpdateValue[];
};

/**
 * Responsive image configuration for update entry images.
 * Defines sizes for different viewport widths.
 */
export const RecentUpdatesImageConfig = {
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1280px) calc(11.8vw + 8px), (min-width: 960px) 248px, (min-width: 600px) calc(23.24vw + 30px), calc(41.43vw + 8px)",
  width: 248,
};

/**
 * Displays recent book and movie review updates in separate sections.
 * Each section includes a heading and responsive grid of update entries.
 */
export function RecentUpdates({
  booklogUpdates,
  movielogUpdates,
}: RecentUpdatesProps): React.JSX.Element {
  return (
    <div className="w-full bg-subtle pb-16">
      <div
        className={`
          mx-auto flex w-full max-w-(--breakpoint-desktop) gap-x-16
          tablet:px-container
        `}
      >
        <nav className="w-2/3 max-w-[960px]">
          <UpdateListHeading
            accentText="Movie Reviews"
            href="https://www.franksmovielog.com"
            text="Latest"
          />
          <ol
            className={`
              flex flex-wrap gap-x-[3%]
              tablet:gap-y-[6vw]
              laptop:gap-y-[3vw]
            `}
          >
            {movielogUpdates.map((value, index) => {
              return (
                <MovielogUpdate
                  className={`
                    ${
                      index === 0
                        ? `[--review-card-width:100%]`
                        : `tablet:[--review-card-width:47%]`
                    }
                  `}
                  key={value.slug}
                  value={value}
                />
              );
            })}
          </ol>
        </nav>
        <nav className="w-1/3">
          <UpdateListHeading
            accentText="Book Reviews"
            href="https://www.franksbooklog.com"
            text="Latest"
          />
          <ol>
            {booklogUpdates.map((value) => {
              return (
                <li
                  className={`
                    group/list-item relative mb-1 flex w-full
                    max-w-(--breakpoint-desktop) transform-gpu flex-row
                    gap-x-[5%] bg-default px-container py-4 transition-transform
                    duration-500
                    tablet:bg-transparent tablet:px-0 tablet:py-6
                    tablet:has-[a:hover]:-translate-y-2
                    tablet:has-[a:hover]:bg-default
                    tablet:has-[a:hover]:drop-shadow-2xl
                  `}
                  key={value.slug}
                >
                  <BooklogUpdate value={value} />
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
