import type { BooklogUpdateCardValue } from "~/components/booklog-update-card/BooklogUpdateCard";
import type { MovielogUpdateCardValue } from "~/components/movielog-update-card/MovielogUpdateCard";

import { BooklogUpdateCard } from "~/components/booklog-update-card/BooklogUpdateCard";
import { MovielogUpdateCard } from "~/components/movielog-update-card/MovielogUpdateCard";
import { UpdateListHeading } from "~/components/update-list-heading/UpdateListHeading";

/**
 * Props for the RecentUpdates component.
 */
export type RecentUpdatesProps = {
  booklogUpdates: BooklogUpdateCardValue[];
  movielogUpdates: MovielogUpdateCardValue[];
};

/**
 * Responsive image configuration for update entry images.
 * Defines sizes for different viewport widths.
 */
export const CoverImageConfig = {
  sizes:
    "(min-width: 1760px) 168px, (min-width: 1360px) 10vw, (min-width: 780px) calc(1.61vw + 146px), (min-width: 560px) calc(20vw + 16px), (min-width: 480px) 200px, calc(46.25vw - 13px)",
  width: 200,
};

export const StillImageConfig = {
  height: 362,
  sizes:
    "(min-width: 2020px) 430px, (min-width: 1780px) calc(13.18vw + 166px), (min-width: 1360px) calc(29.75vw - 132px), (min-width: 1120px) 461px, (min-width: 780px) 41.56vw, 83.91vw",
  width: 644,
};

export const StillSplashImageConfig = {
  height: 540,
  sizes:
    "(min-width: 1960px) 896px, (min-width: 1760px) 44.44vw, (min-width: 1360px) calc(60vw - 248px), (min-width: 1140px) 960px, (min-width: 840px) calc(77.14vw + 96px), calc(90.77vw - 20px)",
  width: 960,
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
            href="https://www.franksmovielog.com"
            id="movie-reviews"
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
                <MovielogUpdateCard
                  className={`
                    ${
                      index === 0
                        ? `[--review-card-width:100%]`
                        : `tablet:[--review-card-width:48%]`
                    }
                  `}
                  imageConfig={
                    index === 0 ? StillSplashImageConfig : StillImageConfig
                  }
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
              href="https://www.franksmovielog.com/reviews/"
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
            href="https://www.franksbooklog.com"
            id="book-reviews"
            text="Latest"
          />
          <ol className="flex flex-col gap-y-[2vw]">
            {booklogUpdates.slice(0, 5).map((value) => {
              return (
                <BooklogUpdateCard
                  as="li"
                  imageSizes={CoverImageConfig.sizes}
                  key={value.slug}
                  value={value}
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
              href="https://www.franksbooklog.com/reviews/"
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
