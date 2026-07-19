import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Read `?open=<id>` from the URL, look the item up in an already-loaded list,
 * and call `onOpen(item)` once. After handling, the `?open=` param is stripped
 * from the URL with `replace: true` so a hard refresh doesn't re-trigger it.
 *
 * Powers "click a global search result → land on the module page → auto-open
 * that item's detail modal" without an extra fetch-by-id round trip.
 *
 * Returns the `openId` for callers that want to render a one-off highlight
 * (e.g. blood — no detail modal — scrolls the matching card into view).
 */
export function useOpenFromSearchParam<T extends { id: string | number }>(
  items: T[] | undefined,
  onOpen: (item: T) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const onOpenRef = useRef(onOpen);
  const handledRef = useRef<string | null>(null);

  // Keep latest onOpen without re-firing the effect every render.
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);

  const openId = searchParams.get("open");
  const itemsKey = items ? items.map(i => String(i.id)).join("|") : "";

  useEffect(() => {
    if (!openId || !Array.isArray(items) || items.length === 0) return;
    // Avoid firing twice for the same id (StrictMode dev double-effect, plus
    // re-runs when items reload with the same id).
    if (handledRef.current === openId) return;

    const item = items.find(i => String(i.id) === openId);
    if (!item) return;

    handledRef.current = openId;
    onOpenRef.current(item);

    // Strip `?open=` so refresh doesn't re-open the modal.
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("open");
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, itemsKey]);

  return openId;
}