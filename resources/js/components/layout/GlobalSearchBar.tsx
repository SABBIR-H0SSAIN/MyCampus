import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShoppingBag,
  RefreshCw,
  Droplet,
  BookOpen,
  Home,
  X,
  Loader2,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ── Module metadata ──────────────────────────────────────────────
// Single source of truth for: which group key from the API maps to
// which module URL + icon. Used to render group headers and to build
// navigation links when a result is clicked.
const MODULE_META: Record<
  string,
  { label: string; path: string; Icon: any; tint: string }
> = {
  marketplace: { label: "Marketplace",    path: "/app/marketplace", Icon: ShoppingBag, tint: "text-primary" },
  exchange:    { label: "Exchange",       path: "/app/exchange",    Icon: RefreshCw,    tint: "text-info" },
  blood:       { label: "Blood Network",  path: "/app/blood",       Icon: Droplet,      tint: "text-blood" },
  resources:   { label: "Resources",      path: "/app/resources",   Icon: BookOpen,     tint: "text-warning" },
  roommates:   { label: "Roommates",      path: "/app/roommates",   Icon: Home,         tint: "text-success" },
  lostFound:   { label: "Lost & Found",   path: "/app/lost-found",  Icon: Search,       tint: "text-muted-foreground" },
};

const ORDER = ["marketplace", "exchange", "blood", "resources", "roommates", "lostFound"];

type Hit = { id: string; title: string; subtitle: string; image: string | null };
type SearchResponse = { q: string; total: number; groups: Record<string, Hit[]> };

/**
 * Flatten the grouped response into a single ordered list of
 * (groupKey, hit, indexInGroup) tuples. Used for keyboard navigation
 * so ArrowUp/Down can step through every visible row across groups.
 */
function flattenGroups(groups: Record<string, Hit[]>): { group: string; hit: Hit; index: number }[] {
  const out: { group: string; hit: Hit; index: number }[] = [];
  for (const key of ORDER) {
    const list = groups[key];
    if (!list) continue;
    list.forEach((hit, index) => out.push({ group: key, hit, index }));
  }
  return out;
}

/**
 * Global search bar — debounced input + grouped-results dropdown.
 *
 * Props:
 *   - variant: "inline" (desktop topbar) | "modal" (mobile full-screen)
 *   - onNavigate: optional callback fired after navigating to a result
 *     (used by the mobile variant to close its modal)
 *   - autoFocus: focus the input on mount (mobile variant uses this)
 */
export function GlobalSearchBar({
  variant = "inline",
  onNavigate,
  autoFocus = false,
}: {
  variant?: "inline" | "modal";
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  // Debounced value — what we actually query the API with. Keeps the
  // input snappy while batching requests as the user types.
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 300ms debounce on the input value.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Only fetch when we have >= 2 chars. Below that the API early-returns empty.
  const enabled = debounced.trim().length >= 2;

  const { data, isFetching } = useQuery<SearchResponse>({
    queryKey: ["global-search", debounced],
    queryFn: async () => {
      const res = await api.get("/api/search", { params: { q: debounced } });
      return res.data;
    },
    enabled,
    staleTime: 30_000, // cache hits for 30s so retyping same word doesn't re-hit DB
  });

  const flat = useMemo(() => flattenGroups(data?.groups ?? {}), [data]);
  const hasResults = (data?.total ?? 0) > 0;

  // Reset keyboard cursor whenever results change.
  useEffect(() => {
    setActiveIndex(0);
  }, [debounced, data?.total]);

  // Open dropdown when input has focus + something to show.
  useEffect(() => {
    if (enabled) setOpen(true);
  }, [enabled, data?.total]);

  // Close on outside click (inline variant only — modal variant has its own backdrop).
  useEffect(() => {
    if (variant !== "inline") return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [variant]);

  // Close on Escape, navigate with Enter / ArrowUp / ArrowDown.
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || !flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[activeIndex];
      if (target) goToResult(target.group, target.hit);
    }
  }

  function goToResult(groupKey: string, hit: Hit) {
    const meta = MODULE_META[groupKey];
    if (!meta) return;
    // Per-module page reads ?open=<id> on mount and auto-opens its detail modal.
    navigate(`${meta.path}?open=${encodeURIComponent(hit.id)}`);
    setOpen(false);
    setQuery("");
    setDebounced("");
    onNavigate?.();
  }

  function clear() {
    setQuery("");
    setDebounced("");
    inputRef.current?.focus();
  }

  // ── Render ────────────────────────────────────────────────────
  const isModal = variant === "modal";
  const inputClasses = isModal
    ? "h-12 w-full rounded-xl border border-input bg-surface pl-11 pr-10 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
    : "h-10 w-full rounded-xl border border-input bg-surface pl-9 pr-9 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:shadow-[0_0_0_4px] focus:shadow-primary/5";

  return (
    <div ref={containerRef} className={cn("relative", isModal && "w-full")}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          isModal ? "left-3.5 h-5 w-5" : "left-3 h-4 w-4",
        )}
      />
      <input
        ref={inputRef}
        type="search"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => enabled && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={
          isModal
            ? "Search across Marketplace, Roommates, Resources…"
            : "Search resources, listings, students…"
        }
        aria-label="Search"
        className={inputClasses}
      />
      {/* Right side: loading spinner OR clear button (only if there's text) */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isFetching && enabled ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            onClick={clear}
            className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Dropdown — only render when there's something meaningful to show. */}
      {open && enabled && (
        <div
          className={cn(
            "z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-xl",
            isModal
              ? "mt-2 w-full"
              : "absolute left-0 right-0 top-full mt-2 w-full max-h-[70vh] overflow-y-auto",
          )}
          role="listbox"
        >
          {/* Empty results */}
          {!isFetching && !hasResults && (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto h-7 w-7 text-muted-foreground/40" />
              <p className="mt-2 text-sm font-medium">No results for &ldquo;{debounced}&rdquo;</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Try a different keyword, or browse a module from the sidebar.
              </p>
            </div>
          )}

          {/* Grouped hits */}
          {hasResults && (
            <div className="py-1">
              <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border/60">
                {data?.total} result{data?.total === 1 ? "" : "s"} for &ldquo;{debounced}&rdquo;
              </div>

              {ORDER.filter((k) => data?.groups?.[k]?.length).map((groupKey) => {
                const meta = MODULE_META[groupKey];
                const hits = data!.groups[groupKey];
                return (
                  <div key={groupKey} className="py-1">
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <meta.Icon className={cn("h-3 w-3", meta.tint)} />
                      {meta.label}
                    </div>

                    {hits.map((hit) => {
                      const flatIndex = flat.findIndex((f) => f.hit === hit);
                      const isActive = flatIndex === activeIndex;
                      return (
                        <button
                          key={`${groupKey}-${hit.id}`}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => goToResult(groupKey, hit)}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors cursor-pointer",
                            isActive ? "bg-secondary" : "hover:bg-secondary/60",
                          )}
                          role="option"
                          aria-selected={isActive}
                        >
                          {/* Thumbnail or module-icon avatar */}
                          {hit.image ? (
                            <img
                              src={hit.image}
                              alt=""
                              className="h-9 w-9 shrink-0 rounded-md border border-border object-cover bg-secondary"
                            />
                          ) : (
                            <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary", meta.tint)}>
                              <meta.Icon className="h-4 w-4" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{hit.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{hit.subtitle}</p>
                          </div>

                          {isActive && (
                            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer hint (only when there are results) */}
          {hasResults && (
            <div className="flex items-center justify-between border-t border-border/60 bg-secondary/30 px-4 py-2 text-[10px] font-mono text-muted-foreground">
              <span>
                <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">↑</kbd>{" "}
                <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">↓</kbd> to navigate
              </span>
              <span>
                <kbd className="rounded border border-border bg-surface px-1.5 py-0.5">↵</kbd> to open
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}