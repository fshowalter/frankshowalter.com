import type { JSX } from "react";

import { Footer } from "./Footer";
import { Backdrop } from "./Backdrop";
import { Logo } from "./Logo";

export function Layout({
  children,
  className,
  backdrop,
  logo = false,
}: {
  children: React.ReactNode;
  backdrop: React.ComponentProps<typeof Backdrop>;
  className?: string;
  logo?: boolean;
}): JSX.Element {
  return (
    <div className="h-full">
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
        {logo && (
          <div className="px-container py-6 absolute top-0 left-0 text-white z-30">
            <Logo />
          </div>
        )}
        <main
          className={`
            z-10 grow
            ${className}
          `}
          id="content"
        >
          {backdrop && <Backdrop {...backdrop} />}
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
