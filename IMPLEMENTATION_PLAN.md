# Search Refactor Implementation Plan

See `SPEC.md` for full specification and target architecture.

Each stage must leave `npm test`, `npm run lint`, and `npm run check` passing before moving on.

---

## Stage 1: File Reorganization and Backdrop Simplification

**Goal**: Split the two classes in `search-ui.ts` into separate files, rename `search.ts` to
`search-modal.ts`, and replace the `data-search-modal-open` body attribute with native
`dialog::backdrop` styling. No search logic changes — all tests pass.

**Steps**:
1. Create `src/astro/pagefind-api.ts` — move the `SearchAPI` class (renamed to `PagefindAPI`)
   and all Pagefind types out of `search-ui.ts`. Rename the private `PagefindAPI` type (the raw
   library interface) to `Pagefind` to avoid a name collision with the new class. Move types:
   `PagefindDocument`, `PagefindResult`, `PagefindSearchOptions`, `PagefindSearchResults`,
   `PagefindAnchor`, `PagefindSubResult`, `WeightedLocation`
2. Update `search-ui.ts` to import from `./pagefind-api`
3. Rename `search.ts` → `search-modal.ts`
4. Update the `<script>` tag in `AstroPageShell.astro` (line 250): `search.ts` → `search-modal.ts`
5. Update `AstroPageShell.spec.ts` import: `"./search.ts"` → `"./search-modal.ts"`
6. In `AstroPageShell.astro`, move the blur onto `dialog::backdrop` by adding
   `backdrop:backdrop-blur-xs` to the dialog's class. Remove the four
   `data-search-modal-open:before:*` classes and `data-search-modal-open:overflow-hidden`
   from `<body>` — the `overflow-hidden` is redundant since `showModal()` puts the dialog in
   the top layer and modern browsers apply scroll-lock natively
7. Remove both `document.body.toggleAttribute("data-search-modal-open", ...)` calls from
   `search-modal.ts` (currently `search.ts` lines 75 and 100)
8. Remove `delete document.body.dataset.searchModalOpen` from the test cleanup in
   `AstroPageShell.spec.ts` (currently line 105)
9. Run `npm run test:update` to regenerate HTML snapshots

**Success Criteria**:
- `data-search-modal-open` does not appear anywhere in `src/`
- `npm test` passes
- `npm run knip` shows no unused exports
- `npm run lint` passes

**Status**: Complete

---

## Stage 2: Dependency Injection for Elements

**Goal**: `SearchUI` accepts a `SearchElements` object as a constructor parameter instead of
querying the DOM internally. Element IDs exist in exactly one JS location: `search-modal.ts`.

**Steps**:
1. Add `resolveSearchElements(dialog: HTMLDialogElement): SearchElements` to `search-modal.ts`
   — moves all element ID queries here (the 7 IDs from `setupElements()`)
2. Change `SearchUI` constructor: `constructor(elements: SearchElements, api?: PagefindAPI)`
3. Remove `setupElements()` from `SearchUI`; update `init()` to skip the element-resolution
   try/catch (elements are guaranteed by the caller)
4. In `search-modal.ts`, call `resolveSearchElements(dialog)` before constructing `SearchUI`,
   and pass elements in: `new SearchUI(elements)`
5. Update the test mock in `AstroPageShell.spec.ts`: the `SearchUI` subclass now receives
   `elements` as its first constructor argument and should forward them to `super`:
   ```ts
   SearchUI: class extends actual.SearchUI {
     constructor(elements: SearchElements) {
       super(elements, mockSearchAPI as PagefindAPI);
     }
   }
   ```

6. Rename all element IDs in `AstroPageShell.astro` from the `pagefind-` prefix to `search-`
   (`pagefind-search-input` → `search-input`, `pagefind-clear-button` → `search-clear-button`,
   `pagefind-results-counter` → `search-results-counter`, `pagefind-results` → `search-results`,
   `pagefind-results-wrapper` → `search-results-wrapper`, `pagefind-load-more-wrapper` →
   `search-load-more-wrapper`, `pagefind-load-more` → `search-load-more`). Update
   `aria-describedby` and `aria-controls` attributes in the same pass.
7. Update `resolveSearchElements` in `search-modal.ts` to use the new `search-*` IDs
8. Run `npm run test:update` to regenerate HTML snapshots

**Success Criteria**:
- No `pagefind-` element ID strings anywhere in `src/` (grep check); `data-pagefind-weight`
  and `/pagefind-movielog` / `/pagefind-booklog` URLs are unaffected
- `setupElements()` method does not exist
- `npm test` passes

**Status**: Complete

---

## Stage 3: Discriminated State Union and Render Dispatch

**Goal**: Replace the flat `SearchState` object with a discriminated union. Split the branchy
`renderResults()` method into one small dispatch method and one focused render method per state.

**Steps**:
1. Define the discriminated union in `search-ui.ts` (replacing the existing `SearchState` type):
   ```ts
   type SearchState =
     | { kind: "idle" }
     | { kind: "loading"; query: string }
     | { kind: "results"; query: string; results: PagefindDocument[]; total: number; allResults: PagefindResult[]; visibleCount: number }
     | { kind: "empty"; query: string }
     | { kind: "error"; message: string };
   ```
2. Remove `filters`, `selectedFilters`, `hasSearched`, `isSearching`, `visibleResults`, and
   `totalResults` from state (all folded into the union variants above)
3. Remove `updateState()` — state transitions replace partial merges:
   `this.state = { kind: "loading", query }` etc.
4. Move `currentSearchResults` (the full Pagefind result array) into the `"results"` state
   variant as `allResults`; remove the class-level field
5. Rename `renderResults()` → `render()` and implement as a `switch` with no inline HTML
6. Extract `renderIdle()`, `renderLoading()`, `renderResultList()`, `renderEmpty()`,
   `renderError()` — each contains only the HTML for that state
7. Move load-more visibility logic into `renderResultList()`
8. Move counter text logic into `renderResultList()` and `renderEmpty()`; extract
   `formatCounter(total: number, query: string): string` as a pure function (testable in isolation)
9. Remove `getInitialState()` — replaced by `{ kind: "idle" }` literal
10. Update all callers of the old state shape throughout `SearchUI`

**Success Criteria**:
- `render()` contains only a `switch` — no inline HTML, no conditionals
- Each per-state render method is self-contained and ≤ ~25 lines
- `formatCounter` is a pure exported function with a unit test
- `npm test` passes

**Status**: Complete

---

## Stage 4: Simplify Cancellation and Consolidate Event Handling

**Goal**: Replace `AbortController` with a generation counter. Move the Enter key handler into
`SearchUI`. Remove the clear button ID special-case from `search-modal.ts`.

**Steps**:
1. Add `private searchGeneration = 0` to `SearchUI`
2. In `handleSearch()`, increment `searchGeneration` at the start and capture the value;
   after `await this.api.search()`, return early if the captured value no longer matches
3. Remove `abortController` field and all `AbortController` usage from `SearchUI`
4. Remove `signal` parameter from `PagefindAPI.search()` and all abort-related logic from
   `pagefind-api.ts`
5. Move the Enter key handler (currently `search-modal.ts` lines 114–121) into
   `SearchUI.setupEventListeners()`
6. In `SearchUI.setupEventListeners()`, add `event.stopPropagation()` to the clear button
   click handler so it never reaches the modal's global click handler
7. Remove the clear button ID check (lines 42–51 of current `search-modal.ts`) from the
   `onClick` handler — it is now unnecessary
8. Add a test for stale generation: trigger two searches in quick succession, resolve the
   first after the second; assert only the second search's results are applied

**Success Criteria**:
- No `AbortController` or `AbortSignal` in `search-ui.ts` or `pagefind-api.ts`
- `SearchAPI` does not appear anywhere in the codebase (fully renamed to `PagefindAPI`)
- No element ID strings in `search-modal.ts` `onClick` handler
- Stale search test passes
- `npm test` passes

**Status**: Not Started

---

## Stage 5: Final Cleanup

**Goal**: Verify all quality gates pass, update anchor comments, and remove planning documents.

**Steps**:
1. Run `npm run knip` — remove any exports that are now dead after the refactor
2. Update `AIDEV-NOTE` comments to reflect the new architecture; remove the note at the old
   `setupElements()` site (it no longer exists); add a note in `search-modal.ts` marking
   `resolveSearchElements` as the single source of truth for element IDs
3. Confirm `initPageFind` wrapper in `search-modal.ts` can be collapsed into `initSearch`
   (currently `initSearch` just calls `initPageFind` — remove the indirection)
4. Run full quality check: `npm test`, `npm run lint`, `npm run format`, `npm run check`,
   `npm run knip`, `npm run lint:spelling`
5. Delete `SPEC.md` and `IMPLEMENTATION_PLAN.md`

**Success Criteria**:
- All quality gates pass with no suppressions or rule changes
- No `AIDEV-TODO` items without issue numbers
- Planning documents removed

**Status**: Not Started
