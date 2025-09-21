import type { JSX } from "react";

/**
 * Site footer component displaying copyright and fair use information.
 */
export function Footer(): JSX.Element {
  return (
    <div
      className={`
        sticky bottom-0 flex w-full flex-wrap items-start justify-between
        gap-[10%] bg-footer px-container py-5 text-sm
        tablet:px-12
        desktop:p-10
      `}
    >
      <p
        className={`
          w-full px-container text-center leading-5 font-normal text-off-white
        `}
      >
        All images used in accordance with the{" "}
        <a
          className={`
            relative inline-block pr-4 text-inherit underline underline-offset-3
            hover:text-accent
          `}
          href="http://www.copyright.gov/title17/92chap1.html#107"
          rel="nofollow"
        >
          Fair Use Law
          <svg
            className="absolute top-0.5 right-0 size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        .
      </p>
    </div>
  );
}
