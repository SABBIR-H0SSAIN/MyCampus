import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Card, Badge, Btn } from "@/components/ui-bits";
import { Flag, Trash2, Check, X, ShieldAlert, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

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
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/reports/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader 
          title="Content Reports" 
          description="Review and manage content reported by users." 
        />
        <div className="flex gap-2">
          {['all', 'open', 'resolved', 'dismissed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === f 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-surface text-muted-foreground border border-border hover:bg-secondary"
              }`}
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
              <div key={report.id} className="p-5 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-center gap-3 md:items-start flex-1 min-w-0">
                  <div className="mt-0.5 rounded-full bg-blood/10 p-2 text-blood shrink-0">
                    <Flag className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold truncate">{report.reason}</h4>
                      <Badge variant={
                        report.status === 'open' ? 'blood' : 
                        report.status === 'resolved' ? 'success' : 'outline'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    
                    {report.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        "{report.description}"
                      </p>
                    )}
                    
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Reporter:</span> {report.reporter?.name}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {report.created_at}
                      </div>
                      {report.item && (
                        <div className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5">
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          <span className="font-medium">Target:</span> {report.item.type} 
                          <span className="truncate max-w-[150px] inline-block align-bottom ml-1">
                            {report.item.title !== 'Unknown' ? `(${report.item.title})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-end">
                  {report.status === 'open' && (
                    <>
                      <Btn 
                        size="sm" 
                        className="w-full md:w-auto"
                        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'resolved' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Resolve
                      </Btn>
                      <Btn 
                        size="sm" 
                        variant="outline" 
                        className="w-full md:w-auto"
                        onClick={() => updateStatusMutation.mutate({ id: report.id, status: 'dismissed' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Dismiss
                      </Btn>
                    </>
                  )}
                  {report.status !== 'open' && (
                    <button
                      onClick={() => deleteMutation.mutate(report.id)}
                      disabled={deleteMutation.isPending}
                      className="text-xs text-blood hover:underline flex items-center gap-1 px-2 py-1 mt-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" /> Delete log
                    </button>
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
