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
      <p className="mx-auto text-lg">
        I&apos;m too old for social media. What you see is what you get.
      </p>
    </div>
  );
}
