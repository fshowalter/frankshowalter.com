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
    <Layout className="bg-subtle pb-16">
      <Backdrop
        deck={<>I write stuff. Mostly movie reviews, sometimes book reviews.</>}
        imageProps={backdropImageProps}
        title="Frank Showalter"
      />
      <div className="border-t border-default">
        <LatestUpdates
          booklogUpdates={booklogUpdates}
          movielogUpdates={movielogUpdates}
        />
      </div>
    </Layout>
  );
}
