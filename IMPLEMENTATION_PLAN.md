# Implementation Plan — Search Box Test Consolidation

See `SPEC.md` for the target state.

---

## Stage 1: Add singular "1 result" integration test

**Goal**: Plug the coverage gap for `formatCounter`'s singular branch before
the isolated unit tests are removed.

**Change**: In `AstroPageShell.spec.ts` → `describe("when searching")` →
`"clears results when user clears the input"`: add an assertion after the
results render (before the clear step) that `counter?.textContent` equals
`'1 result for "test"'`. The test already mocks exactly one result and waits
for it to render — only the counter assertion is missing. No new test needed.

**Success criteria**:
- `npm test` passes
- The singular counter string (`1 result for "…"`) is asserted somewhere in
  the integration suite

**Status**: Complete

---

## Stage 2: Consolidate files + rename fixture

**Goal**: `search-box.spec.ts` becomes the single test file. `AstroPageShell.spec.ts`
is deleted. `TestPage.astro` is renamed to match its purpose.

**Changes**:
1. Rename `./fixtures/TestPage.astro` → `./fixtures/search-box-fixture.astro`
   (use `git mv` to preserve history).
2. Update the import path inside `AstroPageShell.spec.ts` to use the new name.
3. Copy both `describe` blocks (and all top-level helpers/imports) from
   `AstroPageShell.spec.ts` into `search-box.spec.ts`, replacing its current
   content.
4. Remove the three `formatCounter` unit tests and the `beforeAll` block.
5. Remove the outer `describe("AstroPageShell")` wrapper — flatten one level.
6. Delete `AstroPageShell.spec.ts`.

**Success criteria**:
- `npm test` passes
- No test references `AstroPageShell.spec.ts`
- `formatCounter` unit tests are gone; integration coverage from Stage 1
  covers all three branches

**Status**: Not Started

---

## Stage 3: Replace hand-curated globals with `installWindowGlobals`

**Goal**: Eliminate the brittle manually enumerated `globalThis.*` list.

**Changes**:
1. Add `installWindowGlobals(win: DOMWindow)` helper at the top of
   `search-box.spec.ts` (see SPEC.md for implementation). Key points:
   - **No `key in globalThis` guard** — always overwrite so each test's
     globals point to the current JSDOM instance, not the previous one.
   - **Force `configurable: true`** on every descriptor so subsequent calls
     can redefine properties that were installed in prior tests.
2. In both `beforeEach` blocks, replace the hand-curated assignments with
   `installWindowGlobals(window)`, keeping `requestAnimationFrame` as one
   explicit line **after** the call:
   ```ts
   installWindowGlobals(window);
   // requestAnimationFrame: explicit so userEvent always gets the JSDOM
   // version regardless of what Node or the blanket helper may have set.
   globalThis.requestAnimationFrame = window.requestAnimationFrame;
   ```
3. Remove the explicit `requestIdleCallback`, `HTMLInputElement`, and
   `HTMLButtonElement` assignments; the blanket helper covers them.
4. Add `vi.unstubAllGlobals()` to both `afterEach` blocks to clean up the
   `import.meta.env` stub that `createDom()` sets via `vi.stubGlobal`.

**Success criteria**:
- `npm test` passes
- The hand-curated list is gone; `installWindowGlobals` is the only place
  globals are installed (except the explicit `requestAnimationFrame` line)
- Both `afterEach` blocks call `vi.unstubAllGlobals()`

**Status**: Not Started

---

## Stage 4: Extract shared `createDom()` setup helper

**Goal**: Eliminate the ~80-line `beforeEach` duplication between the two
`describe` blocks.

**Changes**:
1. Extract a `createDom()` async function (see SPEC.md) that covers everything
   shared: Astro render → JSDOM → `installWindowGlobals` → explicit
   `requestAnimationFrame` → dialog mocks → `vi.stubGlobal` →
   `vi.resetModules` → `initSearchBox` → cleanup fn.
2. `describe("search modal")` `beforeEach`: call `createDom()`, assign
   destructured results.
3. `describe("search functionality")` `beforeEach`:
   ```ts
   vi.useFakeTimers({ shouldAdvanceTime: true });
   vi.mock("./pagefind-api", async () => { … });
   // vi.mock factories live in a separate registry that survives
   // vi.resetModules, so their relative order does not matter.
   const { document, window, cleanup } = await createDom();
   user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime, document });
   ```
   Note: `vi.mock` is called inside `beforeEach`, not at module top level
   (Vitest only hoists top-level calls). This is correct because `initSearchBox`
   uses a dynamic `import()`, which consults the mock registry at call time.

**Success criteria**:
- `npm test` passes
- Neither `beforeEach` repeats DOM/JSDOM setup inline
- The only differences between the two `beforeEach` blocks are: fake timers,
  mock injection, and `userEvent` init

**Status**: Not Started
