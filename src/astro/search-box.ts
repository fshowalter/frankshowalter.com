// AIDEV-NOTE: Two-class split — SearchBoxController holds all behavior and is
// instantiated directly in tests with (root, dom.window) to avoid bridging JSDOM
// globals onto Node's globalThis. SearchBox is a thin web component shell that
// delegates to SearchBoxController.
//
// AIDEV-NOTE: SearchBox uses the light DOM pattern (no Shadow DOM). All children —
// the dialog and templates — live in the regular DOM so Tailwind classes work
// without any workaround.
//
// AIDEV-NOTE: The open button lives in Backdrop.tsx outside <search-box>, so it is
// found via win.document.querySelector(). All other elements use root.querySelector()
// which scopes lookups to the component's subtree.
import { debounce } from "~/utils/debounce";

import type { PagefindDocument, PagefindResult } from "./pagefind-api";

import { PagefindAPI } from "./pagefind-api";

// AIDEV-NOTE: Discriminated union makes invalid states unrepresentable.
// render() dispatches to one focused method per variant — no cross-branch conditionals.
type SearchState =
  | {
      allResults: PagefindResult[];
      kind: "results";
      query: string;
      results: PagefindDocument[];
      total: number;
      visibleCount: number;
    }
  | { kind: "empty"; query: string }
  | { kind: "error"; message: string }
  | { kind: "idle" }
  | { kind: "loading"; query: string };

export class SearchBoxController {
  private api = new PagefindAPI();
  private clearButton!: HTMLButtonElement;
  private clickHandler: ((e: MouseEvent) => void) | undefined;
  private readonly config = {
    bundlePath: import.meta.env.BASE_URL.replace(/\/$/, "") + "/pagefind/",
    debounceTimeoutMs: 150,
    pageSize: 10,
  };
  private debouncedSearch!: (query: string) => void;
  private emptyTemplate!: HTMLTemplateElement;
  private errorTemplate!: HTMLTemplateElement;
  private input!: HTMLInputElement;
  private iosListenerAttached = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | undefined;
  private loadMoreButton!: HTMLButtonElement;
  private loadMoreWrapper!: HTMLElement;
  private pagefindInitialized = false;
  private pagefindLoading = false;
  private resultsContainer!: HTMLElement;
  private resultsCounter!: HTMLElement;
  private resultTemplate!: HTMLTemplateElement;
  private root: Element;
  // AIDEV-NOTE: Generation counter replaces AbortController. Each search increments the
  // counter; stale results (from an older search that resolved late) are discarded by
  // comparing gen against the current counter after every await point.
  private searchGeneration = 0;
  private skeletonTemplate!: HTMLTemplateElement;
  private state: SearchState = { kind: "idle" };
  private win: Window;

  constructor(root: Element, win: Window) {
    this.root = root;
    this.win = win;
  }

  destroy(): void {
    if (this.keydownHandler) {
      this.win.removeEventListener("keydown", this.keydownHandler);
    }
    if (this.clickHandler) {
      this.win.removeEventListener("click", this.clickHandler);
    }
  }

  init(): void {
    // AIDEV-NOTE: The open button is in Backdrop.tsx, outside <search-box>,
    // so it must be found with win.document.querySelector().
    const openBtn = this.win.document.querySelector<HTMLButtonElement>(
      "button[data-open-search]",
    );
    if (!openBtn) return;

    if (/(Mac|iPhone|iPod|iPad)/i.test(this.win.navigator.userAgent)) {
      openBtn.setAttribute("aria-keyshortcuts", "Meta+K");
      openBtn.setAttribute("title", "Search: ⌘K");
    }

    const closeBtn = this.root.querySelector<HTMLButtonElement>(
      "button[data-close-search]",
    );
    const dialog = this.root.querySelector<HTMLDialogElement>("dialog");
    const dialogFrame = this.root.querySelector<HTMLDivElement>(
      "div[data-dialog-frame]",
    );

    if (!closeBtn || !dialog || !dialogFrame) return;

    // Cache element refs — IDs prefixed with search-box- to avoid collisions
    this.input = this.root.querySelector<HTMLInputElement>("#search-box-input")!;
    this.clearButton =
      this.root.querySelector<HTMLButtonElement>("#search-box-clear")!;
    this.resultsCounter = this.root.querySelector<HTMLElement>(
      "#search-box-counter",
    )!;
    this.resultsContainer = this.root.querySelector<HTMLElement>(
      "#search-box-results",
    )!;
    this.loadMoreWrapper = this.root.querySelector<HTMLElement>(
      "#search-box-load-more-wrapper",
    )!;
    this.loadMoreButton = this.root.querySelector<HTMLButtonElement>(
      "#search-box-load-more",
    )!;

    // AIDEV-NOTE: Template refs hold dynamic content HTML. Tailwind 4.x scans
    // <template> tags in .astro source files — classes are included in CSS output.
    this.resultTemplate = this.root.querySelector<HTMLTemplateElement>(
      "template[data-result-item]",
    )!;
    this.skeletonTemplate = this.root.querySelector<HTMLTemplateElement>(
      "template[data-skeleton]",
    )!;
    this.emptyTemplate = this.root.querySelector<HTMLTemplateElement>(
      "template[data-empty]",
    )!;
    this.errorTemplate = this.root.querySelector<HTMLTemplateElement>(
      "template[data-error]",
    )!;

    if (
      !this.input ||
      !this.clearButton ||
      !this.resultsCounter ||
      !this.resultsContainer ||
      !this.loadMoreWrapper ||
      !this.loadMoreButton ||
      !this.resultTemplate ||
      !this.skeletonTemplate ||
      !this.emptyTemplate ||
      !this.errorTemplate
    ) {
      return;
    }

    this.debouncedSearch = debounce((query: string) => {
      void this.handleSearch(query);
    }, this.config.debounceTimeoutMs);

    this.setupEventListeners();

    // ios safari doesn't bubble click events unless a parent has a listener
    if (!this.iosListenerAttached) {
      this.win.document.body.addEventListener("click", () => {});
      this.iosListenerAttached = true;
    }

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
        this.win.document.body.contains(event.target as Node) &&
        !dialogFrame.contains(event.target as Node)
      ) {
        closeModal();
      }
    };
    this.clickHandler = onClick;

    const openModal = async (event?: MouseEvent) => {
      dialog.showModal();

      // Lazy-initialize PagefindAPI on first open; flag prevents race condition
      if (!this.pagefindInitialized && !this.pagefindLoading) {
        this.pagefindLoading = true;
        try {
          await this.api.init(this.config.bundlePath);
          this.pagefindInitialized = true;
        } catch (error) {
          console.error("Failed to initialize search:", error);
          this.state = {
            kind: "error",
            message: "Search functionality could not be loaded.",
          };
          this.render();
        } finally {
          this.pagefindLoading = false;
        }
      }

      event?.stopPropagation();
      this.win.addEventListener("click", onClick);
    };

    const closeModal = () => dialog.close();

    openBtn.addEventListener("click", (e) => void openModal(e));
    openBtn.disabled = false;
    closeBtn.addEventListener("click", closeModal);

    dialog.addEventListener("close", () => {
      this.win.removeEventListener("click", onClick);
    });

    // Listen for `ctrl + k` and `cmd + k` keyboard shortcuts.
    this.keydownHandler = (e: KeyboardEvent) => {
      if ((e.metaKey === true || e.ctrlKey === true) && e.key === "k") {
        if (dialog.open) closeModal();
        else void openModal();
        e.preventDefault();
      }
    };

    this.win.addEventListener("keydown", this.keydownHandler);
  }

  private announceToScreenReader(message: string): void {
    const announcement = this.win.document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "sr-only";
    announcement.textContent = message;
    this.win.document.body.append(announcement);
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  private clearSearch(): void {
    this.input.value = "";
    this.clearButton.classList.add("hidden");
    this.state = { kind: "idle" };
    this.render();
  }

  // AIDEV-NOTE: Clones the result-item template and fills data-field slots.
  // Removes the image-wrapper if no image is present in the result metadata.
  private cloneResult(doc: PagefindDocument): DocumentFragment {
    const clone = this.resultTemplate.content.cloneNode(
      true,
    ) as DocumentFragment;
    const link = clone.querySelector<HTMLAnchorElement>("[data-field='link']")!;
    link.href = doc.url;
    link.textContent = doc.meta.title;

    clone.querySelector("[data-field='excerpt']")!.innerHTML = doc.excerpt;

    const imageWrapper = clone.querySelector<HTMLElement>(
      "[data-field='image-wrapper']",
    );
    if (imageWrapper) {
      const { image, image_alt } = doc.meta;
      if (image) {
        const resultUrl = new URL(doc.url);
        const imageUrl = `${resultUrl.protocol}//${resultUrl.hostname}/${image}`;
        const img = clone.querySelector<HTMLImageElement>(
          "[data-field='image']",
        )!;
        img.src = imageUrl;
        img.alt = image_alt ?? "";
      } else {
        imageWrapper.remove();
      }
    }

    return clone;
  }

  private async handleSearch(query: string): Promise<void> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      this.clearSearch();
      return;
    }

    const gen = ++this.searchGeneration;
    this.state = { kind: "loading", query: trimmedQuery };
    this.render();

    try {
      const searchResults = await this.api.search(trimmedQuery);
      if (gen !== this.searchGeneration) return;

      const resultData = await Promise.all(
        searchResults.results.slice(0, this.config.pageSize).map((r) => {
          return r.data();
        }),
      );
      if (gen !== this.searchGeneration) return;

      this.state =
        resultData.length > 0
          ? {
              allResults: searchResults.results,
              kind: "results",
              query: trimmedQuery,
              results: resultData,
              total: searchResults.results.length,
              visibleCount: resultData.length,
            }
          : { kind: "empty", query: trimmedQuery };
    } catch (error) {
      if (gen !== this.searchGeneration) return;
      console.error("Search failed:", error);
      this.state = {
        kind: "error",
        message: "Search failed. Please try again.",
      };
    }

    this.render();
  }

  private async loadMoreResults(): Promise<void> {
    if (this.state.kind !== "results") return;

    const { allResults, query, results, total, visibleCount } = this.state;
    const remaining = allResults.slice(visibleCount);
    if (remaining.length === 0) return;

    const nextBatch = remaining.slice(0, this.config.pageSize);
    const scrollPosition = this.resultsContainer.scrollTop;
    const gen = this.searchGeneration;

    try {
      const resultData = await Promise.all(
        nextBatch.map((r) => {
          return r.data();
        }),
      );

      if (gen !== this.searchGeneration) return;

      this.state = {
        allResults,
        kind: "results",
        query,
        results: [...results, ...resultData],
        total,
        visibleCount: visibleCount + resultData.length,
      };
      this.render();

      // Restore scroll position
      this.resultsContainer.scrollTop = scrollPosition;

      // Announce to screen readers that new results were loaded
      this.announceToScreenReader(`${resultData.length} more results loaded`);
    } catch (error) {
      if (gen !== this.searchGeneration) return;
      console.error("Failed to load more results:", error);
      this.state = {
        kind: "error",
        message: "Failed to load more results.",
      };
      this.render();
    }
  }

  /**
   * Dispatch rendering to the method for the current state.
   * Contains only a switch — no inline HTML, no conditionals.
   */
  private render(): void {
    switch (this.state.kind) {
      case "empty": {
        return this.renderEmpty();
      }
      case "error": {
        return this.renderError();
      }
      case "idle": {
        return this.renderIdle();
      }
      case "loading": {
        return this.renderLoading();
      }
      case "results": {
        return this.renderResultList();
      }
    }
  }

  private renderEmpty(): void {
    if (this.state.kind !== "empty") return;
    this.resultsCounter.textContent = formatCounter(0, this.state.query);
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.append(this.emptyTemplate.content.cloneNode(true));
    this.loadMoreWrapper.classList.add("hidden");
  }

  private renderError(): void {
    if (this.state.kind !== "error") return;
    this.resultsCounter.textContent = "";
    this.resultsContainer.innerHTML = "";
    const clone = this.errorTemplate.content.cloneNode(
      true,
    ) as DocumentFragment;
    const msg = clone.querySelector<HTMLElement>("[data-field='message']");
    if (msg) msg.textContent = this.state.message;
    this.resultsContainer.append(clone);
    this.loadMoreWrapper.classList.add("hidden");
  }

  private renderIdle(): void {
    this.resultsCounter.textContent = "";
    this.resultsContainer.innerHTML = "";
    this.loadMoreWrapper.classList.add("hidden");
  }

  private renderLoading(): void {
    this.resultsCounter.textContent = "";
    this.resultsContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      this.resultsContainer.append(
        this.skeletonTemplate.content.cloneNode(true),
      );
    }
    this.loadMoreWrapper.classList.add("hidden");
  }

  /**
   * Render result list — only called in "results" state.
   * Owns load-more visibility since it only makes sense when results exist.
   */
  private renderResultList(): void {
    if (this.state.kind !== "results") return;
    const { allResults, query, results, total, visibleCount } = this.state;

    this.resultsCounter.textContent = formatCounter(total, query);

    const ol = this.win.document.createElement("ol");
    for (const result of results) {
      ol.append(this.cloneResult(result));
    }
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.append(ol);

    const remaining = allResults.length - visibleCount;
    if (remaining > 0) {
      this.loadMoreWrapper.classList.remove("hidden");
      this.loadMoreButton.textContent = `Load ${Math.min(
        remaining,
        this.config.pageSize,
      )} more (${total - visibleCount} remaining)`;
    } else {
      this.loadMoreWrapper.classList.add("hidden");
    }
  }

  private setupEventListeners(): void {
    this.input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;

      // Show/hide clear button based on input content
      this.clearButton.classList.toggle("hidden", !target.value);

      this.debouncedSearch(target.value);
    });

    // Blur input on Enter (dismisses mobile keyboard)
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.input.blur();
      }
    });

    // Clear button — stopPropagation prevents the click from reaching the modal's
    // global onClick handler, which would otherwise attempt to close the modal.
    this.clearButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.clearSearch();
      this.input.focus();
    });

    // Load more button
    this.loadMoreButton.addEventListener("click", () => {
      void this.loadMoreResults();
    });
  }
}

/**
 * Format the results counter text.
 * Pure function — exported for unit testing.
 */
export function formatCounter(total: number, query: string): string {
  if (total === 0) return `No results for "${query}"`;
  if (total === 1) return `1 result for "${query}"`;
  return `${total} results for "${query}"`;
}

// AIDEV-NOTE: Guard prevents ReferenceError when the module is imported in Node
// (e.g. tests). HTMLElement and customElements are browser-only globals. Tests
// instantiate SearchBoxController directly and never need SearchBox.
if (typeof HTMLElement !== "undefined" && typeof customElements !== "undefined") {
  class SearchBox extends HTMLElement {
    private controller: SearchBoxController | undefined = undefined;

    connectedCallback(): void {
      if (this.controller) return;
      this.controller = new SearchBoxController(this, globalThis);
      this.controller.init();
    }

    disconnectedCallback(): void {
      this.controller?.destroy();
      this.controller = undefined;
    }
  }

  if (!customElements.get("search-box")) {
    customElements.define("search-box", SearchBox);
  }
}
