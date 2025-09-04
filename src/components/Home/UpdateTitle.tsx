import type { JSX } from "react";
import type React from "react";

export function UpdateTitle({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}): JSX.Element {
  return (
    <a
      className={`
        text-[clamp(16px,5cqw,24px)] leading-5 font-semibold text-default
        transition-all duration-500
        after:absolute after:top-0 after:left-0 after:z-10 after:size-full
        after:opacity-0
        hover:text-accent
      `}
      href={href}
      rel="canonical"
    >
      {children}
    </a>
  );
}