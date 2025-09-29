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
        mb-10 border-b border-border pt-10 pb-5 font-sans text-base font-medium
        text-subtle/70
        ${className ?? ""}
      `}
    >
      {children}
    </Component>
  );
}
