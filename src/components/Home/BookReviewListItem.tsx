import type { JSX } from "react";
import type { BookReview } from "~/api/bookReviews";

import type { CoverImageProps } from "~/api/covers";

import { Cover } from "~/components/Cover";
import { Grade } from "~/components/Grade";
import { toSentenceArray } from "~/utils/toSentenceArray";

export const CoverImageConfig = {
  height: 372,
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1300px) calc(11.67vw + 10px), (min-width: 1260px) calc(-445vw + 5855px), (min-width: 900px) calc(19.12vw + 11px), (min-width: 600px) 27.5vw, calc(41.43vw + 8px)",
  width: 248,
};

export type BookReviewListItemValue = Pick<
  BookReview,
  "authorNames" | "date" | "title" | "kind" | "stars" | "slug" | "yearPublished"
> & {
  coverImageProps: CoverImageProps;
};

export function BookReviewListItem({
  eagerLoadCoverImage,
  value,
}: {
  eagerLoadCoverImage: boolean;
  value: BookReviewListItemValue;
}): JSX.Element {
  return (
    <li className="relative flex w-[48%] max-w-[248px] flex-col items-center border-default bg-default has-[a:hover]:bg-stripe min-[600px]:w-[30.66666667%] tablet:w-[31.33333333%] min-[900px]:w-[22.75%] desktop:w-[14.16666667%]">
      <Cover
        decoding="async"
        imageProps={value.coverImageProps}
        {...CoverImageConfig}
        alt=""
        loading={eagerLoadCoverImage ? "eager" : "lazy"}
      />
      <div className="flex grow flex-col items-center px-[8%] pb-8 pt-2 desktop:pl-[8.5%] desktop:pr-[10%]">
        <div className="whitespace-nowrap py-2 text-center font-sans text-xxs font-light uppercase leading-4 text-subtle">
          {formatDate(value.date)}
        </div>
        <div className="text-center text-md font-medium leading-6">
          <a
            className="z-10 inline-block text-accent decoration-2 underline-offset-4 before:absolute before:inset-x-0 before:top-0 before:aspect-cover before:bg-[#fff] before:opacity-15 after:absolute after:left-0 after:top-0 after:size-full after:opacity-0 hover:before:opacity-0"
            href={`https://www.franksbooklog.com/reviews/${value.slug}/`}
            rel="canonical"
          >
            {value.title}
          </a>
        </div>
        <div className="font-sans text-xxs font-light uppercase leading-8 tracking-wide text-subtle">
          {value.yearPublished} | {value.kind}
        </div>
        <p className="text-center text-base font-light text-subtle">
          by{" "}
          {toSentenceArray(
            value.authorNames.map((name) => {
              return (
                <span className="font-normal text-default" key={name}>
                  {name}
                </span>
              );
            })
          )}
        </p>{" "}
        <Grade className="mt-2" height={18} value={value.stars} />
      </div>
    </li>
  );
}

function formatDate(reviewDate: Date) {
  return reviewDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}
