import type { SearchUI } from "./search-ui";

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
    // Handle clear button focus first - refocus the input after clearing
    if (
      event.target instanceof HTMLButtonElement &&
      event.target.id === "pagefind-clear-button"
    ) {
      const input = document.querySelector(
        "#pagefind-search-input",
      ) as HTMLInputElement;
      input?.focus();
      return; // Don't close the modal for clear button
    }

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
    document.body.toggleAttribute("data-search-modal-open", true);

    // Lazy-load SearchUI on first open, prevent race condition with loading flag
    if (!searchUIInstance && !searchUILoading) {
      searchUILoading = true;
      try {
        const { SearchUI } = await import("./search-ui");
        searchUIInstance = new SearchUI();
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
    document.body.toggleAttribute("data-search-modal-open", false);
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

    // Handle Enter key in search input
    if (
      e.target instanceof HTMLInputElement &&
      e.target.id === "pagefind-search-input" &&
      e.key === "Enter"
    ) {
      e.target.blur();
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

// Initialize when DOM is ready (skip in test environment)
if (typeof process === "undefined" || !process.env?.VITEST) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
}
