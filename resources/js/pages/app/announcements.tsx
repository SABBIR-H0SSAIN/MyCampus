import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pin, Megaphone, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Announcement = {
  id: string;
  title: string;
  body: string;
  category: "Academic" | "Event" | "Club" | "Emergency";
  isPinned: boolean;
  publishedAt: string;
  author: string;
  createdAt: string;
};

type Category = "All" | "Academic" | "Event" | "Club" | "Emergency";

const CATEGORIES: Category[] = ["All", "Academic", "Event", "Club", "Emergency"];

const CATEGORY_BADGE_VARIANT: Record<string, "primary" | "warning" | "blood" | "info" | "success"> = {
  Academic:  "primary",
  Event:     "warning",
  Club:      "success",
  Emergency: "blood",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const { data, isLoading, isError } = useQuery<Announcement[]>({
    queryKey: ["announcements", activeCategory],
    queryFn: async () => {
      const params = activeCategory !== "All" ? `?category=${activeCategory}` : "";
      const res = await api.get(`/api/announcements${params}`);
      return res.data;
    },
  });

  const pinned = useMemo(() => data?.filter((a) => a.isPinned) ?? [], [data]);
  const rest   = useMemo(() => data?.filter((a) => !a.isPinned) ?? [], [data]);

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Official campus notices, club events, and emergency alerts."
      />

      {/* Category filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-xl border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer press-effect",
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/30",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Loading announcements…</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blood/30 bg-blood/5 py-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-blood/10 flex items-center justify-center text-blood mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium">Failed to load announcements.</p>
          <p className="mt-1 text-xs text-muted-foreground">Please try refreshing the page.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data?.length === 0 && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/8 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold">No announcements yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Check back later for campus notices and updates.
          </p>
        </div>
      )}

      {/* Pinned section */}
      {!isLoading && pinned.length > 0 && (
        <section className="mb-8 space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
              <Pin className="h-3 w-3" />
            </div>
            Pinned
          </h2>
          {pinned.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </section>
      )}

      {/* Rest of announcements */}
      {!isLoading && rest.length > 0 && (
        <section className="space-y-3">
          {pinned.length > 0 && (
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Latest
            </h2>
          )}
          {rest.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────

function AnnouncementCard({ announcement: a }: { announcement: Announcement }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "p-5 transition-all duration-200 overflow-hidden",
        a.isPinned && "ring-1 ring-primary/15 bg-gradient-to-r from-primary/2 to-transparent",
      )}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={CATEGORY_BADGE_VARIANT[a.category] ?? "info"}>
          {a.category}
        </Badge>
        {a.isPinned && (
          <Badge variant="primary" className="gap-1">
            <Pin className="h-2.5 w-2.5" /> Pinned
          </Badge>
        )}
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
          {a.publishedAt}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-base font-semibold leading-snug">{a.title}</h3>

      {/* Body — collapsible if long */}
      <div
        className={cn(
          "mt-2 overflow-hidden text-sm text-muted-foreground leading-relaxed transition-all duration-300",
          expanded ? "max-h-[1000px]" : "max-h-16",
        )}
      >
        <p className="whitespace-pre-wrap">{a.body}</p>
      </div>

      {/* Expand / collapse toggle */}
      {a.body.length > 120 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-primary hover:opacity-80 cursor-pointer transition-opacity"
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          ) : (
            <>Read more <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <Megaphone className="h-3 w-3" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {a.author}
        </p>
      </div>
    </Card>
  );
}
