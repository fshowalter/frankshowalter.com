import React, { type JSX } from "react";

import type { ImageProps } from "~/api/images";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  decoding: "async" | "auto" | "sync";
  height: number;
  imageProps: ImageProps | undefined;
  loading: "eager" | "lazy";
  width: number;
};

export function HomeImage({
  decoding = "async",
  imageProps,
  loading = "lazy",
  ...rest
}: Props): JSX.Element {
  return (
    <img
      {...imageProps}
      {...rest}
      alt=""
      decoding={decoding}
      loading={loading}
      style={{ aspectRatio: "0.66666667" }}
    />
  );
}
