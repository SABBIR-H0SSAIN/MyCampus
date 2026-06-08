import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge, Btn, Card, PageHeader, Field, Textarea } from "@/components/ui-bits";
import { Check, X, ZoomIn, Mail, Contact, Loader2 } from "lucide-react";

type Registration = {
  id: number;
  name: string;
  email: string;
  roll_number: string;
  department: string;
  batch: number;
  gender: string;
  registration_status: string;
  student_id_card_url: string;
  rejection_reason: string | null;
  created_at: string;
};

export default function RegistrationsQueue() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-registrations", "pending"],
    queryFn: async () => {
      const res = await api.get("/api/admin/registrations?status=pending");
      
      // If it's the Laravel paginator object
      if (res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
        return res.data.data as Registration[];
      }
      
      // If it's directly an array
      if (Array.isArray(res.data)) {
        return res.data as Registration[];
      }
      
      // If it's something else entirely (e.g. HTML string or object), throw an error so we can see it
      throw new Error("API did not return an array. Raw response: " + JSON.stringify(res.data).substring(0, 200));
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/admin/registrations/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", "pending"] });
      setSelectedId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      await api.post(`/api/admin/registrations/${id}/reject`, { rejection_reason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-registrations", "pending"] });
      setSelectedId(null);
      setRejectionReason("");
    },
  });

  const pendingRegistrations = data || [];
  const selected = pendingRegistrations.find((p) => p.id === selectedId) || null;

  return (
    <div>
      <PageHeader 
        title="Registration approval" 
        description={`${isLoading ? '...' : pendingRegistrations.length} students awaiting verification.`} 
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Queue */}
        <Card className="overflow-hidden flex flex-col h-[640px]">
          <div className="border-b border-border p-3">
            <input placeholder="Search queue…" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </div>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="flex-1 p-4 text-center text-sm text-blood">
              Failed to load registrations. {error?.message}
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="flex-1 p-4 text-center text-sm text-muted-foreground mt-10">Queue is empty.</div>
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {pendingRegistrations.map((p) => (
                <li key={p.id}>
                  <button 
                    onClick={() => setSelectedId(p.id)} 
                    className={`flex w-full items-center gap-3 p-4 text-left transition ${selected?.id === p.id ? "bg-primary-soft/30 dark:bg-primary/10" : "hover:bg-secondary/50"}`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold">
                      {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{p.roll_number} · {p.department}</p>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Detail */}
        {selected ? (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {selected.email}</p>
                </div>
                <Badge variant="warning">Pending review</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-4">
                {[
                  ["Roll", selected.roll_number], 
                  ["Department", selected.department], 
                  ["Batch", selected.batch], 
                  ["Gender", selected.gender]
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border p-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><Contact className="h-4 w-4 text-primary" /> Student ID card</h3>
                <a href={selected.student_id_card_url} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground">
                  <ZoomIn className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="bg-black/5 p-4 flex justify-center">
                {selected.student_id_card_url ? (
                  <img src={selected.student_id_card_url} alt="ID card" className="max-h-80 rounded-md object-contain shadow-sm" />
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">No ID card uploaded</div>
                )}
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <Field label="Rejection Reason (required if rejecting)">
                <Textarea 
                  rows={2} 
                  placeholder="Explain why the registration was rejected..." 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </Field>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Btn 
                  variant="danger" 
                  disabled={rejectMutation.isPending || approveMutation.isPending || !rejectionReason.trim()}
                  onClick={() => rejectMutation.mutate({ id: selected.id, reason: rejectionReason })}
                >
                  <X className="h-4 w-4" /> 
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Btn>
                <Btn 
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => approveMutation.mutate(selected.id)}
                >
                  <Check className="h-4 w-4" /> 
                  {approveMutation.isPending ? "Approving..." : "Approve & verify"}
                </Btn>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-lg text-muted-foreground text-sm">
            Select a student from the queue to review
          </div>
        )}
      </div>
    </div>
  );
}
