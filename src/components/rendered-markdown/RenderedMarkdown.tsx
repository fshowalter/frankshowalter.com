/**
 * Renders HTML content from markdown.
 * @param props - Component props
 * @param props.as - The element type to render (defaults to "div")
 * @param props.className - Additional CSS classes
 * @param props.text - HTML text to render (from markdown)
 * @returns Rendered HTML content or false if no text
 */
export function RenderedMarkdown({
  as = "div",
  className,
  text,
}: {
  as?: React.ElementType;
  className?: string;
  text: string | undefined;
}): false | React.JSX.Element {
  if (!text) {
    return false;
  }

  const Component = as;

  return (
    <Component
      className={`
        rendered-markdown
        ${className ?? ""}
      `}
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    />
  );
}
