import { getBackdropImageProps } from "~/api/backdrops";
import { BackdropImageConfig } from "~/components/Backdrop";

import type { Props } from "./404";

export async function getProps({
  deck,
  title,
}: {
  deck: string;
  title: string;
}): Promise<Props> {
  return {
    backdropImageProps: await getBackdropImageProps(
      "home",
      BackdropImageConfig,
    ),
    deck,
    title,
  };
}
