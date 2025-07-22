import type { JSX } from "react";

import type { BackdropImageProps } from "~/api/backdrops";

import { Backdrop } from "~/components/Backdrop";
import { LatestUpdates } from "~/components/LatestUpdates";
import { Layout } from "~/components/Layout";

export type Props = React.ComponentProps<typeof LatestUpdates> & {
  backdropImageProps: BackdropImageProps;
  deck: string;
  title: string;
};

export function Content({
  backdropImageProps,
  booklogUpdates,
  deck,
  movielogUpdates,
  title,
}: Props): JSX.Element {
  return (
    <Layout className="bg-subtle pb-8">
      <Backdrop
        deck={deck}
        imageProps={backdropImageProps}
        title={title}
        titleClasses={`
          font-sans text-2.5xl font-semibold uppercase
          tablet:text-5xl
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
