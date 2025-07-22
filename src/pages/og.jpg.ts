import type { APIRoute } from "astro";

import { getOpenGraphBackdropAsBase64String } from "~/api/backdrops";
import { OpenGraphImage } from "~/components/OpenGraphImage";
import { componentToImage } from "~/utils/componentToImage";

export const GET: APIRoute = async function get() {
  const jpeg = await componentToImage(
    OpenGraphImage({
      backdrop: await getOpenGraphBackdropAsBase64String("home"),
      sectionHead: "",
      title: "Frank Showalter",
    }),
  );

  return new Response(jpeg, {
    headers: {
      "Content-Type": "image/jpg",
    },
  });
};
