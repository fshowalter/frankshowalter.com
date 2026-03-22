import type { APIRoute } from "astro";

import { homeOpenGraphImageResponse } from "~/features/home/homeOpenGraphImageResponse";

export const GET: APIRoute = async function get() {
  return homeOpenGraphImageResponse();
};
