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

**Status**: Complete

---

## Stage 3: Extract `SearchBoxController` from `search-box.ts`

**Goal**: Separate logic from the web component shell so tests can instantiate
the behavior class directly — eliminating all `globalThis` bridging and the
`connectedCallback()` hack.

**Changes to `search-box.ts`**:
1. Extract a `SearchBoxController` class with constructor
   `(root: Element, win: Window)`.
2. Move all logic from `connectedCallback()` into `SearchBoxController.init()`:
   - Replace every bare `document` reference with `this.win.document`
   - Replace every `globalThis` reference with `this.win`
   - Replace `navigator` with `this.win.navigator`
3. `SearchBoxController.destroy()` handles listener cleanup (currently in
   `disconnectedCallback()`).
4. Export `SearchBoxController`.
5. `SearchBox` web component becomes a thin shell:
   ```ts
   class SearchBox extends HTMLElement {
     private controller: SearchBoxController | null = null;

     connectedCallback(): void {
       if (this.controller) return;
       this.controller = new SearchBoxController(this, window);
       this.controller.init();
     }

     disconnectedCallback(): void {
       this.controller?.destroy();
       this.controller = null;
     }
   }
   ```
   Note: the `initialized` guard is replaced by `if (this.controller) return;`
   — same effect, but the controller instance itself is the flag.
6. Add an `AIDEV-NOTE` at the top of the file explaining the two-class split:
   tests instantiate `SearchBoxController` directly with `dom.window` to avoid
   bridging JSDOM globals onto Node's `globalThis`.

**Changes to `search-box.spec.ts`**:
1. Remove all `globalThis.*` assignments from both `beforeEach` blocks.
2. Keep only `globalThis.requestAnimationFrame = window.requestAnimationFrame`
   — `userEvent` needs it.
3. Rename `initSearchBox` → `initController`, updating the body and return type:
   ```ts
   async function initController(document: Document, win: Window): Promise<SearchBoxController> {
     const { SearchBoxController } = await import("./search-box.ts");
     const root = document.querySelector("search-box")!;
     const controller = new SearchBoxController(root, win);
     controller.init();
     return controller;
   }
   ```
4. In each outer `describe` block, declare `let controller: SearchBoxController`
   and assign it from the `initController` return value in `beforeEach`.
5. At every `initController` call site, cast the jsdom window:
   `initController(document, window as unknown as Window)`.
6. Rewrite the Mac UA test using a nested `describe`/`beforeEach`:
   - Outer `beforeEach` runs first (sets up DOM, calls `initController`, stores
     the result in `controller`).
   - Nested `beforeEach` inside `describe("on Mac")`:
     1. Calls `controller.destroy()` to remove listeners registered by the
        outer `beforeEach`.
     2. Sets the Mac userAgent on the window:
        `Object.defineProperty(window.navigator, "userAgent",
        { configurable: true, value: "…Mac…" })`.
     3. Re-calls `await initController(document, window as unknown as Window)`
        and overwrites `controller`.
   - `it("sets Mac keyboard shortcut")` becomes a plain assertion — no manual
     element/flag access needed.

**Success criteria**:
- `npm test` passes
- No `globalThis` assignments remain except `requestAnimationFrame`
- `search-box.ts` exports `SearchBoxController`
- `initController` replaces `initSearchBox` and returns `SearchBoxController`
- Mac UA test uses nested `describe`/`beforeEach`; no direct flag/property access on the element

**Status**: Complete

---

## Stage 4: Extract shared `createDom()` setup helper

**Goal**: Eliminate the ~80-line `beforeEach` duplication between the two
`describe` blocks.

**Changes**:
1. Extract a `createDom()` async function (see SPEC.md) that covers everything
   shared: Astro render → JSDOM → `requestAnimationFrame` → dialog mocks →
   `vi.stubGlobal` → `vi.resetModules` → `initController` → cleanup fn.
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
   (Vitest only hoists top-level calls). This is correct because `initController`
   uses a dynamic `import()`, which consults the mock registry at call time.
4. Remove the direct `window.close()` call from both `afterEach` blocks — it is
   now part of the `cleanup()` function returned by `createDom()`.

**Success criteria**:
- `npm test` passes
- Neither `beforeEach` repeats DOM/JSDOM setup inline
- The only differences between the two `beforeEach` blocks are: fake timers,
  mock injection, and `userEvent` init

**Status**: Complete
