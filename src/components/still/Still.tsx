import type { StillImageProps } from "~/api/stills";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  className?: string;
  decoding: "async" | "auto" | "sync";
  height: number;
  imageProps: StillImageProps;
  loading: "eager" | "lazy";
  sizes: string;
  width: number;
};

/**
 * Renders a movie still image with responsive loading.
 * @param props - Component props
 * @param props.className - Additional CSS classes
 * @param props.decoding - Image decoding strategy
 * @param props.imageProps - Still image source and srcset
 * @param props.loading - Loading strategy ("eager" or "lazy")
 * @returns Responsive still image element
 */
export function Still({
  className,
  decoding,
  imageProps,
  loading,
  ...rest
}: Props): React.JSX.Element {
  return (
    <img
      {...imageProps}
      alt=""
      decoding={decoding}
      loading={loading}
      {...rest}
      className={`
        aspect-video
        ${className ?? ""}
      `}
    />
  );
}
