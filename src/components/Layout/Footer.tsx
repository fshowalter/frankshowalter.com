import type { JSX } from "react";

export function Footer(): JSX.Element {
  return (
    <div
      className={`
        flex flex-wrap items-start justify-between gap-[10%] bg-footer
        px-container py-10 text-inverse
        tablet:px-12 tablet:pt-10
        desktop:p-10
      `}
    >
      <p
        className={`
          flex w-full flex-wrap items-center justify-center gap-x-1 text-lg
        `}
      >
        <span className="shrink-0">I&apos;m too old for social media.</span>
        <span className="shrink-0">What you see is what you get.</span>
      </p>
    </div>
  );
}
