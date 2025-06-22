export function normalizeSrcs(result: string) {
  const normalizedScriptSrcs = result.replaceAll(
    /(src=")(.*)(\/src\/layouts\/Layout\.astro\?astro&type=script&index=0&lang\.ts")/g,
    "$1$3",
  );

  return normalizedScriptSrcs.replaceAll(
    /(src: url\("\/_astro\/fonts\/)(.*)(.woff2"\) format\("woff2"\);)/g,
    "$1test-hash$3",
  );
}
