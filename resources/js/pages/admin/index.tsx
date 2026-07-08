import { Link } from "react-router-dom";
import { Badge, Card, PageHeader, Stat } from "@/components/ui-bits";
import { Users, UserCheck, ShoppingBag, BookOpen, Flag, Activity, ArrowRight, RefreshCw, Sparkles, X, Loader2, AlertTriangle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/api/admin/stats");
      return res.data;
    },
  });

  // AI summary mutation — hits POST /api/admin/analytics-summary which
  // gathers platform stats and sends them to Gemini for an executive summary.
  const aiMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/admin/analytics-summary");
      return res.data as { summary: string; generated_at: string; stats_snapshot: any };
    },
  });

  const a = data?.analytics;
  const pendingUsers = data?.pendingUsers || [];
  const recentReports = data?.recentReports || [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <PageHeader title="Overview" description="Loading platform health, registrations queue, and active reports..." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-secondary/50" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 rounded-lg bg-secondary/50" />
          <div className="h-72 rounded-lg bg-secondary/50" />
        </div>
      </div>
    );
  }

  if (isError || !a) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-blood font-medium">Failed to load platform statistics.</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition cursor-pointer">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  const maxUsers = Math.max(...(a.weekly?.map(d => d.users) || [1]), 1);
  const maxPosts = Math.max(...(a.weekly?.map(d => d.posts) || [1]), 1);
  const maxOverall = Math.max(maxUsers, maxPosts);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader title="Overview" description="Platform health, registrations queue, and active reports." />
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAiModalOpen(true);
              // Auto-generate on open so the admin sees the AI working immediately.
              if (!aiMutation.data) aiMutation.mutate();
            }}
            className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            Generate AI Summary
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total users" value={a.totalUsers.toLocaleString()} hint={<span className="flex items-center gap-1"><Users className="h-3 w-3" /> verified</span>} />
        <Stat label="Active (7d)" value={a.activeUsers.toLocaleString()} hint="Platform activity" accent="success" />
        <Stat label="Pending" value={a.pendingRegistrations} hint="Awaiting review" accent={a.pendingRegistrations > 0 ? "warning" : "muted"} />
        <Stat label="Listings" value={a.marketplaceItems} hint={<span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> active</span>} />
        <Stat label="Resources" value={a.resources.toLocaleString()} hint={<span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> shared</span>} />
        <Stat label="Open reports" value={a.openReports} hint={<span className="flex items-center gap-1"><Flag className="h-3 w-3" /> needs attention</span>} accent={a.openReports > 0 ? "blood" : "muted"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" /> Platform activity · last 7 days</h3>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/80" /> Signups</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-info/60" /> Posts</span>
              </div>
            </div>
            {a.weekly && a.weekly.length > 0 ? (
              <div className="flex h-56 items-end gap-3 pt-6 border-b border-border/40 pb-2">
                {a.weekly.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center bg-popover text-popover-foreground border border-border text-[9px] font-mono px-2 py-1 rounded shadow-md z-10 transition-all duration-200">
                      <div>Signups: {d.users}</div>
                      <div>Posts: {d.posts}</div>
                    </div>
                    <div className="flex h-[80%] w-full items-end gap-1.5">
                      <div className="flex-1 rounded-t bg-primary/80 hover:bg-primary transition-colors cursor-pointer" style={{ height: `${(d.users / maxOverall) * 100}%` }} title={`Signups: ${d.users}`} />
                      <div className="flex-1 rounded-t bg-info/60 hover:bg-info transition-colors cursor-pointer" style={{ height: `${(d.posts / maxOverall) * 100}%` }} title={`Posts: ${d.posts}`} />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                No activity data for the last 7 days.
              </div>
            )}
          </div>
          <div className="pt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Dynamic weekly aggregation</span>
            <span>Refreshes automatically</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><UserCheck className="h-4 w-4 text-primary" /> Pending registrations</h3>
              <Badge variant={a.pendingRegistrations > 0 ? "warning" : "outline"}>{a.pendingRegistrations}</Badge>
            </div>
            
            {pendingUsers.length > 0 ? (
              <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
                {pendingUsers.map((u: any) => (
                  <div key={u.id} className="p-3.5 hover:bg-secondary/40 transition-colors flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{u.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate">
                        {u.roll_number} · {u.department}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{u.created_at}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 flex flex-col items-center justify-center text-center text-sm text-muted-foreground h-56 gap-2">
                <UserCheck className="h-8 w-8 text-muted-foreground/55 stroke-[1.5]" />
                <div>All caught up!</div>
                <div className="text-xs text-muted-foreground/75">No registrations are currently pending approval.</div>
              </div>
            )}
          </div>
          <Link to="/admin/registrations" className="flex items-center justify-center gap-1 border-t border-border p-3 text-xs font-medium text-primary hover:bg-primary-soft/50 cursor-pointer">
            Go to approvals queue <ArrowRight className="h-3 w-3 cursor-pointer" />
          </Link>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Flag className="h-4 w-4 text-blood" /> Recent reports</h3>
          <Link to="/admin/reports" className="text-xs text-primary hover:underline cursor-pointer">View all →</Link>
        </div>
        
        {recentReports.length > 0 ? (
          <div className="divide-y divide-border/60">
            {recentReports.map((r: any) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-3 hover:bg-secondary/40 transition-colors">
                <div>
                  <div className="text-sm font-medium">{r.reason}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Reported by {r.reporter_name}</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <Badge variant={r.status === 'open' ? 'blood' : 'outline'}>{r.status}</Badge>
                  <div className="text-[10px] text-muted-foreground mt-1.5">{r.created_at}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Flag className="h-8 w-8 text-muted-foreground/50 stroke-[1.5]" />
            <div>No content reports submitted.</div>
            <div className="text-xs text-muted-foreground/70">When users report listings, resources, or profiles, they will appear here.</div>
          </div>
        )}
      </Card>

      {/* ── AI Summary Modal ───────────────────────────────────────────── */}
      {aiModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setAiModalOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface shadow-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header */}
            <div className="flex items-center justify-between gap-3 p-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate">AI Platform Summary</h2>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Generated from live stats via Gemini
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
              {aiMutation.isPending && (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Analyzing platform stats…</p>
                  <p className="text-xs text-muted-foreground/70">Gemini is reviewing user growth, content activity, and reports.</p>
                </div>
              )}

              {aiMutation.isError && (
                <div className="rounded-lg border border-blood/30 bg-blood/10 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blood shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blood">Could not generate summary</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(aiMutation.error as any)?.response?.data?.message
                        || (aiMutation.error as any)?.message
                        || "AI service is temporarily unavailable. Please try again."}
                    </p>
                  </div>
                </div>
              )}

              {aiMutation.isSuccess && (
                <>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-mono uppercase tracking-widest">
                      Generated {new Date(aiMutation.data.generated_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> {aiMutation.data.summary.length} chars
                    </span>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-5 text-sm leading-relaxed">
                    {renderMarkdown(aiMutation.data.summary)}
                  </div>
                </>
              )}

              {!aiMutation.isPending && !aiMutation.data && !aiMutation.isError && (
                <div className="flex flex-col items-center justify-center gap-3 py-8">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">Ready to analyze</p>
                  <button
                    onClick={() => aiMutation.mutate()}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Now
                  </button>
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border p-3 shrink-0 bg-surface">
              <span className="text-[11px] text-muted-foreground">
                Counts against your daily AI quota.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => aiMutation.reset()}
                  disabled={aiMutation.isPending}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition disabled:opacity-50 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => aiMutation.mutate()}
                  disabled={aiMutation.isPending}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer"
                >
                  {aiMutation.isPending ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                  ) : (
                    <><RefreshCw className="h-3 w-3" /> Regenerate</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Tiny Markdown renderer for AI summaries.
 *
 * Handles just enough Markdown for our 6-section Gemini output:
 *   - `## Heading`         → h2
 *   - `### 1. Heading`     → h3 (with optional numbering)
 *   - `**bold**`           → strong
 *   - `* bullet` / `- bullet`         → ul/li (grouped)
 *   - `1. item` / `2. item`           → ol/li (grouped)
 *   - Blank line           → paragraph break
 *
 * Anything else is rendered as plain text. We intentionally avoid pulling
 * in a Markdown library for this — the input is small and well-structured.
 */
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let key = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Blank line → skip
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    if (h3) {
      blocks.push(<h3 key={key++} className="text-sm font-semibold mt-4 mb-1.5 first:mt-0 text-foreground">{renderInline(h3[1])}</h3>);
      i++;
      continue;
    }
    if (h2) {
      blocks.push(<h2 key={key++} className="text-base font-bold mt-5 mb-2 first:mt-0 text-foreground border-b border-border/40 pb-1">{renderInline(h2[1])}</h2>);
      i++;
      continue;
    }

    // Numbered list — gather consecutive "N. " lines
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="list-decimal pl-5 space-y-1.5 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet list — gather consecutive bullet lines
    if (/^[\*\-]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\*\-]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[\*\-]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1.5 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph — group consecutive non-blank, non-heading, non-list lines.
    // Preserve internal blank-line breaks as soft line breaks for readability.
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{2,3}\s+/.test(lines[i]) &&
      !/^[\*\-]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="text-sm leading-relaxed text-foreground/90">
        {renderInline(paraLines.join(" "))}
      </p>
    );
  }

  return <div className="space-y-2">{blocks}</div>;
}

/** Render inline Markdown: **bold** → <strong>. */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push(<strong key={key++} className="font-semibold">{m[1]}</strong>);
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}
