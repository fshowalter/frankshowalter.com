import type { JSX } from "react";

export function Footer(): JSX.Element {
  return (
    <div
      className={`
        flex flex-wrap items-start justify-between gap-[10%] bg-footer
        px-container py-5 text-sm
        tablet:px-12
        desktop:p-10
      `}
    >
      <p
        className={`
          w-full px-container text-center leading-5 font-normal text-[#b0b0b0]
        `}
      >
        All images used in accordance with the{" "}
        <a
          className={`
            text-inherit underline
            hover:bg-default hover:text-default
          `}
          href="http://www.copyright.gov/title17/92chap1.html#107"
          rel="nofollow"
        >
          Fair Use Law
        </a>
        .
      </p>
    </div>
  );
}
