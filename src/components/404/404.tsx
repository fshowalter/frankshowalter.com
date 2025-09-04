import type { JSX } from "react";

import type { BackdropImageProps } from "~/api/backdrops";

import { Backdrop } from "~/components/Backdrop";
import { Layout } from "~/components/Layout";

export type Props = {
  backdropImageProps: BackdropImageProps;
  deck: string;
  title: string;
};

export function Content({
  backdropImageProps,
  deck,
  title,
}: Props): JSX.Element {
  return (
    <Layout className="flex flex-col bg-subtle">
      <Backdrop deck={deck} imageProps={backdropImageProps} title={title} />
      <div
        className={`
          flex grow flex-col items-center justify-center px-container py-8
          text-lg
        `}
      >
        My apologies.
        <div className="mt-8 flex gap-4">
          <NavLink href="/" text="Home" />

          <NavLink href="https://www.franksmovielog.com/" text="Movielog" />

          <NavLink href="https://www.franksbooklog.com/" text="Booklog" />
        </div>
      </div>
    </Layout>
  );
}

function NavLink({ href, text }: { href: string; text: string }) {
  return (
    <a
      className={`
        relative font-semibold text-accent
        after:absolute after:bottom-0 after:left-0 after:h-px after:w-full
        after:origin-center after:scale-x-0 after:bg-accent
        after:transition-transform after:duration-500
        hover:after:scale-x-100
      `}
      href={href}
    >
      {text}
    </a>
  );
}
