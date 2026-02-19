import type { SearchElements, SearchUI } from "./search-ui";

// Store reference to SearchUI instance for lazy loading
let searchUIInstance: SearchUI | undefined;
let searchUILoading = false;

/**
 * Initialize the search modal controls
 */
export function initPageFind(): void {
  // Set keyboard shortcuts for Mac users
  (() => {
    const openBtn = document.querySelector("button[data-open-modal]");
    if (!openBtn) return;
    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
      openBtn.setAttribute("aria-keyshortcuts", "Meta+K");
      openBtn.setAttribute("title", `Search: ⌘K`);
    }
  })();

  const openBtn = document.querySelector<HTMLButtonElement>(
    "button[data-open-modal]",
  );
  const closeBtn = document.querySelector<HTMLButtonElement>(
    "button[data-close-modal]",
  );
  const dialog = document.querySelector<HTMLDialogElement>("dialog");
  const dialogFrame = document.querySelector<HTMLDivElement>(
    "div[data-dialog-frame]",
  );

  if (!openBtn || !closeBtn || !dialog || !dialogFrame) {
    return;
  }

  // ios safari doesn't bubble click events unless a parent has a listener
  document.body.addEventListener("click", () => {});

  /** Close the modal if a user clicks on a link or outside of the modal. */
  const onClick = (event: MouseEvent) => {
    // Check if the target is an anchor element or contained within one
    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (link?.href) {
      // For links, only close modal after a small delay to allow navigation
      // This handles both click and Enter key navigation
      setTimeout(() => closeModal(), 100);
      return;
    }

    // Close if clicked outside the dialog frame
    if (
      document.body.contains(event.target as Node) &&
      !dialogFrame.contains(event.target as Node)
    ) {
      closeModal();
    }
  };

  const openModal = async (event?: MouseEvent) => {
    dialog.showModal();

    // Lazy-load SearchUI on first open, prevent race condition with loading flag
    if (!searchUIInstance && !searchUILoading) {
      searchUILoading = true;
      try {
        const { SearchUI } = await import("./search-ui");
        const elements = resolveSearchElements(dialog);
        searchUIInstance = new SearchUI(elements);
        await searchUIInstance.init();
      } finally {
        searchUILoading = false;
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
  globalThis.addEventListener("keydown", (e: KeyboardEvent) => {
    if ((e.metaKey === true || e.ctrlKey === true) && e.key === "k") {
      if (dialog.open) closeModal();
      else {
        void openModal();
      }
      e.preventDefault();
    }
  });
}

/**
 * Initialize search functionality
 */
export function initSearch(): void {
  initPageFind();
  // SearchUI is now lazy-loaded when the modal opens
}

// AIDEV-NOTE: Single source of truth for search element IDs in JS.
// If an ID changes in AstroPageShell.astro, update only this function.
export function resolveSearchElements(
  dialog: HTMLDialogElement,
): SearchElements {
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

// Initialize when DOM is ready (skip in test environment)
if (typeof process === "undefined" || !process.env?.VITEST) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
}
