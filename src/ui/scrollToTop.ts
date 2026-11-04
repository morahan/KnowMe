type ScrollToTopHandler = () => void;

const handlers = new Map<string, ScrollToTopHandler>();

/** Register the scrollable for a tab route (e.g. `patterns`). Returns cleanup. */
export function registerScrollToTop(routeName: string, handler: ScrollToTopHandler): () => void {
  handlers.set(routeName, handler);
  return () => {
    if (handlers.get(routeName) === handler) handlers.delete(routeName);
  };
}

/** Scroll a tab's page to the top. No-op if that page has no scrollable mounted. */
export function requestScrollToTop(routeName: string): void {
  handlers.get(routeName)?.();
}
