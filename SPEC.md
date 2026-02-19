# Search Refactor Specification

## Overview

The current search implementation (`search.ts`, `search-ui.ts`) has several structural problems:
file responsibilities are blurred, UI state is coupled to the DOM via magic string IDs scattered
across multiple files, `renderResults()` mixes state-dispatch with rendering, `PagefindAPI` and
`SearchUI` share a file with no cohesion, and event handling is split across files in ways that
require each file to know internals of the other.

This spec describes the target architecture. All existing user-visible behavior is preserved.

---

## Behavioral Requirements (Unchanged)

- Search modal opens via the Backdrop search button or ⌘K / Ctrl+K
- Modal closes on ESC button click, outside click, or ⌘K / Ctrl+K toggle
- Modal closes with a short delay when a result link is clicked (to allow navigation)
- `SearchUI` is lazy-loaded on first modal open
- Search input is debounced (150ms)
- Loading skeleton is shown while a search is in-flight
- Results counter shows "N results for 'query'" / "No results for 'query'"
- "Load more" button appears when results exceed page size (10); label shows count remaining
- Clear button resets the search without closing the modal
- Enter key in the search input blurs it (dismisses mobile keyboard)
- Screen reader announcements on result load and "load more"
- Pagefind indexes merged from `franksmovielog.com` and `franksbooklog.com`

---

## Target File Structure

| File | Responsibility |
|------|---------------|
| `src/astro/search-modal.ts` | Modal open/close, keyboard shortcuts, element resolution, lazy-loading `SearchUI` |
| `src/astro/search-ui.ts` | `SearchUI` class: state, event handling, rendering |
| `src/astro/pagefind-api.ts` | `PagefindAPI` class: Pagefind wrapper and index merging |

`AstroPageShell.astro` element IDs are renamed from the `pagefind-` prefix to `search-`:

| Before | After |
|--------|-------|
| `pagefind-search-input` | `search-input` |
| `pagefind-clear-button` | `search-clear-button` |
| `pagefind-results-counter` | `search-results-counter` |
| `pagefind-results` | `search-results` |
| `pagefind-results-wrapper` | `search-results-wrapper` |
| `pagefind-load-more-wrapper` | `search-load-more-wrapper` |
| `pagefind-load-more` | `search-load-more` |

The `aria-describedby` and `aria-controls` attributes in the HTML that reference these IDs are
updated in the same pass. `data-pagefind-weight` in `Backdrop.tsx` and the `/pagefind-movielog`
/ `/pagefind-booklog` index URLs are Pagefind semantics, not element IDs — they are unchanged.

After the refactor, IDs are referenced in **one JS location only**: `search-modal.ts`. The rename
is deferred until Stage 2 so it can be done as a single coordinated change across exactly two
files.

The private type currently named `PagefindAPI` in `search-ui.ts` (the raw imported library
interface) is renamed to `Pagefind`, consistent with the existing `Pagefind*` type prefix
convention (`PagefindResult`, `PagefindDocument`, etc.) and to avoid a name collision with the
new `PagefindAPI` class.

---

## Key Design Changes

### 1. `SearchUI` accepts elements via constructor (dependency injection)

Instead of `setupElements()` querying the DOM by ID, the caller resolves elements and passes
them in. Magic IDs disappear from `search-ui.ts` entirely.

```ts
// Before
const ui = new SearchUI(optionalApi);
await ui.init(); // internally calls setupElements() which queries by ID

// After
const elements = resolveSearchElements(dialog); // in search-modal.ts
const ui = new SearchUI(elements, optionalApi);
await ui.init(); // no DOM querying
```

`resolveSearchElements` lives in `search-modal.ts` and is the single location where element IDs
appear in JavaScript. If an ID changes in `AstroPageShell.astro`, there is exactly one JS location
to update.

### 2. Discriminated union for search state

The flat `SearchState` object permits invalid combinations (e.g., `isSearching: true` with
populated `results`). A discriminated union makes invalid states unrepresentable and makes
`render()` a straightforward switch.

```ts
type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "results"; query: string; results: PagefindDocument[]; total: number; allResults: PagefindResult[]; visibleCount: number }
  | { kind: "empty"; query: string }
  | { kind: "error"; message: string };
```

`filters` and `selectedFilters` are dropped — filtering is not implemented in the UI.

### 3. Per-state render methods

`renderResults()` dispatches to a dedicated method per state. No method contains branching on
state.

```ts
private render(): void {
  switch (this.state.kind) {
    case "idle":    return this.renderIdle();
    case "loading": return this.renderLoading();
    case "results": return this.renderResultList();
    case "empty":   return this.renderEmpty();
    case "error":   return this.renderError();
  }
}
```

Load-more visibility belongs in `renderResultList()` since it is only meaningful when results
exist.

### 4. Generation counter replaces AbortController

`AbortController` is threaded through `PagefindAPI.search()` and checked in multiple places in
`SearchUI`. A generation counter achieves the same goal with less machinery and is straightforwardly
testable.

```ts
private searchGeneration = 0;

private async handleSearch(query: string): Promise<void> {
  const gen = ++this.searchGeneration;
  // ...
  const searchResults = await this.api.search(query);
  if (gen !== this.searchGeneration) return; // stale, a newer search is in-flight
  // apply results
}
```

The debounce (150ms) handles rapid typing; the generation counter handles the race where a slow
network response from an older search resolves after a newer one.

`PagefindAPI.search()` no longer accepts an `AbortSignal`.

### 5. Event ownership consolidated

Each event is handled in exactly one file.

| Event | Owner |
|-------|-------|
| ⌘K / Ctrl+K | `search-modal.ts` |
| Open button click | `search-modal.ts` |
| Close (ESC) button click | `search-modal.ts` |
| Outside click / link click to close | `search-modal.ts` |
| Search input `input` event | `SearchUI` |
| Clear button click | `SearchUI` — calls `stopPropagation()` so it never reaches the modal close handler |
| Load more click | `SearchUI` |
| Enter key in search input | `SearchUI` |

The clear button ID special-case in `search-modal.ts` (currently lines 42–51 of `search.ts`) is
removed. `SearchUI` takes ownership by stopping propagation on the clear button click.

---

## Interface Summary

```ts
// pagefind-api.ts
class PagefindAPI {
  init(bundlePath: string): Promise<void>
  search(query: string, options?: PagefindSearchOptions): Promise<PagefindSearchResults>
  destroy(): Promise<void>
}

// search-ui.ts
class SearchUI {
  constructor(elements: SearchElements, api?: PagefindAPI)
  init(): Promise<void>
  destroy(): Promise<void>
}

// search-modal.ts
function resolveSearchElements(dialog: HTMLDialogElement): SearchElements
function initSearch(): void
```

---

### 6. Native `dialog::backdrop` replaces `data-search-modal-open`

The body currently uses a `data-search-modal-open` attribute to trigger two things via Tailwind
variants: a `body::before` pseudo-element for blur, and `overflow-hidden` for scroll-lock. Both
are unnecessary:

- The blur moves onto `dialog::backdrop` directly (`backdrop:backdrop-blur-xs` on the dialog
  element), where it belongs alongside the existing dark overlay (`backdrop:bg-[#000]
  backdrop:opacity-40`). `backdrop-filter` on `::backdrop` is supported in all browsers that
  support `<dialog>`.
- `overflow-hidden` is redundant — `showModal()` places the dialog in the top layer and modern
  browsers apply scroll-lock natively.

This eliminates `data-search-modal-open` entirely, removing the `body.toggleAttribute(...)` calls
from `search-modal.ts` and simplifying the test cleanup.

---

## Non-Goals

- No filter UI implementation
- No change to Pagefind bundle path or index merge URLs
- No change to result item HTML structure or styling
- No change to `AstroPageShell.astro` element IDs — only the JS referencing them changes
- No migration to React for result rendering
- `searchUILoading` module-level state is kept as-is (acceptable given lazy-loading is a
  one-time initialization; the flag prevents double-init on fast repeated opens)

---

## Test Strategy

All existing test scenarios remain covered. Tests require updates for:

- `SearchUI` constructor now requires `elements` as first argument; the mock extends the class
  and receives elements from `search-modal.ts`, forwarding them while injecting `mockSearchAPI`
- State setup changes from flat object mutation to discriminated union transitions
- New test: stale search generation — result from an older search is discarded when a newer
  search has already resolved
- New test: Enter key in search input is handled by `SearchUI`, not `search-modal.ts`
