import type { JSX } from "react";

import { SolidBackdrop } from "~/components/Backdrop";
import { Layout } from "~/components/Layout";
import { SubHeading } from "~/components/SubHeading";
import { HomeListItem, type HomeListItemValue } from "./HomeListItem";

export type Props = {
  booklogUpdates: HomeListItemValue[];
  movielogUpdates: HomeListItemValue[];
};

export function Home({ booklogUpdates, movielogUpdates }: Props): JSX.Element {
  return (
    <Layout className="bg-subtle pb-8" hideLogo={true}>
      <SolidBackdrop
        deck={
          <>
            I write stuff. Mostly{" "}
            <a className="text-accent" href="https://www.franksmovielog.com/">
              movie reviews
            </a>
            , sometimes{" "}
            <a className="text-accent" href="https://www.franksbooklog.com/">
              book reviews
            </a>
            .
          </>
        }
        title="I am Frank."
        titleStyle="text-default text-4xl desktop:text-7xl"
      />
      <nav className="mx-auto pb-20 max-w-screen-max bg-subtle tablet:px-container">
        <SubHeading as="h2" className="px-container tablet:px-0">
          Latest{" "}
          <a className="text-accent" href="https://www.franksmovielog.com">
            Movie Reviews
          </a>
        </SubHeading>
        <ol className="flex flex-wrap justify-center gap-x-[4%] gap-y-[6vw] px-[4%] tablet:gap-x-[3%] tablet:px-0 desktop:justify-between desktop:gap-x-[2%]">
          {movielogUpdates.map((value, index) => {
            return (
              <HomeListItem
                eagerLoadCoverImage={index === 0}
                key={value.slug}
                value={value}
              />
            );
          })}
        </ol>
        <SubHeading as="h2" className="px-container tablet:px-0">
          Latest{" "}
          <a className="text-accent" href="https://www.franksbooklog.com">
            Book Reviews
          </a>
        </SubHeading>
        <ol className="flex flex-wrap justify-center gap-x-[4%] gap-y-[6vw] px-[4%] tablet:gap-x-[3%] tablet:px-0 desktop:justify-between desktop:gap-x-[2%]">
          {booklogUpdates.map((value, index) => {
            return (
              <HomeListItem
                eagerLoadCoverImage={index === 0}
                key={value.slug}
                value={value}
              />
            );
          })}
        </ol>
      </nav>
    </Layout>
  );
}
