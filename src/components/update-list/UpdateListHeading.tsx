import { SubHeading } from "~/components/sub-heading/SubHeading";

/**
 * Heading component for update lists with linked text and accent highlight.
 * Features an animated underline effect on hover.
 */
export function UpdateListHeading({
  accentText,
  className = "",
  href,
  text,
}: {
  accentText: string;
  as?: "h2" | "h3" | "h4" | "h5";
  className?: string;
  href: string;
  text: string;
}): React.JSX.Element {
  return (
    <SubHeading
      as="h2"
      className={`
        px-[1.5%] text-center
        laptop:text-left
      `}
    >
      <a
        className={`
          relative -mb-1 inline-block transform-gpu px-container pb-1
          transition-all
          after:absolute after:bottom-0 after:left-0 after:h-px after:w-full
          after:origin-bottom-right after:scale-x-0 after:bg-accent
          after:transition-transform after:duration-500
          hover:after:scale-x-100
          tablet:px-0
        `}
        href={href}
      >
        {text} <span className={`text-accent`}>{accentText}</span>
      </a>
    </SubHeading>
  );
}
