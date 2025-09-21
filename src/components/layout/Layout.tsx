import type { JSX } from "react";

import { Backdrop } from "./Backdrop";
import { Footer } from "./Footer";
import { Logo } from "./Logo";

/**
 * Main layout component that provides the page structure with backdrop, header, and footer.
 * Wraps content in a consistent visual design across all pages.
 */
export function Layout({
  backdrop,
  children,
  className,
  logo = false,
}: {
  backdrop: React.ComponentProps<typeof Backdrop>;
  children: React.ReactNode;
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
          <div
            className={`absolute top-0 left-0 z-30 px-container py-6 text-white`}
          >
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
