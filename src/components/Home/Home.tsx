import type { JSX } from "react";
import type React from "react";

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
    <Layout className="bg-subtle pb-8">
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
        title="Frank Showalter"
        titleStyle="text-2.5xl tablet:text-5xl font-bold uppercase tracking-widest desktop:text-7xl font-sans"
      />
      <nav className="mx-auto w-full max-w-[888px] bg-subtle pb-20 tablet:px-container desktop:max-w-screen-max">
        <SubHeading as="h2" className="px-container tablet:px-0">
          Latest{" "}
          <a className="text-accent" href="https://www.franksmovielog.com">
            Movie Reviews
          </a>
        </SubHeading>
        <HomeList>
          {movielogUpdates.map((value, index) => {
            return (
              <HomeListItem
                eagerLoadCoverImage={index < 2}
                key={value.slug}
                siteUrl="https://www.franksmovielog.com"
                value={value}
              />
            );
          })}
        </HomeList>
        <SubHeading as="h2" className="px-container tablet:px-0">
          Latest{" "}
          <a className="text-accent" href="https://www.franksbooklog.com">
            Book Reviews
          </a>
        </SubHeading>
        <HomeList>
          {booklogUpdates.map((value) => {
            return (
              <HomeListItem
                eagerLoadCoverImage={false}
                key={value.slug}
                siteUrl="https://www.franksbooklog.com"
                value={value}
              />
            );
          })}
        </HomeList>
      </nav>
    </Layout>
  );
}

function HomeList({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <ol className="flex flex-wrap justify-center gap-x-[4%] gap-y-[6vw] px-[4%] tablet:gap-x-[3%] tablet:px-0 desktop:justify-between desktop:gap-x-[2%]">
      {children}
    </ol>
  );
}
