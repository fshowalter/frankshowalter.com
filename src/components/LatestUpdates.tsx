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
        mx-auto w-full max-w-[888px] px-container pb-20
        desktop:max-w-(--breakpoint-max)
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
            <UpdateListItem
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
        -mx-2 flex flex-wrap content-stretch justify-center
        min-[496px]:-mx-4
        min-[736px]:-mx-12
        min-[1360px]:gap-y-4
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
        relative flex w-[50%] max-w-[344px] flex-col items-center p-2
        text-subtle
        has-[a:hover]:bg-canvas has-[a:hover]:shadow-hover
        min-[496px]:p-4
        min-[768px]:w-[33.33333333%]
        min-[1360px]:w-[16.66666667%]
      `}
    >
      <div
        className={`
          flex h-full w-full flex-col bg-default
          min-[496px]:px-8 min-[496px]:pb-4
          min-[640px]:pt-6
        `}
      >
        <a
          aria-label={value.title}
          className={`
            inline-block
            before:absolute before:inset-x-2 before:top-2 before:aspect-cover
            before:bg-default before:opacity-15
            after:absolute after:top-0 after:left-0 after:z-10 after:size-full
            after:opacity-0
            hover:text-accent hover:before:opacity-0
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
            flex w-full grow flex-wrap items-center gap-x-2 px-1 py-2
            tablet:px-px tablet:py-3
          `}
        >
          <div className="mr-auto">
            <Grade
              className="max:h-5 max:w-auto"
              height={18}
              value={value.stars}
            />
          </div>
          <div
            className={`
              pl-1 font-sans text-xs leading-6 font-light
              max:text-sm
            `}
          >
            {" "}
            on {formatDate(value.date)}
          </div>
        </div>
      </div>
    </li>
  );
}
