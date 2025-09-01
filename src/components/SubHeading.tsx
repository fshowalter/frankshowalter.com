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
        pt-10 pb-10 font-sans text-xs font-bold tracking-wide text-subtle
        uppercase
        tablet:pb-5
        ${className ?? ""}
      `}
    >
      {children}
    </Component>
  );
}
