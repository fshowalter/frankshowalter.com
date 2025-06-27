import type { JSX } from "react";
import type React from "react";

import type { ImageProps } from "~/api/images";

import { Grade } from "./Grade";
import { SubHeading } from "./SubHeading";

type Props = {
  booklogUpdates: ListItemValue[];
  movielogUpdates: ListItemValue[];
};

export const ImageConfig = {
  height: 372,
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1280px) calc(11.8vw + 8px), (min-width: 960px) 248px, (min-width: 600px) calc(23.24vw + 30px), calc(41.43vw + 8px)",
  width: 248,
};

type ListItemValue = {
  date: Date;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
};

export function LatestUpdates({
  booklogUpdates,
  movielogUpdates,
}: Props): JSX.Element {
  return (
    <nav
      className={`
        mx-auto w-full max-w-[888px] pb-20
        min-[600px]:px-container
        desktop:max-w-(--breakpoint-max)
      `}
    >
      <SubHeading
        as="h2"
        className={`
          px-container
          min-[600px]:px-0
        `}
      >
        Latest{" "}
        <a className="text-accent" href="https://www.franksmovielog.com">
          Movie Reviews
        </a>
      </SubHeading>
      <UpdateList>
        {movielogUpdates.map((value, index) => {
          return (
            <UpdateListItem
              eagerLoadCoverImage={index < 2}
              key={value.slug}
              siteUrl="https://www.franksmovielog.com"
              value={value}
            />
          );
        })}
      </UpdateList>
      <SubHeading
        as="h2"
        className={`
          px-container
          min-[600px]:px-0
        `}
      >
        Latest{" "}
        <a className="text-accent" href="https://www.franksbooklog.com">
          Book Reviews
        </a>
      </SubHeading>
      <UpdateList>
        {booklogUpdates.map((value) => {
          return (
            <UpdateListItem
              eagerLoadCoverImage={false}
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

function formatDate(reviewDate: Date) {
  return reviewDate.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function UpdateImage({
  decoding = "async",
  imageProps,
  loading = "lazy",
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  decoding: "async" | "auto" | "sync";
  height: number;
  imageProps: ImageProps | undefined;
  loading: "eager" | "lazy";
  width: number;
}): JSX.Element {
  return (
    <img
      {...imageProps}
      {...rest}
      alt=""
      decoding={decoding}
      loading={loading}
      style={{ aspectRatio: "0.66666667" }}
    />
  );
}

function UpdateList({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ol
      className={`
        -mx-4 flex flex-wrap justify-center gap-y-2 px-[4%]
        min-[600px]:gap-x-0 min-[600px]:px-0
        desktop:flex-nowrap desktop:justify-between
      `}
    >
      {children}
    </ol>
  );
}

function UpdateListItem({
  eagerLoadCoverImage,
  siteUrl,
  value,
}: {
  eagerLoadCoverImage: boolean;
  siteUrl: "https://www.franksbooklog.com" | "https://www.franksmovielog.com";
  value: ListItemValue;
}): JSX.Element {
  return (
    <li
      className={`
        group relative flex w-[50%] max-w-[280px] flex-col items-center px-4
        py-4 text-subtle
        has-[a:hover]:bg-canvas has-[a:hover]:shadow-hover
        min-[600px]:w-[33%]
        desktop:w-full
      `}
    >
      <a
        aria-label={value.title}
        className={``}
        href={`${siteUrl}/reviews/${value.slug}/`}
        rel="canonical"
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
          flex w-full grow flex-wrap items-center px-1 py-2
          tablet:px-px tablet:py-3
        `}
      >
        <div>
          <Grade
            className="tablet:h-5 tablet:w-auto"
            height={18}
            value={value.stars}
          />
        </div>
        <div
          className={`
            ml-auto font-sans text-xs font-light
            group-hover:text-accent
            tablet:text-sm
          `}
        >
          {formatDate(value.date)}
        </div>
      </div>
    </li>
  );
}
