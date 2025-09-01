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
        mx-auto w-full max-w-[908px] bg-subtle
        tablet:px-container
        laptop:max-w-(--breakpoint-desktop) laptop:px-container
      `}
    >
      <LatestUpdatesHeading
        accentText="Movie Reviews"
        href="https://www.franksmovielog.com"
        text="Latest"
      />
      <UpdateList>
        {movielogUpdates.map((value) => {
          return <MovielogUpdateListItem key={value.slug} value={value} />;
        })}
      </UpdateList>
      <LatestUpdatesHeading
        accentText="Book Reviews"
        href="https://www.franksbooklog.com"
        text="Latest"
      />

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
      <UpdateCover imageProps={value.imageProps} {...ImageConfig} />

      <UpdateDetails>
        <UpdateDate date={value.date} />
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

function formatDate(reviewDate: Date) {
  return reviewDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
}

function LatestUpdatesHeading({
  accentText,
  href,
  text,
}: {
  accentText: string;
  as?: "h2" | "h3" | "h4" | "h5";
  href: string;
  text: string;
}): React.JSX.Element {
  return (
    <SubHeading as="h2">
      <a
        className={`
          relative -mb-1 inline-block transform-gpu px-container pb-1
          transition-all
          after:absolute after:bottom-0 after:left-0 after:h-px after:w-full
          after:origin-bottom-right after:scale-x-0 after:bg-accent
          after:transition-transform after:duration-500
          hover:after:scale-x-100
          tablet:px-0
        `}
        href={href}
      >
        {text} <span className={`text-accent`}>{accentText}</span>
      </a>
    </SubHeading>
  );
}

function MovielogUpdateListItem({
  value,
}: {
  value: MovielogListItemValue;
}): JSX.Element {
  return (
    <UpdateListItem>
      <UpdatePoster imageProps={value.imageProps} {...ImageConfig} />
      <UpdateDetails>
        <UpdateDate date={value.date} />
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

function UpdateCover({
  className,
  imageProps,
}: {
  className?: string;
  imageProps: ImageProps;
}): React.JSX.Element {
  return (
    <div
      className={`
        relative w-1/4 max-w-[250px] shrink-0 self-start overflow-hidden
        rounded-sm shadow-all transition-transform
        after:absolute after:top-0 after:left-0 after:z-10 after:size-full
        after:bg-default after:opacity-15 after:transition-opacity
        group-has-[a:hover]/list-item:after:opacity-0
        ${className ?? "tablet:w-auto"}
      `}
    >
      <div
        className={`
          relative
          after:absolute after:top-0 after:left-0 after:z-10 after:block
          after:size-full after:rounded-[2.5px]
          after:bg-[url(/assets/spine-dark.png)] after:bg-size-[100%_100%]
          after:mix-blend-multiply
        `}
      >
        <div
          className={`
            relative z-10
            before:absolute before:top-0 before:left-0 before:z-10 before:block
            before:size-full before:rounded-[2.5px]
            before:bg-[url(/assets/spine-light.png)] before:bg-size-[100%_100%]
            after:absolute after:top-0 after:left-0 after:block after:size-full
            after:rounded-[2.5px] after:bg-[url(/assets/spot.png)]
            after:bg-size-[100%_100%] after:mix-blend-soft-light
          `}
        >
          <img
            {...imageProps}
            alt=""
            {...ImageConfig}
            className={`
              transform-gpu rounded-[2.5px] bg-default shadow-sm
              transition-transform duration-500
              group-has-[a:hover]/list-item:scale-110
              @min-[160px]:shadow-lg
            `}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function UpdateDate({ date }: { date: Date }): JSX.Element {
  return (
    <div
      className={`
        font-sans text-[13px] leading-4 font-normal whitespace-nowrap
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
    <div className="@container/details w-full">
      <div
        className={`
          flex grow flex-col items-start gap-y-2
          tablet:mt-2 tablet:w-full tablet:px-1
        `}
      >
        {children}
      </div>
    </div>
  );
}

function UpdateGrade({ stars }: { stars: number }): JSX.Element {
  return <Grade className="-mt-0.5 pb-[3px]" height={15} value={stars} />;
}

function UpdateList({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="@container/update-list">
      <ol
        className={`
          items-baseline
          [--update-list-item-width:50%]
          tablet:-mx-6 tablet:flex tablet:flex-wrap
          @min-[calc((250px_*_2)_+_1px)]/update-list:[--update-list-item-width:33.33%]
          @min-[calc((250px_*_5)_+_1px)]/update-list:[--update-list-item-width:16.66%]
        `}
      >
        {children}
      </ol>
    </div>
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
        group/list-item relative mb-1 flex w-full max-w-(--breakpoint-desktop)
        transform-gpu flex-row gap-x-[5%] bg-default px-container py-4
        transition-transform duration-500
        tablet:w-(--update-list-item-width) tablet:flex-col
        tablet:bg-transparent tablet:px-6 tablet:py-6
        tablet:has-[a:hover]:-translate-y-2 tablet:has-[a:hover]:bg-default
        tablet:has-[a:hover]:drop-shadow-2xl
      `}
    >
      {children}
    </li>
  );
}

function UpdatePoster({
  imageProps,
}: {
  imageProps: ImageProps;
}): React.JSX.Element {
  return (
    <div
      className={`
        relative w-1/4 max-w-[250px] shrink-0 self-start overflow-hidden
        rounded-sm shadow-all
        after:absolute after:top-0 after:left-0 after:size-full after:bg-default
        after:opacity-15 after:transition-all after:duration-500
        group-has-[a:hover]/list-item:after:opacity-0
        tablet:w-full
      `}
    >
      <img
        {...imageProps}
        alt=""
        {...ImageConfig}
        className={`
          aspect-[1/1.5] w-full transform-gpu object-cover transition-transform
          duration-500
          group-has-[a:hover]/list-item:scale-110
        `}
        decoding="async"
        loading="lazy"
      />
    </div>
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
    <a
      className={`
        text-[clamp(16px,5cqw,24px)] leading-5 font-semibold text-default
        transition-all duration-500
        after:absolute after:top-0 after:left-0 after:z-10 after:size-full
        after:opacity-0
        hover:text-accent
      `}
      href={href}
      rel="canonical"
    >
      {children}
    </a>
  );
}
