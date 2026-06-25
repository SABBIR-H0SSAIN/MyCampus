import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Droplet, Phone, MapPin, Calendar, Plus, X, ShieldCheck, Trash2, Edit, CheckCircle, Clock
} from "lucide-react";
import { Badge, Btn, Card, PageHeader, Field, Input, Select, Textarea } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type BloodDonationResponse = {
  id: number;
  name: string;
  roll_number: string;
  phone: string;
  blood_group: string;
  avatar: string;
};

type BloodRequestItem = {
  id: string;
  blood_group: string;
  units: number;
  hospital: string;
  date_time: string;
  contact: string;
  priority: "Standard" | "Emergency";
  notes: string;
  status: "Active" | "Resolved";
  postedAt: string;
  selfPosted: boolean;
  reporter: string;
  responses: BloodDonationResponse[];
  hasResponded: boolean;
};

const BLOOD_GROUPS = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];

// ─── Create/Edit Modal ─────────────────────────────────────────────────────────────
function CreateRequestModal({ initialData, onClose, onSuccess }: { initialData?: BloodRequestItem, onClose: () => void, onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    blood_group: initialData?.blood_group || BLOOD_GROUPS[0],
    units: initialData?.units || 1,
    hospital: initialData?.hospital || "",
    date_time: initialData?.date_time ? initialData.date_time.slice(0, 16) : "",
    contact: initialData?.contact || "",
    priority: initialData?.priority || "Standard",
    notes: initialData?.notes || "",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (initialData) {
        await api.put(`/api/blood-requests/${initialData.id}`, form);
      } else {
        await api.post('/api/blood-requests', form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blood-requests'] });
      onSuccess();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{initialData ? "Edit Blood Request" : "New Blood Request"}</h2>
            <p className="text-sm text-muted-foreground mt-1">Reach verified KUET donors instantly.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary transition cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Blood group" required>
              <Select value={form.blood_group} onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))} required>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </Select>
            </Field>
            <Field label="Units required" required>
              <Input type="number" min={1} value={form.units} onChange={e => setForm(f => ({ ...f, units: parseInt(e.target.value) || 1 }))} required />
            </Field>
            <Field label="Hospital / Location" required>
              <Input value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))} placeholder="e.g. Khulna Medical College Hospital" required />
            </Field>
            <Field label="Required date/time" required>
              <Input type="datetime-local" value={form.date_time} onChange={e => setForm(f => ({ ...f, date_time: e.target.value }))} required />
            </Field>
            <Field label="Contact number" required>
              <Input type="tel" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="e.g. 017XXXXXXXX" required />
            </Field>
            <Field label="Priority" required>
              <Select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as "Standard" | "Emergency" }))} required>
                <option value="Standard">Standard</option>
                <option value="Emergency">Emergency</option>
              </Select>
            </Field>
          </div>
          <Field label="Additional notes (Optional)">
            <Textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Patient context, surgery info, etc." />
          </Field>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" type="button" onClick={onClose} className="cursor-pointer">Cancel</Btn>
            <Btn type="submit" variant="blood" disabled={mutation.isPending} className="cursor-pointer">
              {mutation.isPending ? "Saving..." : initialData ? "Save Changes" : "Post request"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Responses Modal ──────────────────────────────────────────────────────────────
function ResponsesModal({ item, onClose }: { item: BloodRequestItem, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Volunteers ({item.responses.length})</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary transition cursor-pointer"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {item.responses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <Droplet className="h-10 w-10 mx-auto mb-3 opacity-20" />
              No one has volunteered yet.
            </div>
          ) : (
            item.responses.map(resp => (
              <div key={resp.id} className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-3">
                  <img src={resp.avatar} alt="" className="h-10 w-10 rounded-full border-2 border-border object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      {resp.name}
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">Roll: {resp.roll_number}</p>
                  </div>
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-blood/10 text-blood font-bold font-mono text-xs">
                    {resp.blood_group}
                  </div>
                </div>
                <a href={`tel:${resp.phone}`} className="flex items-center justify-center gap-2 rounded-md bg-background border border-border py-2 text-xs font-medium hover:bg-secondary transition cursor-pointer">
                  <Phone className="h-3.5 w-3.5" /> Call {resp.phone}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function BloodNetwork() {
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterTab, setFilterTab] = useState<"all" | "my">("all");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BloodRequestItem | null>(null);
  const [responsesItem, setResponsesItem] = useState<BloodRequestItem | null>(null);

  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery<BloodRequestItem[]>({
    queryKey: ['blood-requests'],
    queryFn: async () => {
      const res = await api.get('/api/blood-requests');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const donateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/blood-requests/${id}/donate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blood-requests'] })
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/api/blood-requests/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blood-requests'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/blood-requests/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blood-requests'] })
  });

  const filtered = useMemo(() => {
    let data = items;
    if (filterTab === "my") data = data.filter(i => i.selfPosted);
    if (filterGroup !== "All") data = data.filter(i => i.blood_group === filterGroup);
    return data;
  }, [items, filterTab, filterGroup]);

  return (
    <div className="space-y-5">
      <PageHeader title="Blood Network" description="Active requests from verified KUET students.">
        <Btn size="sm" variant="blood" onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer"><Plus className="h-4 w-4 mr-1.5" /> New request</Btn>
      </PageHeader>

      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        <button onClick={() => setFilterTab("all")} className={cn("px-4 py-2.5 text-sm font-medium transition whitespace-nowrap cursor-pointer", filterTab === "all" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>All Requests</button>
        <button onClick={() => setFilterTab("my")} className={cn("px-4 py-2.5 text-sm font-medium transition whitespace-nowrap cursor-pointer", filterTab === "my" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>My Requests</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterGroup("All")} className={cn("rounded-full border px-3 py-1.5 font-mono text-[11px] transition cursor-pointer", filterGroup === "All" ? "border-primary bg-primary text-primary-foreground font-semibold" : "border-border bg-surface font-semibold text-foreground hover:border-primary/50")}>All</button>
        {BLOOD_GROUPS.map(g => (
          <button key={g} onClick={() => setFilterGroup(g)} className={cn("rounded-full border px-3 py-1.5 font-mono text-[11px] transition cursor-pointer", filterGroup === g ? "border-blood bg-blood text-blood-foreground font-semibold" : "border-border bg-surface font-semibold text-foreground hover:border-blood hover:text-blood")}>{g}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-secondary/50 animate-pulse border border-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Droplet className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No active blood requests</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((b) => {
            const isEmergency = b.priority === "Emergency";
            const isResolved = b.status === "Resolved";

            return (
              <Card key={b.id} className={cn("overflow-hidden flex flex-col", isEmergency && !isResolved ? "border-blood/40 bg-blood/5" : "", isResolved ? "opacity-60 grayscale-[0.5]" : "")}>
                <div className="flex items-start gap-4 p-5 flex-1">
                  <div className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-xl text-lg font-bold font-mono", isEmergency && !isResolved ? "bg-blood text-blood-foreground" : "bg-blood/10 text-blood")}>
                    {b.blood_group}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isEmergency && !isResolved && <Badge variant="blood">URGENT</Badge>}
                      {isResolved ? <Badge variant="primary">RESOLVED</Badge> : <Badge variant="success">ACTIVE</Badge>}
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {b.postedAt}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold">{b.units} unit{b.units > 1 ? "s" : ""} needed</h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {b.hospital}</p>
                      <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(b.date_time).toLocaleString()}</p>
                    </div>
                    {b.notes && <p className="text-xs italic text-foreground/80 line-clamp-2">"{b.notes}"</p>}
                    
                    <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Posted by <span className="font-medium text-foreground">{b.selfPosted ? "You" : b.reporter}</span></span>
                    </div>
                  </div>
                </div>
                
                {/* Actions Footer */}
                {b.selfPosted ? (
                  <div className="grid grid-cols-2 border-t border-border/50 divide-x divide-border/50 bg-background/50">
                    <button onClick={() => setResponsesItem(b)} className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-primary hover:bg-secondary cursor-pointer transition">
                      View Donors ({b.responses.length})
                    </button>
                    {!isResolved ? (
                      <div className="flex">
                        <button onClick={() => setEditingItem(b)} className="flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition">
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button onClick={() => updateStatusMutation.mutate({ id: b.id, status: "Resolved" })} className="flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-medium text-success hover:bg-secondary cursor-pointer transition border-l border-border/50">
                          <CheckCircle className="h-3.5 w-3.5" /> Resolve
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => deleteMutation.mutate(b.id)} className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-blood hover:bg-secondary cursor-pointer transition">
                        <Trash2 className="h-3.5 w-3.5" /> Delete Request
                      </button>
                    )}
                  </div>
                ) : (
                  !isResolved && (
                    <div className="grid grid-cols-2 border-t border-border">
                      <a href={`tel:${b.contact}`} className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-muted-foreground hover:bg-secondary cursor-pointer transition">
                        <Phone className="h-3.5 w-3.5" /> {b.contact}
                      </a>
                      <button 
                        onClick={() => donateMutation.mutate(b.id)}
                        disabled={donateMutation.isPending}
                        className={cn("flex items-center justify-center gap-2 py-3 text-xs font-semibold transition cursor-pointer", b.hasResponded ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-blood text-blood-foreground hover:opacity-90")}
                      >
                        <Droplet className="h-3.5 w-3.5" /> {b.hasResponded ? "Withdraw Offer" : "I can donate"}
                      </button>
                    </div>
                  )
                )}
              </Card>
            );
          })}
        </div>
      )}

      {isCreateModalOpen && <CreateRequestModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => setIsCreateModalOpen(false)} />}
      {editingItem && <CreateRequestModal initialData={editingItem} onClose={() => setEditingItem(null)} onSuccess={() => setEditingItem(null)} />}
      {responsesItem && <ResponsesModal item={responsesItem} onClose={() => setResponsesItem(null)} />}
    </div>
  );
}
