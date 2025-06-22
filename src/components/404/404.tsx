import type { JSX } from "react";

import { SolidBackdrop } from "~/components/Backdrop";
import { LatestUpdates } from "~/components/LatestUpdates";
import { Layout } from "~/components/Layout";

export type Props = React.ComponentProps<typeof LatestUpdates> & {
  deck: string;
  title: string;
};

export function Content({
  booklogUpdates,
  deck,
  movielogUpdates,
  title,
}: Props): JSX.Element {
  return (
    <Layout className="bg-subtle pb-8">
      <SolidBackdrop
        deck={deck}
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
