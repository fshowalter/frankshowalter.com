# Search Web Component Implementation Plan

See `SPEC.md` for full specification and target architecture.

Each stage must leave `npm test`, `npm run lint`, and `npm run check` passing before moving on.

---

## Stage 1: Create `<search-box>` Element and Move Markup

**Goal**: Wrap the existing button + dialog in a `<search-box>` custom element in
`AstroPageShell.astro`. Create `search-box.ts` with a minimal `connectedCallback()` that
delegates to the existing `search-modal.ts` logic. Everything works identically — this is
a structural move only.

**Steps**:
1. In `AstroPageShell.astro`, wrap the search button (currently in `Backdrop.tsx` or the
   page shell) and the `<dialog>` inside `<search-box>...</search-box>`
2. Create `src/astro/search-box.ts` with a `SearchBox` class extending `HTMLElement` that
   calls `connectedCallback()` to run the existing `initPageFind()` logic from
   `search-modal.ts` (import and delegate — no logic changes yet)
3. Register with `customElements.define("search-box", SearchBox)`
4. Update `AstroPageShell.astro` script tag: `search-modal.ts` → `search-box.ts`
5. Update test imports to match
6. Run `npm run test:update` to regenerate HTML snapshots

**Success Criteria**:
- `<search-box>` wraps the dialog in the rendered HTML
- All existing tests pass (import path updated)
- No behavior changes

**Status**: Not Started

---

## Stage 2: Move Modal Logic into the Component

**Goal**: Move all modal open/close, keyboard shortcut, and outside-click logic from
`search-modal.ts` into `SearchBox.connectedCallback()`. Delete `search-modal.ts`.

**Steps**:
1. Move `initPageFind()` body into `SearchBox.connectedCallback()` — element lookups use
   `this.querySelector()` instead of `document.querySelector()`
2. Replace `data-open-modal` / `data-close-modal` attribute selectors with `data-open-search`
   / `data-close-search` (scoped to the component)
3. Move the Cmd+K / Ctrl+K global keydown listener and Mac keyboard shortcut detection
4. Move the click-outside and link-click close logic
5. Lazy-load Pagefind on first open — loading flag is `this.pagefindLoading` (instance state)
6. Move `resolveSearchElements()` inline — elements resolved in `connectedCallback()` via
   `this.querySelector()` with `data-*` attributes instead of IDs
7. Delete `search-modal.ts`
8. Update `SearchUI` constructor call to receive elements from the component
9. Update tests: remove `initPageFind()` import, test via the custom element

**Success Criteria**:
- `search-modal.ts` is deleted
- No `initPageFind` or `initSearch` functions exist
- `SearchBox.connectedCallback()` handles all modal behavior
- All modal tests pass

**Status**: Not Started

---

## Stage 3: Merge `SearchUI` into Component and Add Templates

**Goal**: Absorb `SearchUI` into `SearchBox`. Move all dynamic HTML from JS template strings
into `<template>` elements in `AstroPageShell.astro`. Delete `search-ui.ts`.

**Steps**:
1. Add `<template>` elements to `AstroPageShell.astro` inside `<search-box>`:
   - `<template data-result-item>` — single result `<li>` with `data-field` attributes for
     link, title, excerpt, image
   - `<template data-skeleton>` — loading skeleton item
   - `<template data-empty>` — empty results message
   - `<template data-error>` — error message with `data-field="message"`
2. In `SearchBox`, cache template refs in `connectedCallback()`:
   `this.resultTemplate = this.querySelector<HTMLTemplateElement>("template[data-result-item]")!`
3. Move `SearchUI` methods into `SearchBox`:
   - `handleSearch()`, `loadMoreResults()`, `clearSearch()`
   - `render()` switch and per-state methods
   - `setupEventListeners()` for input, clear, load-more, Enter key
4. Replace `renderResultItem(doc)` (returns HTML string) with `cloneResult(doc)` (clones
   template, fills `data-field` elements, returns `DocumentFragment`)
5. Replace `renderLoadingSkeleton()` (returns HTML string) with template cloning
6. Replace `renderEmpty()` / `renderError()` innerHTML assignments with template cloning
7. Rename element IDs in `AstroPageShell.astro` from `search-*` to `search-box-*` prefix.
   Update `aria-describedby` and `aria-controls` to match. Component looks up elements via
   `this.querySelector("#search-box-*")`
8. Move `SearchState` type and `formatCounter()` into `search-box.ts`
9. Delete `search-ui.ts` and `search-ui.spec.ts` (move `formatCounter` tests to
   `search-box.spec.ts`)
10. Update test mock strategy: mock `pagefind-api.ts` import instead of `search-ui.ts`

**Success Criteria**:
- `search-ui.ts` is deleted
- No HTML template strings in JS (no backtick HTML in `search-box.ts`)
- All dynamic content rendered via `<template>` cloning
- All search functionality tests pass
- `formatCounter` unit tests pass

**Status**: Not Started

---

## Stage 4: Final Cleanup

**Goal**: Verify all quality gates, remove dead code, clean up planning documents.

**Steps**:
1. Run `npm run knip` — remove any exports that are now dead
2. Remove the iOS Safari `document.body.addEventListener("click", () => {})` workaround if
   it is no longer needed (test on iOS Safari)
3. Add `AIDEV-NOTE` comments:
   - In `search-box.ts`: note the light DOM pattern and why no Shadow DOM
   - In `AstroPageShell.astro`: note that `<template>` classes are scanned by Tailwind
4. Confirm `disconnectedCallback()` cleans up global listeners (Cmd+K keydown)
5. Run full quality check: `npm test`, `npm run lint`, `npm run format`, `npm run check`,
   `npm run knip`, `npm run lint:spelling`
6. Delete `SPEC.md`, `IMPLEMENTATION_PLAN.md`, and `progress.txt`

**Success Criteria**:
- Only two search files remain: `search-box.ts` and `pagefind-api.ts`
- All quality gates pass with no suppressions or rule changes
- Planning documents removed

**Status**: Not Started
