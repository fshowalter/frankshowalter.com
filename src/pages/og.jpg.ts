import type { APIRoute } from "astro";

import { getOpenGraphBackdropAsBase64String } from "~/api/backdrops";
import { HomeOpenGraphImage } from "~/features/home/HomeOpenGraphImage";
import { componentToImage } from "~/utils/componentToImage";

/**
 * API route handler for generating the Open Graph image.
 * Returns a JPEG image for social media sharing.
 */
export const GET: APIRoute = async function get() {
  const jpeg = await componentToImage(
    HomeOpenGraphImage({
      backdrop: await getOpenGraphBackdropAsBase64String("home"),
    }),
  );

  return new Response(jpeg, {
    headers: {
      "Content-Type": "image/jpg",
    },
  });
};
