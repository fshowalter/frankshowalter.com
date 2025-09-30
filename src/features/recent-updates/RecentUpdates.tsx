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
          mx-auto w-full max-w-[1056px] gap-x-16
          tablet:px-container
          laptop:flex laptop:max-w-(--breakpoint-desktop)
        `}
      >
        <nav
          className={`
            w-full max-w-[1056px]
            desktop:grow
          `}
        >
          <UpdateListHeading
            accentText="Movie Reviews"
            className="text-left"
            href="https://www.franksmovielog.com"
            text="Latest"
          />
          <ol
            className={`
              flex flex-wrap justify-between gap-x-[2%]
              tablet:gap-y-[3vw]
              laptop:gap-y-[3vw]
            `}
          >
            {movielogUpdates.slice(0, 5).map((value, index) => {
              return (
                <MovielogUpdate
                  className={`
                    ${
                      index === 0
                        ? `[--review-card-width:100%]`
                        : `tablet:[--review-card-width:48%]`
                    }
                  `}
                  key={value.slug}
                  value={value}
                  variant={index === 0 ? "primary" : "secondary"}
                />
              );
            })}
          </ol>
          <div
            className={`
              flex px-container py-10
              has-[a:hover]:drop-shadow-lg
            `}
          >
            <a
              className={`
                group/all-reviews mx-auto w-full max-w-[500px] transform-gpu
                rounded-md bg-default pt-5 pb-4 text-center font-sans text-base
                font-medium text-accent transition-all duration-500
                hover:scale-105 hover:bg-accent hover:text-white
              `}
              href="/reviews/"
            >
              <span
                className={`
                  relative inline-block pb-1
                  after:absolute after:bottom-0 after:left-0 after:h-px
                  after:w-full after:origin-center after:scale-x-0
                  after:transform-gpu after:bg-white after:transition-transform
                  after:duration-500
                  group-hover/all-reviews:after:scale-x-100
                `}
              >
                More Movie Reviews
              </span>
            </a>
          </div>
        </nav>
        <nav
          className={`
            mx-auto w-full max-w-[720px]
            laptop:min-w-[548px]
            desktop:shrink
          `}
        >
          <UpdateListHeading
            accentText="Book Reviews"
            className="text-right"
            href="https://www.franksbooklog.com"
            text="Latest"
          />
          <ol className="flex flex-col gap-y-[2vw]">
            {booklogUpdates.slice(0, 4).map((value) => {
              return <BooklogUpdate key={value.slug} value={value} />;
            })}
          </ol>
          <div
            className={`
              flex px-container py-10
              has-[a:hover]:drop-shadow-lg
            `}
          >
            <a
              className={`
                group/all-reviews mx-auto w-full max-w-[500px] transform-gpu
                rounded-md bg-default pt-5 pb-4 text-center font-sans text-base
                font-medium text-accent transition-all duration-500
                hover:scale-105 hover:bg-accent hover:text-white
              `}
              href="/reviews/"
            >
              <span
                className={`
                  relative inline-block pb-1
                  after:absolute after:bottom-0 after:left-0 after:h-px
                  after:w-full after:origin-center after:scale-x-0
                  after:transform-gpu after:bg-white after:transition-transform
                  after:duration-500
                  group-hover/all-reviews:after:scale-x-100
                `}
              >
                More Book Reviews
              </span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
