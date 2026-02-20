# SPEC: Migrate Booklog & Movielog to Astro Content Collections

## Problem

`src/api/booklog.ts` and `src/api/movielog.ts` read JSON files directly via `fs.readFile`,
resolving paths through `getDataFile()`. Tests work by mocking `getDataFile` to redirect to
fixture JSON files, then asserting on full-page HTML snapshots. This has several weaknesses:

- The `getDataFile` mock is an infrastructure-level shim rather than a seam at the domain
  boundary.
- Full-page HTML snapshots are slow, fragile to unrelated changes (script hashes, whitespace),
  and test rendering infrastructure more than application logic.
- There is no caching or incremental-load support; every build re-reads both files from scratch.

## Goals

1. Replace direct JSON reads with Astro Content Collections using custom inline loaders defined
   in `src/content.config.ts`.
2. Use `slug` as the collection entry `id`. On each load, remove any store entries whose IDs
   are not present in the current JSON, so out-of-band updates (entries added or removed
   externally) are always reflected correctly without wiping the entire store.
3. Make `getHomeProps` a pure transformation function that accepts pre-fetched data as
   parameters, removing its implicit dependency on the file system.
4. Replace the full-page HTML snapshot test with focused `Home` component tests that call
   `getHomeProps` with typed TypeScript fixture data and assert on rendered component output.

## Non-Goals

- Changing how images are loaded (`covers.ts` / `stills.ts` are unchanged).
- Adding pagination, filtering, or search to the collections.
- Migrating any other data source at this time.

---

## Architecture

### Content Config (`src/content.config.ts`)

All Zod schema definitions, collection definitions, inline loaders, and exported types live
here. `UpdateSchema` moves from `src/api/UpdateSchema.ts` into this file — it's all schema
code and belongs together.

```ts
import { defineCollection } from 'astro:content';
import { promises as fs } from 'node:fs';
import { z } from 'zod';
import { getDataFile } from '~/api/utils/getDataFile';

const UpdateSchema = z.object({
  date: z.coerce.date(),
  excerpt: z.string(),
  slug: z.string(),
  stars: z.number(),
  title: z.string(),
});

export const BooklogSchema = UpdateSchema.extend({
  authors: z.array(z.string()),
  kind: z.string(),
  workYear: z.string(),
});

export const MovielogSchema = UpdateSchema.extend({
  genres: z.array(z.string()),
  year: z.string(),
});

export type BooklogData = z.infer<typeof BooklogSchema>;
export type MovielogData = z.infer<typeof MovielogSchema>;

const booklog = defineCollection({
  loader: {
    name: 'booklog-loader',
    load: async ({ store }) => {
      const data = JSON.parse(await fs.readFile(getDataFile('booklog.json'), 'utf8'));
      const newIds = new Set(data.map((item) => item.slug));
      for (const id of store.keys()) {
        if (!newIds.has(id)) store.delete(id);
      }
      for (const item of data) {
        store.set({ id: item.slug, data: item });
      }
    },
  },
  schema: BooklogSchema,
});

// movielog follows the same pattern
export const collections = { booklog, movielog };
```

The selective removal approach (rather than `store.clear()`) allows Astro to skip
re-processing unchanged entries if it detects matching content digests.

The `image` field present in the JSON is intentionally excluded from both schemas — it is not
consumed by application code (images are resolved via slug glob patterns in
`covers.ts`/`stills.ts`), and Zod strips unknown fields during collection validation.

### Updated `getHomeProps`

Accepts pre-fetched data rather than fetching it internally. Types are imported from
`~/content.config`:

```ts
import type { BooklogData, MovielogData } from '~/content.config';

export async function getHomeProps(
  booklogEntries: BooklogData[],
  movielogEntries: MovielogData[],
): Promise<HomeProps>
```

The body is unchanged — only the signature and the removal of the internal
`booklogUpdates()` / `movielogUpdates()` calls change.

### Updated `index.astro`

Becomes the sole caller of `getCollection`, passing the mapped `.data` arrays:

```astro
---
import { getCollection } from 'astro:content';
const booklogEntries = (await getCollection('booklog')).map((e) => e.data);
const movielogEntries = (await getCollection('movielog')).map((e) => e.data);
const homeProps = await getHomeProps(booklogEntries, movielogEntries);
---
```

---

## Testing Strategy

### Fixtures (`src/fixtures/`)

A central fixture directory shared across all feature tests — avoids duplication as new
features are added:

```
src/fixtures/
  booklog.ts    # BooklogData[]
  movielog.ts   # MovielogData[]
```

Fixture slugs must correspond to real files in `content/assets/covers/` and
`content/assets/stills/`. No image mocking is needed: `getImage` from `astro:assets` works in
the Vitest node environment without AstroContainer.

The existing fixture slugs in `src/api/fixtures/booklog.json` and `movielog.json` already have
corresponding image files (the current page snapshot test proves this), so those slugs can be
reused when authoring the TypeScript fixtures.

### Remove

- `src/pages/_index.spec.ts` and `src/pages/__snapshots__/index.html` — deleted entirely.
  `Home.spec.tsx` replaces the coverage they provided.
- `vi.mock('src/api/utils/getDataFile')` from `setupTests.ts`
- `src/api/utils/__mocks__/getDataFile.ts`
- `src/api/fixtures/booklog.json` and `src/api/fixtures/movielog.json`

### Add: `Home` Component Tests (`src/features/home/Home.spec.tsx`)

Co-located with `Home.tsx`, following the same naming convention as `_index.spec.ts`:

1. Calls `getHomeProps(booklogFixtures, movielogFixtures)` directly.
2. Renders `<Home {...props} />` with React Testing Library (`@testing-library/react`).
3. Asserts on meaningful output: correct number of cards, expected titles present, correct
   grade values, first movie entry rendered as splash.

A new project entry in `vitest.config.ts` covers `src/features/**/*.spec.tsx` using the
`jsdom` environment. The project already has `@testing-library/react` as a dependency.

---

## Files Changed

| Action | File |
|--------|------|
| Create | `src/content.config.ts` |
| Create | `src/fixtures/booklog.ts` |
| Create | `src/fixtures/movielog.ts` |
| Create | `src/features/home/Home.spec.tsx` |
| Modify | `src/features/home/getHomeProps.ts` (accept params, remove internal fetching) |
| Modify | `src/pages/index.astro` (call `getCollection`, pass `.data` to `getHomeProps`) |
| Modify | `setupTests.ts` (remove `getDataFile` mock) |
| Modify | `vitest.config.ts` (add jsdom project for `src/features/**/*.spec.tsx`) |
| Delete | `src/pages/_index.spec.ts` |
| Delete | `src/pages/__snapshots__/index.html` |
| Delete | `src/api/booklog.ts` |
| Delete | `src/api/movielog.ts` |
| Delete | `src/api/UpdateSchema.ts` (consolidated into `src/content.config.ts`) |
| Delete | `src/api/utils/getDataFile.ts` (after confirming no other callers) |
| Delete | `src/api/utils/__mocks__/getDataFile.ts` |
| Delete | `src/api/fixtures/booklog.json` |
| Delete | `src/api/fixtures/movielog.json` |

---

## Open Questions

1. **Other callers**: Confirm no file other than `getHomeProps.ts` calls `booklogUpdates()`,
   `movielogUpdates()`, or `getDataFile()`, and no file other than `booklog.ts`/`movielog.ts`
   imports from `UpdateSchema.ts`, before deleting those modules.

2. **HMR plugin**: The custom `contentHmr` plugin in `astro.config.ts` may become redundant
   once Astro's content layer watches collection source files natively. Evaluate after Stage 1.
