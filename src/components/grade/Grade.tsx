const gradeMap: Record<string, [string, string]> = {
  0.5: ["/svg/haf-star.svg", "1/2 star (out of 5)"],
  1: ["/svg/1-star.svg", "1 star (out of 5)"],
  1.5: ["/svg/1-half-stars.svg", "1.5 stars (out of 5)"],
  2: ["/svg/2-stars.svg", "2 stars (out of 5)"],
  2.5: ["/svg/2-half-stars.svg", "2.5 stars (out of 5)"],
  3: ["/svg/3-stars.svg", "3 stars (out of 5)"],
  3.5: ["/svg/3-half-stars.svg", "3.5 stars (out of 5)"],
  4: ["/svg/4-stars.svg", "4 stars (out of 5)"],
  4.5: ["/svg/4-half-stars.svg", "4.5 stars (out of 5)"],
  5: ["/svg/5-stars.svg", "5 stars (out of 5)"],
};

/**
 * Displays a star rating visualization with support for half stars.
 * Shows appropriate star SVGs based on the numeric rating value.
 */
export function Grade({
  className,
  height,
  value,
}: {
  className?: string;
  height: 15 | 16 | 18 | 24 | 32;
  value?: number | string;
}): false | React.JSX.Element {
  if (!value || value == "Abandoned") {
    return false;
  }

  const [src, alt] = gradeMap[value];

  const width = height * 5;

  return (
    <picture>
      <source
        media="(prefers-color-scheme: dark)"
        srcSet={src.replace(".svg", "-dark.svg")}
      />
      <img
        alt={alt}
        className={className}
        height={height}
        src={src}
        width={width}
      />
    </picture>
  );
}
