import type { ImageProps } from "~/api/images";

/**
 * Displays a book cover image with decorative spine and shadow effects.
 * Includes hover state transitions for interactive lists.
 */
export function UpdateCover({
  className,
  imageProps,
}: {
  className?: string;
  imageProps: ImageProps;
}): React.JSX.Element {
  return (
    <div
      className={`
        relative w-1/4 max-w-[250px] shrink-0 self-start overflow-hidden
        rounded-sm shadow-all transition-transform
        after:absolute after:top-0 after:left-0 after:z-10 after:size-full
        after:bg-default after:opacity-15 after:transition-opacity
        group-has-[a:hover]/list-item:after:opacity-0
      `}
    >
      <div
        className={`
          relative
          after:absolute after:top-0 after:left-0 after:z-10 after:block
          after:size-full after:rounded-[2.5px]
          after:bg-[url(/assets/spine-dark.png)] after:bg-size-[100%_100%]
          after:mix-blend-multiply
        `}
      >
        <div
          className={`
            relative z-10
            before:absolute before:top-0 before:left-0 before:z-10 before:block
            before:size-full before:rounded-[2.5px]
            before:bg-[url(/assets/spine-light.png)] before:bg-size-[100%_100%]
            after:absolute after:top-0 after:left-0 after:block after:size-full
            after:rounded-[2.5px] after:bg-[url(/assets/spot.png)]
            after:bg-size-[100%_100%] after:mix-blend-soft-light
          `}
        >
          <img
            {...imageProps}
            alt=""
            className={`
              transform-gpu rounded-[2.5px] bg-default shadow-sm
              transition-transform duration-500
              group-has-[a:hover]/list-item:scale-110
              @min-[160px]:shadow-lg
            `}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
