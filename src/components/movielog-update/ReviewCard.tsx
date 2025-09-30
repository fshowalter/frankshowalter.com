import type { StillImageProps } from "~/api/stills";

import { Grade } from "~/components/grade/Grade";
import { RenderedMarkdown } from "~/components/rendered-markdown/RenderedMarkdown";
import { Still } from "~/components/still/Still";

/**
 * Data structure for review card content.
 */
export type ReviewCardValue = {
  excerpt: string;
  gradeValue: number;
  releaseYear: string;
  reviewDisplayDate: string;
  slug: string;
  stillImageProps: StillImageProps;
  title: string;
};

/**
 * Card component displaying a movie review summary.
 * @param props - Component props
 * @param props.as - The element type to render (defaults to "div")
 * @param props.imageConfig - Image sizing configuration
 * @param props.value - Review data to display
 * @param props.variant - Visual style variant ("primary" or "secondary")
 * @returns Review card with still image, title, grade, and excerpt
 */
export function ReviewCard({
  as = "div",
  className = "",
  imageConfig,
  value,
  variant = "secondary",
}: {
  as?: React.ElementType;
  className?: string;
  imageConfig: {
    height: number;
    sizes: string;
    width: number;
  };
  value: ReviewCardValue;
  variant?: "primary" | "secondary";
}): React.JSX.Element {
  const Component = as;

  return (
    <Component
      className={`
        group/card relative mb-1 flex w-(--review-card-width) transform-gpu
        flex-col bg-default px-[8%] pt-12 transition-transform duration-500
        tablet:mb-0 tablet:px-0 tablet:pt-0
        tablet-landscape:has-[a:hover]:-translate-y-2
        tablet-landscape:has-[a:hover]:drop-shadow-2xl
        ${className ?? ""}
      `}
    >
      <div
        className={`
          relative mb-6 block overflow-hidden
          after:absolute after:top-0 after:left-0 after:aspect-video
          after:size-full after:bg-default after:opacity-15 after:duration-500
          group-has-[a:hover]/card:after:opacity-0
          tablet:after:inset-x-0 tablet:after:top-0
        `}
      >
        <Still
          imageProps={value.stillImageProps}
          {...imageConfig}
          className={`
            h-auto w-full transform-gpu transition-transform duration-500
            group-has-[a:hover]/card:scale-110
          `}
          decoding="async"
          loading="lazy"
        />
      </div>
      <div
        className={`
          flex grow flex-col px-1 pb-8
          ${
            variant === "primary"
              ? `
                tablet:px-[4%]
                laptop:pr-[5%] laptop:pl-[4.25%]
              `
              : `
                tablet:px-[8%]
                laptop:pr-[10%] laptop:pl-[8.5%]
              `
          }
        `}
      >
        {value.reviewDisplayDate && (
          <div
            className={`
              mb-3 font-sans text-xs leading-4 font-normal tracking-wider
              text-subtle uppercase
              laptop:tracking-wide
            `}
          >
            {value.reviewDisplayDate}
          </div>
        )}
        <a
          className={`
            mb-3 block text-2xl leading-7 font-medium text-default
            transition-all duration-500
            after:absolute after:top-0 after:left-0 after:z-10 after:size-full
            tablet:text-2.5xl
            ${variant === "primary" ? "laptop:text-3xl" : "laptop:text-2.5xl"}
            hover:text-accent
            tablet:text-2xl
          `}
          href={`/reviews/${value.slug}/`}
        >
          {value.title}&nbsp;
          <span className="text-sm leading-none font-normal text-muted">
            {value.releaseYear}
          </span>
        </a>

        <Grade
          className={`
            mb-5
            tablet:mb-8
          `}
          height={variant === "primary" ? 24 : 18}
          value={value.gradeValue}
        />

        <RenderedMarkdown
          className={`
            tracking-prose text-muted
            ${variant === "primary" ? `text-lg` : ""}
          `}
          text={value.excerpt}
        />
      </div>
    </Component>
  );
}
