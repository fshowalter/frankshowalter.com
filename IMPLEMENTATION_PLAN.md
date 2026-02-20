# IMPLEMENTATION PLAN: Migrate Booklog & Movielog to Astro Content Collections

See `SPEC.md` for full context and architecture decisions.

---

## Stage 1: Content Config

**Goal**: Define the two Astro content collections. The existing API layer still works in
parallel; nothing is broken yet.

**Steps**:
1. Grep to confirm `getDataFile`, `booklogUpdates`, `movielogUpdates`, and `UpdateSchema`
   have no callers beyond `booklog.ts`, `movielog.ts`, and `getHomeProps.ts`.
2. Create `src/content.config.ts`:
   - Move `UpdateSchema` from `src/api/UpdateSchema.ts` (keep the original for now).
   - Define `BooklogSchema` and `MovielogSchema` using `.extend()`.
   - Export `BooklogData` and `MovielogData` types.
   - Define `booklog` and `movielog` collections with inline loaders using the
     selective-removal sync pattern (`store.keys()` / `store.delete()`).
3. Run `npm run check` — Astro type-checking should pass with both the old API layer and the
   new collections coexisting.
4. Run `npm run build` — verify the collections load and the site builds correctly.
5. Temporarily log `getCollection('booklog')` output in `index.astro` to confirm entries are
   present and correctly shaped; remove the log afterward.

**Success Criteria**:
- `npm run build` and `npm run check` pass.
- Collections return the expected entries.

**Status**: Not Started

---

## Stage 2: Update `getHomeProps` and `index.astro`

**Goal**: Wire `getHomeProps` to accept data instead of fetching it, and update `index.astro`
to supply that data from `getCollection`.

**Steps**:
1. Update `src/features/home/getHomeProps.ts`:
   - Import `BooklogData` and `MovielogData` from `~/content.config`.
   - Change signature to
     `getHomeProps(booklogEntries: BooklogData[], movielogEntries: MovielogData[])`.
   - Remove the `booklogUpdates()` and `movielogUpdates()` calls.
2. Update `src/pages/index.astro`:
   - Add `import { getCollection } from 'astro:content'`.
   - Replace the `getHomeProps()` call with:
     ```ts
     const booklogEntries = (await getCollection('booklog')).map((e) => e.data);
     const movielogEntries = (await getCollection('movielog')).map((e) => e.data);
     const homeProps = await getHomeProps(booklogEntries, movielogEntries);
     ```
3. Run `npm run check` and `npm run build`.
4. Run `npm run dev` and verify the home page renders correctly with real data.

**Success Criteria**:
- `npm run build` and `npm run check` pass.
- Home page renders correctly in dev.

**Status**: Not Started

---

## Stage 3: New `Home` Component Tests and Fixtures

**Goal**: Replace the page snapshot test with focused component tests.

**Steps**:
1. Inspect `src/api/fixtures/booklog.json` and `movielog.json` to get the fixture slugs.
   Verify each slug has a corresponding file in `content/assets/covers/` and
   `content/assets/stills/`.
2. Create `src/fixtures/booklog.ts` — export `booklogFixtures: BooklogData[]` as a typed
   TypeScript array using the confirmed slugs.
3. Create `src/fixtures/movielog.ts` — export `movielogFixtures: MovielogData[]` likewise.
   Include at least 5 entries to exercise the splash + grid layout logic in `getHomeProps`.
4. Add a new project to `vitest.config.ts`:
   ```ts
   {
     extends: true,
     test: {
       environment: 'jsdom',
       include: ['src/features/**/*.spec.tsx'],
       name: 'features-jsdom',
     },
   }
   ```
5. Create `src/features/home/Home.spec.tsx`:
   - Call `getHomeProps(booklogFixtures, movielogFixtures)`.
   - Render `<Home {...props} />` with `@testing-library/react`.
   - Assert: correct number of movie cards, correct number of book cards, first fixture
     title appears in the document, first movie entry gets splash treatment.
6. Run `npm test` — new tests should pass.

**Success Criteria**:
- `npm test` passes.
- Assertions in `Home.spec.tsx` are meaningful (not just "it rendered something").

**Status**: Not Started

---

## Stage 4: Delete Old API Layer and Snapshot Test

**Goal**: Remove everything the new approach replaces.

**Steps**:
1. Delete `src/pages/_index.spec.ts`.
2. Delete `src/pages/__snapshots__/index.html`.
3. Delete `src/api/booklog.ts`.
4. Delete `src/api/movielog.ts`.
5. Delete `src/api/UpdateSchema.ts`.
6. Delete `src/api/fixtures/booklog.json`.
7. Delete `src/api/fixtures/movielog.json`.
8. Delete `src/api/utils/__mocks__/getDataFile.ts`.
9. If `getDataFile` has no remaining callers, delete `src/api/utils/getDataFile.ts`.
10. Remove `vi.mock('src/api/utils/getDataFile')` from `setupTests.ts`.
11. Run `npm run check`, `npm test`, and `npm run build` — all must pass.
12. Run `npm run knip` — confirm no orphaned exports or unused dependencies.

**Success Criteria**:
- All checks, tests, and build pass with no references to deleted files.
- `knip` reports no new issues.

**Status**: Not Started

---

## Stage 5: Evaluate HMR Plugin

**Goal**: Determine whether the custom `contentHmr` plugin in `astro.config.ts` is still
needed.

**Steps**:
1. Run `npm run dev`.
2. Edit `content/data/booklog.json` (add/remove an entry).
3. Observe whether the page reloads automatically without the custom plugin.
4. If Astro's content layer handles it natively, remove the `contentHmr` function and its
   registration from `astro.config.ts`.
5. Run `npm run build` to confirm nothing broke.

**Success Criteria**:
- Dev HMR works correctly (with or without the custom plugin).
- `astro.config.ts` is no more complex than necessary.

**Status**: Not Started
