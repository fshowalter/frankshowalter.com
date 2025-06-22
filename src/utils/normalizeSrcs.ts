export function normalizeSrcs(result: string) {
  const normalizedScriptSrcs = result.replaceAll(
    /(src=")(.*)(\/src\/layouts\/Layout\.astro\?astro&type=script&index=0&lang\.ts")/g,
    "$1$3",
  );

  return normalizedScriptSrcs.replaceAll(
    /("\/_astro\/fonts\/)[a-f0-9]+(.woff2")/g,
    "$1test-hash$2",
  );
}
