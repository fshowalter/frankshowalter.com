# Search Refactor Specification — Web Component (Light DOM)

## Overview

The current search implementation (`search-modal.ts`, `search-ui.ts`, `pagefind-api.ts`) was refactored
from the original two-file design into three files with dependency injection, a discriminated state
union, and a generation counter for cancellation. That refactor achieved its goals, but the architecture
still has structural friction:

- Three JS files coordinate to manage one feature
- HTML lives in JS template strings (`renderResultItem()`, `renderLoadingSkeleton()`, etc.) — invisible
  to Tailwind's source scanner in practice and impossible to lint as HTML
- Module-level state (`searchUIInstance`, `searchUILoading`) manages lazy-loading lifecycle
- `resolveSearchElements()` maps 7 IDs to a struct, bridging HTML and JS with a manual lookup table

This spec replaces all three files with a single `<search-box>` web component using the **light DOM**
pattern. All HTML stays in Astro markup (using `<template>` elements for dynamic content), Tailwind
classes work without any Shadow DOM workaround, and the component manages its own lifecycle via
`connectedCallback()`.

All existing user-visible behavior is preserved.

---

## Behavioral Requirements (Unchanged)

- Search modal opens via the search button or Cmd+K / Ctrl+K
- Modal closes on ESC button click, outside click, or Cmd+K / Ctrl+K toggle
- Modal closes with a short delay when a result link is clicked (to allow navigation)
- Pagefind is lazy-loaded on first modal open
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
| `src/astro/search-box.ts` | `SearchBox` custom element: modal, state, events, rendering via templates |
| `src/astro/pagefind-api.ts` | `PagefindAPI` class: Pagefind wrapper and index merging (unchanged) |

`search-modal.ts` and `search-ui.ts` are deleted.

---

## Key Design Decisions

### 1. Light DOM — no Shadow DOM

`SearchBox` extends `HTMLElement` but never calls `this.attachShadow()`. All children —
the button, the dialog, the templates — live in the regular DOM. Tailwind classes work identically
to any other element. No `::slotted()`, no `:host`, no style encapsulation workarounds.

```ts
class SearchBox extends HTMLElement {
  connectedCallback() {
    // this.querySelector() finds light DOM children
    this.dialog = this.querySelector("dialog")!;
    this.openButton = this.querySelector<HTMLButtonElement>("button[data-open-search]")!;
    // ...
  }
}
customElements.define("search-box", SearchBox);
```

### 2. SSR-friendly structure

The button and dialog are direct light DOM children of `<search-box>` — Astro renders them
server-side. The `<dialog>` is natively hidden until `showModal()` is called. No JS is needed
for the initial render.

```html
<search-box>
  <!-- SSR'd, always visible -->
  <button data-open-search disabled>Search <kbd>Ctrl+K</kbd></button>

  <!-- SSR'd, natively hidden until showModal() -->
  <dialog aria-label="Search" class="...">
    ...search input, counter, results container, load more, footer...
  </dialog>

  <!-- Inert until JS clones them -->
  <template data-result-item>...</template>
  <template data-skeleton>...</template>
  <template data-empty>...</template>
  <template data-error>...</template>
</search-box>
```

### 3. `<template>` elements for dynamic content

Content that is generated dynamically (result items, loading skeleton, empty/error messages) lives
in `<template>` elements inside `<search-box>` in the `.astro` file. The browser parses but does
not render `<template>` content. The component clones templates via
`template.content.cloneNode(true)` and inserts them into the light DOM.

Tailwind 4.x scans `.astro` source files for class strings at build time — classes inside
`<template>` tags are found and included in the CSS output.

```ts
private renderResult(doc: PagefindDocument): DocumentFragment {
  const clone = this.resultTemplate.content.cloneNode(true) as DocumentFragment;
  const link = clone.querySelector<HTMLAnchorElement>("[data-field='link']")!;
  link.href = doc.url;
  link.textContent = doc.meta.title;
  clone.querySelector("[data-field='excerpt']")!.innerHTML = doc.excerpt;
  // ...
  return clone;
}
```

This eliminates all HTML template strings from JS. The HTML is lintable, visible in the Astro
file, and uses the same Tailwind classes as everything else.

### 4. Element lookup via IDs with `search-box-` prefix

Elements use IDs prefixed with `search-box-` and are looked up via `this.querySelector("#id")`
inside the component. `getElementById` always returns exactly one element (or null) — no risk of
accidentally matching a duplicate `data-*` attribute. Using `this.querySelector()` keeps the
lookup scoped to the component's subtree.

| Before (ID) | After (ID) |
|---|---|
| `search-input` | `search-box-input` |
| `search-clear-button` | `search-box-clear` |
| `search-results-counter` | `search-box-counter` |
| `search-results` | `search-box-results` |
| `search-results-wrapper` | `search-box-results-wrapper` |
| `search-load-more-wrapper` | `search-box-load-more-wrapper` |
| `search-load-more` | `search-box-load-more` |

ARIA cross-reference attributes (`aria-describedby`, `aria-controls`) use the same IDs.

### 5. `connectedCallback()` replaces manual initialization

No `DOMContentLoaded` listener, no `initSearch()` / `initPageFind()` functions. The browser
calls `connectedCallback()` automatically when `<search-box>` enters the DOM. The component
enables the button, sets keyboard shortcuts, and registers event listeners.

```ts
connectedCallback() {
  this.dialog = this.querySelector("dialog")!;
  this.openButton = this.querySelector<HTMLButtonElement>("button[data-open-search]")!;
  this.input = this.querySelector<HTMLInputElement>("#search-box-input")!;
  this.resultsContainer = this.querySelector<HTMLElement>("#search-box-results")!;
  // ...resolve remaining elements and cache template refs...

  this.openButton.disabled = false;
  this.setupKeyboardShortcuts();
  this.setupEventListeners();
}
```

### 6. Discriminated union state (preserved)

The discriminated union from the previous refactor is kept — it makes invalid states
unrepresentable and drives a clean `render()` switch.

```ts
type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "results"; query: string; results: PagefindDocument[]; total: number;
      allResults: PagefindResult[]; visibleCount: number }
  | { kind: "empty"; query: string }
  | { kind: "error"; message: string };
```

### 7. Generation counter for cancellation (preserved)

The generation counter pattern from the previous refactor is kept.

### 8. Native `dialog::backdrop` for blur (preserved)

The `backdrop:backdrop-blur-xs` class on the dialog element handles blur. No
`data-search-modal-open` attribute on body.

### 9. Pagefind lazy-loaded on first open

`PagefindAPI` is imported and initialized on first modal open, same as today. The loading
flag is now instance state (`this.pagefindLoading`) instead of module-level state.

---

## Interface Summary

```ts
// search-box.ts
class SearchBox extends HTMLElement {
  connectedCallback(): void
  disconnectedCallback(): void
}

// pagefind-api.ts (unchanged)
class PagefindAPI {
  init(bundlePath: string): Promise<void>
  search(query: string, options?: PagefindSearchOptions): Promise<PagefindSearchResults>
  destroy(): Promise<void>
}
```

`formatCounter(total, query)` remains a pure exported function for unit testing.

---

## Non-Goals

- No Shadow DOM
- No filter UI implementation
- No change to Pagefind bundle path or index merge URLs
- No change to result item visual design or styling
- No migration to React for result rendering
- No change to `pagefind-api.ts` internals

---

## Test Strategy

Tests shift from mocking `SearchUI` via `vi.mock()` to testing the `<search-box>` custom
element directly. The mock surface is simpler:

- **Element registration**: `customElements.define("search-box", SearchBox)` happens in the
  module — tests import the module and the element self-registers
- **Pagefind mock**: inject a mock `PagefindAPI` via a method or attribute on the element,
  or mock the dynamic import
- **Template cloning**: since templates are in the light DOM, cloned content is immediately
  queryable — no Shadow DOM piercing needed
- **Event tests**: dispatch events on `this.querySelector(...)` elements directly

All existing test scenarios remain covered:
- Modal open/close (button, Cmd+K, Ctrl+K, ESC, outside click, link click)
- Search input debounce, results display, empty results, loading skeleton
- Clear button, load more, stale search generation
- Enter key blur, screen reader announcements
