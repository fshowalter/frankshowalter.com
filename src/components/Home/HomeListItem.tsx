import type { JSX } from "react";

import type { ImageProps } from "~/api/images";

import { HomeImage } from "~/components/Home/HomeImage";
import { Grade } from "~/components/Grade";

export const ImageConfig = {
  height: 372,
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1300px) calc(11.67vw + 10px), (min-width: 1260px) calc(-445vw + 5855px), (min-width: 900px) calc(19.12vw + 11px), (min-width: 600px) 27.5vw, calc(41.43vw + 8px)",
  width: 248,
};

export type HomeListItemValue = {
  title: string;
  slug: string;
  stars: number;
  imageProps: ImageProps;
};

export function HomeListItem({
  eagerLoadCoverImage,
  value,
}: {
  eagerLoadCoverImage: boolean;
  value: HomeListItemValue;
}): JSX.Element {
  return (
    <li className="relative flex w-[48%] max-w-[248px] flex-col items-center border-default bg-default has-[a:hover]:bg-stripe min-[600px]:w-[30.66666667%] tablet:w-[31.33333333%] min-[900px]:w-[22.75%] desktop:w-[14.16666667%]">
      <a
        className="z-10 inline-block text-accent decoration-2 underline-offset-4 before:absolute before:inset-x-0 before:top-0 before:aspect-cover before:bg-[#fff] before:opacity-15 after:absolute after:left-0 after:top-0 after:size-full after:opacity-0 hover:before:opacity-0"
        href={`https://www.franksbooklog.com/reviews/${value.slug}/`}
        rel="canonical"
      >
        <HomeImage
          decoding="async"
          imageProps={value.imageProps}
          {...ImageConfig}
          alt=""
          loading={eagerLoadCoverImage ? "eager" : "lazy"}
        />
      </a>
      <div className="flex grow flex-col items-center px-[8%]  pb-2 desktop:pl-[8.5%] desktop:pr-[10%]">
        <Grade className="mt-2" height={18} value={value.stars} />
      </div>
    </li>
  );
}
