import type { JSX } from "react";

export function Footer(): JSX.Element {
  return (
    <div
      className={
        "bg-footer px-container text-inverse tablet:px-12 tablet:pt-10 desktop:p-10 flex flex-wrap items-start justify-between gap-[10%] py-10"
      }
    ></div>
  );
}
