import type { JSX } from "react";

import { Footer } from "./Footer";

export function Layout({
  children,
  className,
  hasBackdrop = true,
  hideLogo = false,
  ...rest
}: {
  [x: string]: unknown;
  children: React.ReactNode;
  className?: string;
  hasBackdrop?: boolean;
  hideLogo?: boolean;
}): JSX.Element {
  return (
    <div>
      <a
        className="absolute left-1/2 top-0.5 z-50 mx-auto bg-subtle px-6 py-2 text-center text-accent [transform:translate(-50%,calc(-100%_-_2px))] focus:[transform:translate(-50%,0%)]"
        href="#content"
      >
        Skip to content
      </a>
      <div className="flex min-h-full w-full flex-col bg-default">
        <main className="grow" id="content" {...rest}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
