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
    <nav className="mx-auto w-full max-w-[888px] bg-subtle pb-20 tablet:px-container desktop:max-w-screen-max">
      <SubHeading as="h2" className="px-container tablet:px-0">
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
      <SubHeading as="h2" className="px-container tablet:px-0">
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
    <ol className="flex flex-wrap justify-center gap-x-[4%] gap-y-[6vw] px-[4%] tablet:gap-x-[3%] tablet:px-0 desktop:justify-between desktop:gap-x-[2%]">
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
    <li className="relative flex w-[48%] max-w-[248px] flex-col items-center has-[a:hover]:bg-default has-[a:hover]:shadow-hover min-[600px]:w-[30.66666667%] tablet:w-[31.33333333%] desktop:w-[14.16666667%]">
      <a
        aria-label={value.title}
        className="inline-block text-accent decoration-2 underline-offset-4 before:absolute before:inset-x-0 before:top-0 before:z-10 before:aspect-cover before:bg-default before:opacity-15 after:absolute after:left-0 after:top-0 after:size-full after:opacity-0 hover:before:opacity-0"
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
      <div className="flex w-full grow content-start items-center p-2">
        <div>
          <Grade height={18} value={value.stars} />
        </div>
        <div className="ml-auto font-sans text-xs font-light text-subtle">
          {formatDate(value.date)}
        </div>
      </div>
    </li>
  );
}
