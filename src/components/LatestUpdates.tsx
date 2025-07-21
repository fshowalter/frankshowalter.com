import type { JSX } from "react";
import type React from "react";

import type { ImageProps } from "~/api/images";

import { toSentenceArray } from "~/utils/toSentenceArray";

import { Grade } from "./Grade";
import { SubHeading } from "./SubHeading";

type Props = {
  booklogUpdates: BooklogListItemValue[];
  movielogUpdates: ListItemValue[];
};

export const ImageConfig = {
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1280px) calc(11.8vw + 8px), (min-width: 960px) 248px, (min-width: 600px) calc(23.24vw + 30px), calc(41.43vw + 8px)",
  width: 248,
};

type BooklogListItemValue = ListItemValue & {
  authors: string[];
};

type ListItemValue = {
  date: Date;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
};

type MovielogListItemValue = ListItemValue & {
  year: string;
};

export function LatestUpdates({
  booklogUpdates,
  movielogUpdates,
}: Props): JSX.Element {
  return (
    <nav
      className={`
        mx-auto w-full max-w-(--breakpoint-desktop) bg-subtle px-container
        tablet:max-w-popout tablet:px-0
        laptop:max-w-(--breakpoint-desktop) laptop:px-container
      `}
    >
      <SubHeading as="h2">
        Latest{" "}
        <a className="text-accent" href="https://www.franksmovielog.com">
          Movie Reviews
        </a>
      </SubHeading>
      <UpdateList>
        {movielogUpdates.map((value, index) => {
          return (
            <MovielogUpdateListItem
              eagerLoadCoverImage={index < 2}
              key={value.slug}
              siteUrl="https://www.franksmovielog.com"
              value={value}
            />
          );
        })}
      </UpdateList>
      <SubHeading as="h2">
        Latest{" "}
        <a className="text-accent" href="https://www.franksbooklog.com">
          Book Reviews
        </a>
      </SubHeading>
      <UpdateList>
        {booklogUpdates.map((value) => {
          return (
            <BooklogUpdateListItem
              key={value.slug}
              siteUrl="https://www.franksbooklog.com"
              value={value}
            />
          );
        })}
      </UpdateList>
    </nav>
  );
}

function BooklogUpdateListItem({
  value,
}: {
  value: BooklogListItemValue;
}): JSX.Element {
  return (
    <li
      className={`
        group/card relative row-span-2 grid transform-gpu grid-rows-subgrid
        gap-y-0 transition-transform
        has-[a:hover]:-translate-y-1 has-[a:hover]:scale-105
        has-[a:hover]:drop-shadow-2xl
      `}
    >
      <div
        className={`
          @container z-10 flex justify-center self-end bg-default px-3 pt-3
          @min-[200px]:px-[clamp(4px,10cqw,32px)] @min-[200px]:pt-6
        `}
      >
        <div
          className={`
            relative
            after:absolute after:inset-x-0 after:top-0 after:bottom-0 after:z-20
            after:bg-default after:opacity-15 after:transition-opacity
            group-hover/card:after:opacity-0
          `}
        >
          <UpdateImage
            decoding="async"
            imageProps={value.imageProps}
            {...ImageConfig}
            className={`max-w-[200px] rounded-[2.5px]`}
            loading={"lazy"}
          />
        </div>
      </div>
      <div
        className={`
          @container flex justify-center bg-default px-4 pb-8
          group-has-[a:hover]/card:shadow-[0px_-5px_5px_2px,rgba(0,0,0,.85)]
          @min-[193px]:px-[clamp(4px,14cqw,32px)] @min-[193px]:pb-6
        `}
      >
        <div className={`flex w-full max-w-[200px] flex-col`}>
          <div
            className={`
              pt-3 font-sans text-xxs leading-4 font-light tracking-wide
              whitespace-nowrap text-subtle
            `}
          >
            {formatDate(value.date)}
          </div>
          <div
            className={`
              pt-2 text-base leading-5 font-medium
              tablet:pt-3 tablet:text-md
              desktop:pt-2 desktop:text-xl
            `}
          >
            <a
              className={`
                block
                after:absolute after:top-0 after:left-0 after:z-60
                after:size-full after:opacity-0
                hover:text-accent
              `}
              href={`https://www.franksbooklog.com/reviews/${value.slug}/`}
              rel="canonical"
            >
              {value.title}
            </a>
          </div>
          <p
            className={`
              pt-1 font-sans text-xs leading-4 font-light text-subtle
              tablet:pt-2 tablet:font-serif tablet:text-base tablet:leading-5
            `}
          >
            <span
              className={`
                hidden
                tablet:inline
              `}
            >
              by{" "}
            </span>
            {toSentenceArray(
              value.authors.map((author) => {
                return <span key={author}>{author}</span>;
              }),
            )}
          </p>{" "}
          <Grade
            className={`
              mt-2 h-4 w-20
              tablet:mt-3 tablet:h-[18px] tablet:w-[90px]
            `}
            height={16}
            value={value.stars}
          />
        </div>
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

function MovielogUpdateListItem({
  eagerLoadCoverImage,
  siteUrl,
  value,
}: {
  eagerLoadCoverImage: boolean;
  siteUrl: "https://www.franksbooklog.com" | "https://www.franksmovielog.com";
  value: MovielogListItemValue;
}): JSX.Element {
  return (
    <li
      className={`
        group/card relative row-span-2 grid transform-gpu grid-rows-subgrid
        gap-y-0 transition-transform
        has-[a:hover]:-translate-y-1 has-[a:hover]:scale-105
        has-[a:hover]:drop-shadow-2xl
      `}
    >
      <div
        className={`
          flex h-full w-full flex-col bg-default p-3
          has-[a:hover]:bg-hover
          min-[496px]:px-8 min-[496px]:pt-6 min-[496px]:pb-4
        `}
      >
        <a
          aria-label={value.title}
          className={`
            inline-block
            before:absolute before:inset-x-4 before:top-4 before:z-10
            before:aspect-cover before:bg-default before:opacity-15
            after:absolute after:top-0 after:left-0 after:z-10 after:size-full
            after:opacity-0
            hover:before:opacity-0
            min-[496px]:before:inset-x-12 min-[496px]:before:top-10
          `}
          href={`${siteUrl}/reviews/${value.slug}/`}
          rel="canonical"
          title={value.title}
        >
          <UpdateImage
            decoding="async"
            imageProps={value.imageProps}
            {...ImageConfig}
            alt={value.title}
            loading={eagerLoadCoverImage ? "eager" : "lazy"}
          />
        </a>
        <div
          className={`
            @container flex w-full grow flex-wrap items-center gap-x-1 px-1 py-2
            tablet:py-3
          `}
        >
          <div>
            {value.title} <span>({value.year})</span>
          </div>
          <Grade
            className={`
              mt-2 h-4 w-20
              @min-[192px]:mt-3 @min-[192px]:h-[18px] @min-[192px]:w-[90px]
            `}
            height={16}
            value={value.stars}
          />
        </div>
      </div>
    </li>
  );
}

function UpdateImage({
  decoding = "async",
  imageProps,
  loading = "lazy",
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  decoding: "async" | "auto" | "sync";
  imageProps: ImageProps | undefined;
  loading: "eager" | "lazy";
  width: number;
}): JSX.Element {
  return (
    <img
      {...imageProps}
      {...rest}
      alt=""
      className="rounded-[2.5px]"
      decoding={decoding}
      loading={loading}
    />
  );
}

function UpdateList({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ol
      className={`
        -mx-4 grid auto-rows-[auto_1fr] grid-cols-2 gap-x-[clamp(8px,2vw,32px)]
        gap-y-[clamp(8px,2vw,32px)]
        tablet:grid-cols-3 tablet:gap-x-4 tablet:gap-y-4
        laptop:-mx-6 laptop:grid-cols-6 laptop:gap-x-6 laptop:gap-y-6
        desktop:-mx-8 desktop:grid-cols-6 desktop:gap-y-12
      `}
    >
      {children}
    </ol>
  );
}
