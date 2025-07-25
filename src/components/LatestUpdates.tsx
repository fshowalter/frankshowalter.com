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
        mx-auto w-full max-w-[908px] bg-subtle px-container
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
      <UpdateCover
        decoding="async"
        imageProps={value.imageProps}
        {...ImageConfig}
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
      <UpdatePoster
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

function UpdateCover({
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
    <UpdateImage>
      <div
        className={`
          relative
          after:absolute after:top-0 after:left-0 after:z-20 after:block
          after:size-full after:rounded-[2.5px] after:bg-[url(/assets/spot.png)]
          after:bg-size-[100%_100%] after:mix-blend-soft-light
        `}
      >
        <div
          className={`
            relative z-10
            before:absolute before:top-0 before:left-0 before:z-10 before:block
            before:size-full before:rounded-[2.5px]
            before:bg-[url(/assets/spine-light.png)] before:bg-size-[100%_100%]
            after:absolute after:top-0 after:left-0 after:z-10 after:block
            after:size-full after:rounded-[2.5px]
            after:bg-[url(/assets/spine-dark.png)] after:bg-size-[100%_100%]
            after:mix-blend-multiply
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
    </UpdateImage>
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
          @min-[200px]:px-[clamp(4px,12cqw,32px)] @min-[200px]:pb-6
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
        @min-[248px]:mt-2 @min-[248px]:h-[14px] @min-[248px]:w-[70px]
      `}
      height={16}
      value={stars}
    />
  );
}

function UpdateImage({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      className={`
        @container flex self-end
        tablet:self-auto
      `}
    >
      <div className={`z-10 flex justify-center bg-default`}>
        <div
          className={`
            px-3 pt-3
            @min-[200px]:px-[clamp(4px,12cqw,32px)] @min-[200px]:pt-6
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
            {children}
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
        -mx-4 grid auto-rows-[auto_1fr] grid-cols-2 flex-wrap
        gap-x-[clamp(8px,2vw,32px)] gap-y-[clamp(8px,2vw,32px)]
        tablet:flex tablet:items-baseline tablet:gap-x-4 tablet:gap-y-4
        laptop:-mx-6 laptop:gap-x-6 laptop:gap-y-6
        desktop:-mx-8 desktop:gap-y-12
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
        flex-col gap-y-0 bg-default transition-transform
        has-[a:hover]:drop-shadow-2xl
        tablet:flex tablet:w-[calc((100%_-_32px)_/_3)]
        tablet:has-[a:hover]:scale-105
        laptop:w-[calc((100%_-_120px)_/_6)]
      `}
    >
      {children}
    </li>
  );
}

function UpdatePoster({
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
    <UpdateImage>
      <div
        className={`
          relative
          after:absolute after:top-0 after:left-0 after:z-20 after:block
          after:size-full after:rounded-[2.5px] after:bg-[url(/assets/spot.png)]
          after:bg-size-[100%_100%] after:mix-blend-soft-light
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
    </UpdateImage>
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
