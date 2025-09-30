/**
 * Heading component for update lists with linked text and accent highlight.
 * Features an animated underline effect on hover.
 */
export function UpdateListHeading({
  accentText,
  as = "h2",
  className = "",
  href,
  id,
  text,
}: {
  accentText: string;
  as?: "h2" | "h3" | "h4" | "h5";
  className?: string;
  href: string;
  id?: string;
  text: string;
}): React.JSX.Element {
  const Component = as;

  return (
    <Component
      className={`
        mb-5 border-t border-border px-[1.5%] pt-10 pb-5 text-center font-sans
        text-base font-medium text-subtle/70
        laptop:text-left
        ${className ?? ""}
      `}
      id={id}
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
    </Component>
  );
}
