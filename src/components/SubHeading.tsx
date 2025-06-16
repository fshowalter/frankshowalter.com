export function SubHeading({
  as,
  children,
  className,
}: {
  as: "h2" | "h3" | "h4" | "h5";
  children: React.ReactNode;
  className?: string;
}) {
  const Component = as;

  return (
    <Component
      className={`
        py-10 font-sans text-xs font-semibold tracking-wide text-subtle
        uppercase
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
