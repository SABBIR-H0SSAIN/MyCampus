import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Card, Badge, Btn } from "@/components/ui-bits";
import { Flag, Trash2, Check, X, ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminReports() {
  const [filter, setFilter] = useState("all"); // 'all', 'open', 'resolved', 'dismissed'
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", filter],
    queryFn: async () => {
      const res = await api.get("/api/admin/reports", {
        params: { status: filter === "all" ? undefined : filter }
      });
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await api.put(`/api/admin/reports/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Report status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast.error("Failed to update report status.");
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete(`/api/admin/reports/${id}/item`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Reported post removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast.error("Failed to remove reported post.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/reports/${id}`);
    },
    onSuccess: () => {
      toast.success("Report log deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: () => {
      toast.error("Failed to delete report log.");
    }
  });

  const handleRemovePost = (report: any) => {
    const title = report.item?.title || "this item";
    if (window.confirm(`Are you sure you want to permanently delete the reported post "${title}" from the platform?\n\nThis will remove the content and mark this report as resolved.`)) {
      removeItemMutation.mutate(report.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader 
          title="Content Reports" 
          description="Review, moderate, inspect, and remove content reported by students." 
        />
        <div className="flex gap-1.5 p-1 bg-surface rounded-xl border border-border">
          {['all', 'open', 'resolved', 'dismissed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-8 px-3 text-xs font-medium rounded-lg transition-all cursor-pointer",
                filter === f 
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center animate-pulse text-muted-foreground">
            Loading reports...
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="h-10 w-10 text-muted-foreground/50 stroke-[1.5]" />
            <div className="font-medium text-foreground">No reports found</div>
            <div className="text-sm text-muted-foreground">
              {filter === 'all' 
                ? "Your platform is clean! No content has been reported." 
                : `There are no ${filter} reports to display.`}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {data.data.map((report: any) => (
              <div key={report.id} className="p-5 flex flex-col xl:flex-row xl:items-start justify-between gap-5">
                {/* Left info column */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-0.5 rounded-xl bg-blood/10 p-2 text-blood shrink-0 border border-blood/20">
                    <Flag className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-foreground">{report.reason}</h4>
                      <Badge variant={
                        report.status === 'open' ? 'blood' : 
                        report.status === 'resolved' ? 'success' : 'outline'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    
                    {report.description && (
                      <div className="rounded-xl bg-secondary/50 p-3 text-xs text-foreground/90 border border-border/50">
                        <span className="font-semibold text-muted-foreground mr-1">Report note:</span>
                        "{report.description}"
                      </div>
                    )}

                    {/* Reported Target Item Card */}
                    {report.item && (
                      <div className="rounded-xl border border-border bg-surface-2/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                {report.item.type.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              {!report.item.exists && (
                                <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground italic border border-border">
                                  Content Removed
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                              {report.item.title}
                            </p>
                            {report.item.author && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Posted by <span className="font-medium text-foreground">{report.item.author}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* View Post Button */}
                        {report.item.exists && report.item.url && (
                          <Link
                            to={report.item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 h-8.5 rounded-xl border border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary transition hover:bg-primary/20 hover:border-primary/50 cursor-pointer shadow-2xs"
                          >
                            <span>View Post</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      <div>
                        <span className="font-medium">Reporter:</span> {report.reporter?.name}
                      </div>
                      <div>
                        <span className="font-medium">Reported:</span> {report.created_at}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons — Consistent styling, size, and layout */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-border">
                  {/* Remove Post Button (Danger / Blood) */}
                  {report.item?.exists && (
                    <Btn
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemovePost(report)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{removeItemMutation.isPending ? "Removing..." : "Remove Post"}</span>
                    </Btn>
                  )}

                  {/* Resolve and Dismiss for open reports */}
                  {report.status === 'open' ? (
                    <>
                      <Btn 
                        size="sm" 
                        variant="default"
                        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Resolve</span>
                      </Btn>
                      <Btn 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'dismissed' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Dismiss</span>
                      </Btn>
                    </>
                  ) : (
                    <Btn
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(report.id)}
                      disabled={deleteMutation.isPending}
                      className="text-muted-foreground hover:text-blood hover:border-blood/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Log</span>
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


