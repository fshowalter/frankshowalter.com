import type { JSX } from "react";

import { Footer } from "./Footer";

export function Layout({
  children,
  className,
  ...rest
}: {
  [x: string]: unknown;
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div>
      <a
        className={`
          absolute top-0.5 left-1/2 z-50 mx-auto
          [transform:translate(-50%,calc(-100%-2px))]
          bg-subtle px-6 py-2 text-center text-accent
          focus:[transform:translate(-50%,0%)]
        `}
        href="#content"
      >
        Skip to content
      </a>
      <div className="flex min-h-full w-full flex-col bg-default">
        <main
          className={`
            grow
            ${className}
          `}
          id="content"
          {...rest}
        >
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
