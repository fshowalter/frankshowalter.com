import type { JSX } from "react";
import type React from "react";

import type { ImageProps } from "~/api/images";

import { toSentenceArray } from "~/utils/toSentenceArray";

import { Grade } from "./Grade";
import { SubHeading } from "./SubHeading";

type Props = {
  booklogUpdates: BooklogListItemValue[];
  movielogUpdates: MovielogListItemValue[];
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
        laptop:max-w-(--breakpoint-desktop) laptop:px-container
      `}
    >
      <SubHeading as="h2">
        <a
          className={`
            inline-block transform-gpu transition-transform
            hover:scale-110
          `}
          href="https://www.franksmovielog.com"
        >
          Latest <span className="text-accent">Movie Reviews</span>
        </a>
      </SubHeading>
      <UpdateList>
        {movielogUpdates.map((value, index) => {
          return (
            <MovielogUpdateListItem
              eagerLoadCoverImage={index < 2}
              key={value.slug}
              value={value}
            />
          );
        })}
      </UpdateList>
      <SubHeading as="h2">
        <a
          className={`
            inline-block transform-gpu transition-transform
            hover:scale-110
          `}
          href="https://www.franksbooklog.com"
        >
          Latest <span className="text-accent">Book Reviews</span>
        </a>
      </SubHeading>
      <UpdateList>
        {booklogUpdates.map((value) => {
          return <BooklogUpdateListItem key={value.slug} value={value} />;
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
    <UpdateListItem>
      <UpdateImage
        decoding="async"
        imageProps={value.imageProps}
        {...ImageConfig}
        className={`max-w-[200px] rounded-[2.5px]`}
        loading={"lazy"}
      />

      <UpdateDetails>
        <UpdateDate date={value.date} />
        <UpdateTitle
          href={`https://www.franksbooklog.com/reviews/${value.slug}/`}
        >
          {value.title}
        </UpdateTitle>
        <p
          className={`
            pt-1 font-sans text-xxs leading-[14px] font-light text-subtle
            tablet:pt-2
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
        <UpdateGrade stars={value.stars} />
      </UpdateDetails>
    </UpdateListItem>
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
  value,
}: {
  eagerLoadCoverImage: boolean;
  value: MovielogListItemValue;
}): JSX.Element {
  return (
    <UpdateListItem>
      <UpdateImage
        decoding="async"
        imageProps={value.imageProps}
        {...ImageConfig}
        className={`max-w-[200px] rounded-[2.5px]`}
        loading={eagerLoadCoverImage ? "eager" : "lazy"}
      />
      <UpdateDetails>
        <UpdateDate date={value.date} />
        <UpdateTitle
          href={`https://www.franksmovielog.com/reviews/${value.slug}/`}
        >
          {value.title}{" "}
          <span className={`text-xxs leading-0 font-light text-subtle`}>
            ({value.year})
          </span>
        </UpdateTitle>
        <UpdateGrade stars={value.stars} />
      </UpdateDetails>
    </UpdateListItem>
  );
}

function UpdateDate({ date }: { date: Date }): JSX.Element {
  return (
    <div
      className={`
        pt-3 font-sans text-xxs leading-4 font-light whitespace-nowrap
        text-subtle
        tablet:tracking-wide
      `}
    >
      {formatDate(date)}
    </div>
  );
}

function UpdateDetails({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="@container">
      <div
        className={`
          flex justify-center bg-default px-4 pb-8
          group-has-[a:hover]/card:shadow-[0px_-5px_5px_2px,rgba(0,0,0,.85)]
          @min-[200px]:px-[clamp(4px,10cqw,32px)] @min-[200px]:pb-6
        `}
      >
        <div className={`flex w-full max-w-[248px] flex-col px-1`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function UpdateGrade({ stars }: { stars: number }): JSX.Element {
  return (
    <Grade
      className={`
        mt-2 h-3 w-15
        tablet:mt-3 tablet:h-[18px] tablet:w-[90px]
      `}
      height={16}
      value={stars}
    />
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
    <div className={`@container flex self-end`}>
      <div className={`z-10 flex justify-center bg-default`}>
        <div
          className={`
            px-3 pt-3
            @min-[200px]:px-[clamp(4px,10cqw,32px)] @min-[200px]:pt-6
          `}
        >
          <div
            className={`
              relative max-w-[248px]
              after:absolute after:inset-x-0 after:top-0 after:bottom-0
              after:z-20 after:bg-default after:opacity-15
              after:transition-opacity
              group-hover/card:after:opacity-0
            `}
          >
            <img
              {...imageProps}
              {...rest}
              alt=""
              className="rounded-[2.5px]"
              decoding={decoding}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateList({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ol
      className={`
        -mx-4 grid auto-rows-[auto_1fr] grid-cols-2 gap-x-[clamp(8px,2vw,32px)]
        gap-y-[clamp(8px,2vw,32px)]
        tablet:grid-cols-3 tablet:gap-x-6 tablet:gap-y-6
        tablet-landscape:-mx-6 tablet-landscape:grid-cols-6
        tablet-landscape:gap-x-6 tablet-landscape:gap-y-6
        desktop:-mx-8 desktop:grid-cols-6 desktop:gap-y-12
      `}
    >
      {children}
    </ol>
  );
}

function UpdateListItem({
  children,
}: {
  children: React.ReactNode;
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
      {children}
    </li>
  );
}

function UpdateTitle({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}): JSX.Element {
  return (
    <div
      className={`
        pt-2 text-xs leading-4 font-medium
        tablet:pt-3
      `}
    >
      <a
        className={`
          block font-sans
          after:absolute after:top-0 after:left-0 after:z-60 after:size-full
          after:opacity-0
          hover:text-accent
        `}
        href={href}
        rel="canonical"
      >
        {children}
      </a>
    </div>
  );
}
