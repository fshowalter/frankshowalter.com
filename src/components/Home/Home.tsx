import type { JSX } from "react";
import type React from "react";

import { SolidBackdrop } from "~/components/Backdrop";
import { LatestUpdates } from "~/components/LatestUpdates";
import { Layout } from "~/components/Layout";

export type Props = React.ComponentProps<typeof LatestUpdates>;

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
        titleClasses={`
          font-sans text-2xl font-semibold uppercase
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
