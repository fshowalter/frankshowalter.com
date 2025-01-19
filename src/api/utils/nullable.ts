import { z } from "zod";

export function nullableNumber() {
  return z.nullable(z.number()).transform((data) => data ?? undefined);
}

export function nullableString() {
  return z.nullable(z.string()).transform((data) => data ?? undefined);
}
