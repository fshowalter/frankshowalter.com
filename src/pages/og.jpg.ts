import type { APIRoute } from "astro";

import { createHhomeOpenGraphImageResponse } from "~/features/home/createHomeOpenGraphImageResponse";

export const GET: APIRoute = async function get() {
  return createHhomeOpenGraphImageResponse();
};
