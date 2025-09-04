import type { ImageProps } from "~/api/images";

export function UpdatePoster({
  imageProps,
}: {
  imageProps: ImageProps;
}): React.JSX.Element {
  return (
    <div
      className={`
        relative w-1/4 max-w-[250px] shrink-0 self-start overflow-hidden
        rounded-sm shadow-all
        after:absolute after:top-0 after:left-0 after:size-full after:bg-default
        after:opacity-15 after:transition-all after:duration-500
        group-has-[a:hover]/list-item:after:opacity-0
        tablet:w-full
      `}
    >
      <img
        {...imageProps}
        alt=""
        className={`
          aspect-[1/1.5] w-full transform-gpu object-cover transition-transform
          duration-500
          group-has-[a:hover]/list-item:scale-110
        `}
        decoding="async"
        loading="lazy"
      />
    </div>
  );
}
