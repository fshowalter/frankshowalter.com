import type { BackdropImageProps } from "~/api/backdrops";

import { Backdrop } from "~/components/Backdrop";
import { Layout } from "~/components/Layout";

import {
  type BooklogListItemValue,
  BooklogUpdateListItem,
} from "./BooklogUpdateListItem";
import { HomeSubHeading } from "./HomeSubHeading";
import { HomeUpdateList } from "./HomeUpdateList";
import {
  type MovielogListItemValue,
  MovielogUpdateListItem,
} from "./MovielogUpdateListItem";

export type Props = {
  backdropImageProps: BackdropImageProps;
  booklogUpdates: BooklogListItemValue[];
  movielogUpdates: MovielogListItemValue[];
};

export const HomeImageConfig = {
  sizes:
    "(min-width: 1800px) 218px, (min-width: 1280px) calc(11.8vw + 8px), (min-width: 960px) 248px, (min-width: 600px) calc(23.24vw + 30px), calc(41.43vw + 8px)",
  width: 248,
};

export function Home({
  backdropImageProps,
  booklogUpdates,
  movielogUpdates,
}: Props): React.JSX.Element {
  return (
    <Layout className="bg-subtle pb-16">
      <Backdrop
        deck={<>I write stuff. Mostly movie reviews, sometimes book reviews.</>}
        imageProps={backdropImageProps}
        title="Frank Showalter"
      />
      <div className="border-t-4 border-(--bg-hero-border)">
        <nav
          className={`
            mx-auto w-full max-w-[908px] bg-subtle
            tablet:px-container
            laptop:max-w-(--breakpoint-desktop) laptop:px-container
          `}
        >
          <HomeSubHeading
            accentText="Movie Reviews"
            href="https://www.franksmovielog.com"
            text="Latest"
          />
          <HomeUpdateList>
            {movielogUpdates.map((value) => {
              return <MovielogUpdateListItem key={value.slug} value={value} />;
            })}
          </HomeUpdateList>
          <HomeSubHeading
            accentText="Book Reviews"
            href="https://www.franksbooklog.com"
            text="Latest"
          />

          <HomeUpdateList>
            {booklogUpdates.map((value) => {
              return <BooklogUpdateListItem key={value.slug} value={value} />;
            })}
          </HomeUpdateList>
        </nav>
      </div>
    </Layout>
  );
}
