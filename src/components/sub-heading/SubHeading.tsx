/**
 * Renders a styled subheading component with configurable semantic heading level.
 * Displays uppercase text with consistent spacing and typography.
 */
export function SubHeading({
  as,
  children,
  className,
}: {
  as: "h2" | "h3" | "h4" | "h5";
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  const Component = as;

  return (
    <Component
      className={`
        pt-10 pb-5 font-sans text-[13px] font-bold tracking-wide text-subtle/70
        uppercase
        tablet:text-sm
        laptop:text-xs
        ${className ?? ""}
      `}
    >
      {children}
    </Component>
  );
}
