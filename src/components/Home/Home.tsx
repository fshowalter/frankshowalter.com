import type { JSX } from "react";
import type React from "react";

import type { BackdropImageProps } from "~/api/backdrops";

import { Backdrop } from "~/components/Backdrop";
import { LatestUpdates } from "~/components/LatestUpdates";
import { Layout } from "~/components/Layout";

export type Props = React.ComponentProps<typeof LatestUpdates> & {
  backdropImageProps: BackdropImageProps;
};

export function Home({
  backdropImageProps,
  booklogUpdates,
  movielogUpdates,
}: Props): JSX.Element {
  return (
    <Layout className="bg-subtle pb-8">
      <Backdrop
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
        imageProps={backdropImageProps}
        title="Frank Showalter"
        titleClasses={`
          font-sans text-2xl font-semibold uppercase
          tablet:text-5xl
          laptop:text-6xl
          desktop:text-7xl
        `}
      />
      <LatestUpdates
        booklogUpdates={booklogUpdates}
        movielogUpdates={movielogUpdates}
      />
    </Layout>
  );
}
