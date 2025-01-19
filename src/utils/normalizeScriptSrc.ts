export function normalizeScriptSrc(result: string) {
  return result.replaceAll(
    /(src=")(.*)(\/src\/layouts\/Layout\.astro\?astro&type=script&index=0&lang\.ts")/g,
    "$1$3",
  );
}
