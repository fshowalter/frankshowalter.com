// AIDEV-NOTE: SearchBox uses the light DOM pattern (no Shadow DOM). All children —
// the dialog and templates — live in the regular DOM so Tailwind classes work
// without any workaround. connectedCallback() replaces the old DOMContentLoaded
// auto-init from search-modal.ts.
import { initPageFind } from "./search-modal";

class SearchBox extends HTMLElement {
  connectedCallback(): void {
    initPageFind();
  }
}

customElements.define("search-box", SearchBox);
