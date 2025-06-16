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
    <Layout className="pb-8 bg-subtle">
      <SolidBackdrop
        deck={deck}
        title={title}
        titleStyle="text-2.5xl tablet:text-5xl font-bold uppercase tracking-widest desktop:text-7xl font-sans"
      />
      <LatestUpdates
        booklogUpdates={booklogUpdates}
        movielogUpdates={movielogUpdates}
      />
    </Layout>
  );
}
