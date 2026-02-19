// AIDEV-NOTE: SearchBox uses the light DOM pattern (no Shadow DOM). All children —
// the dialog and templates — live in the regular DOM so Tailwind classes work
// without any workaround. connectedCallback() is the single initialization point,
// replacing the old initPageFind() from search-modal.ts.
//
// AIDEV-NOTE: The open button lives in Backdrop.tsx outside <search-box>, so it is
// found via document.querySelector(). All other elements use this.querySelector()
// which scopes lookups to the component's subtree.
import type { SearchElements, SearchUI } from "./search-ui";

class SearchBox extends HTMLElement {
  private keydownHandler: ((e: KeyboardEvent) => void) | undefined;
  private pagefindLoading = false;
  private searchUIInstance: SearchUI | undefined;

  connectedCallback(): void {
    // AIDEV-NOTE: The open button is in Backdrop.tsx, outside <search-box>,
    // so it must be found with document.querySelector().
    const openBtn = document.querySelector<HTMLButtonElement>(
      "button[data-open-search]",
    );
    if (!openBtn) return;

    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
      openBtn.setAttribute("aria-keyshortcuts", "Meta+K");
      openBtn.setAttribute("title", "Search: ⌘K");
    }

    const closeBtn = this.querySelector<HTMLButtonElement>(
      "button[data-close-search]",
    );
    const dialog = this.querySelector<HTMLDialogElement>("dialog");
    const dialogFrame = this.querySelector<HTMLDivElement>(
      "div[data-dialog-frame]",
    );

    if (!closeBtn || !dialog || !dialogFrame) return;

    // ios safari doesn't bubble click events unless a parent has a listener
    document.body.addEventListener("click", () => {});

    /** Close the modal if a user clicks on a link or outside of the modal. */
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");

      if (link?.href) {
        // For links, only close modal after a small delay to allow navigation
        setTimeout(() => closeModal(), 100);
        return;
      }

      if (
        document.body.contains(event.target as Node) &&
        !dialogFrame.contains(event.target as Node)
      ) {
        closeModal();
      }
    };

    const openModal = async (event?: MouseEvent) => {
      dialog.showModal();

      // Lazy-load SearchUI on first open; flag prevents race condition
      if (!this.searchUIInstance && !this.pagefindLoading) {
        this.pagefindLoading = true;
        try {
          const { SearchUI } = await import("./search-ui");
          const elements = resolveSearchElements(dialog);
          this.searchUIInstance = new SearchUI(elements);
          await this.searchUIInstance.init();
        } finally {
          this.pagefindLoading = false;
        }
      }

      event?.stopPropagation();
      globalThis.addEventListener("click", onClick);
    };

    const closeModal = () => dialog.close();

    openBtn.addEventListener("click", (e) => void openModal(e));
    openBtn.disabled = false;
    closeBtn.addEventListener("click", closeModal);

    dialog.addEventListener("close", () => {
      globalThis.removeEventListener("click", onClick);
    });

    // Listen for `ctrl + k` and `cmd + k` keyboard shortcuts.
    this.keydownHandler = (e: KeyboardEvent) => {
      if ((e.metaKey === true || e.ctrlKey === true) && e.key === "k") {
        if (dialog.open) closeModal();
        else void openModal();
        e.preventDefault();
      }
    };

    globalThis.addEventListener("keydown", this.keydownHandler);
  }

  disconnectedCallback(): void {
    if (this.keydownHandler) {
      globalThis.removeEventListener("keydown", this.keydownHandler);
    }
  }
}

// AIDEV-NOTE: Single source of truth for search element IDs in JS.
// If an ID changes in AstroPageShell.astro, update only this function.
function resolveSearchElements(dialog: HTMLDialogElement): SearchElements {
  const input = dialog.querySelector<HTMLInputElement>("#search-input");
  const clearButton = dialog.querySelector<HTMLButtonElement>(
    "#search-clear-button",
  );
  const resultsCounter = dialog.querySelector<HTMLElement>(
    "#search-results-counter",
  );
  const resultsContainer =
    dialog.querySelector<HTMLElement>("#search-results");
  const loadMoreWrapper = dialog.querySelector<HTMLElement>(
    "#search-load-more-wrapper",
  );
  const loadMoreButton = dialog.querySelector<HTMLButtonElement>(
    "#search-load-more",
  );

  if (
    !input ||
    !clearButton ||
    !resultsCounter ||
    !resultsContainer ||
    !loadMoreWrapper ||
    !loadMoreButton
  ) {
    throw new Error("Required search elements not found");
  }

  return {
    clearButton,
    container: document.body,
    input,
    loadMoreButton,
    loadMoreWrapper,
    resultsContainer,
    resultsCounter,
  };
}

if (!customElements.get("search-box")) {
  customElements.define("search-box", SearchBox);
}
