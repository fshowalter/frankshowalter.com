import type { JSX } from "react";

import type { ImageProps } from "~/api/images";

import { Grade } from "~/components/Grade";
import { HomeImage } from "~/components/Home/HomeImage";

export const ImageConfig = {
  height: 372,
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1280px) calc(11.8vw + 8px), (min-width: 960px) 248px, (min-width: 600px) calc(23.24vw + 30px), calc(41.43vw + 8px)",
  width: 248,
};

export type HomeListItemValue = {
  date: Date;
  imageProps: ImageProps;
  slug: string;
  stars: number;
  title: string;
};

export function HomeListItem({
  eagerLoadCoverImage,
  siteUrl,
  value,
}: {
  eagerLoadCoverImage: boolean;
  siteUrl: "https://www.franksbooklog.com" | "https://www.franksmovielog.com";
  value: HomeListItemValue;
}): JSX.Element {
  return (
    <li className="relative flex w-[48%] max-w-[248px] flex-col items-center has-[a:hover]:bg-default has-[a:hover]:shadow-hover min-[600px]:w-[30.66666667%] tablet:w-[31.33333333%] desktop:w-[14.16666667%]">
      <a
        className="z-10 inline-block text-accent decoration-2 underline-offset-4 before:absolute before:inset-x-0 before:top-0 before:aspect-cover before:bg-default before:opacity-15 after:absolute after:left-0 after:top-0 after:size-full after:opacity-0 hover:before:opacity-0"
        href={`${siteUrl}/reviews/${value.slug}/`}
        rel="canonical"
        aria-label={value.title}
      >
        <HomeImage
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

function formatDate(reviewDate: Date) {
  return reviewDate.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}
