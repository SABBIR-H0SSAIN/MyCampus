import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Plus, MapPin, Calendar, CheckCircle, Eye, 
  Trash2, X, SlidersHorizontal, PackageSearch, ImagePlus, Phone, ShieldCheck, Flag
} from "lucide-react";
import { Badge, Btn, Card, PageHeader, Field, Input, Select, Textarea } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type LostFoundItem = {
  id: string;
  type: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  images: string[];
  status: "active" | "resolved";
  reporter: string;
  reporterAvatar: string;
  reporterRoll: string;
  department: string;
  phone: string;
  selfPosted: boolean;
  postedAt: string;
};

const CATEGORIES = [
  "Student ID", "Mobile", "Laptop", "Wallet", "Keys", 
  "Calculator", "Books", "Documents", "Accessories", "Other"
];

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateReportModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    type: "lost" as "lost" | "found",
    title: "",
    category: CATEGORIES[0],
    description: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images[]', img));
      await api.post('/api/lost-found', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-found'] });
      onSuccess();
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Report an Item</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">
          <div className="flex gap-4">
            <label className={cn("flex-1 cursor-pointer rounded-xl border-2 p-4 text-center transition", form.type === "lost" ? "border-blood bg-blood/10 text-blood" : "border-border hover:bg-secondary")}>
              <input type="radio" className="sr-only" checked={form.type === "lost"} onChange={() => setForm(f => ({ ...f, type: "lost" }))} />
              <PackageSearch className="mx-auto mb-2 h-6 w-6" />
              <div className="font-semibold">I Lost Something</div>
            </label>
            <label className={cn("flex-1 cursor-pointer rounded-xl border-2 p-4 text-center transition", form.type === "found" ? "border-success bg-success/10 text-success" : "border-border hover:bg-secondary")}>
              <input type="radio" className="sr-only" checked={form.type === "found"} onChange={() => setForm(f => ({ ...f, type: "found" }))} />
              <CheckCircle className="mx-auto mb-2 h-6 w-6" />
              <div className="font-semibold">I Found Something</div>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Item Name" required>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Black Wallet, Calculator" required />
            </Field>
            <Field label="Category" required>
              <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Description" required>
            <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Provide specific details like color, brand, or distinct marks..." required />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={form.type === "lost" ? "Last Seen Location" : "Found Location"} required>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Central Library, CSE Building" required />
            </Field>
            <Field label={form.type === "lost" ? "Date Lost" : "Date Found"} required>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required max={new Date().toISOString().split('T')[0]} />
            </Field>
          </div>

          <Field label="Images (Optional)">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previews.length < 3 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/50 text-muted-foreground hover:bg-secondary transition">
                  <ImagePlus className="mb-2 h-6 w-6" />
                  <span className="text-xs font-medium">Add Photo</span>
                </button>
              )}
            </div>
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" type="button" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : form.type === "lost" ? "Post Lost Report" : "Post Found Report"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, onUpdateStatus, onDelete }: { 
  item: LostFoundItem; 
  onClose: () => void;
  onUpdateStatus: (id: string, status: "active" | "resolved") => void;
  onDelete: (id: string) => void;
}) {
  const isResolved = item.status === "resolved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Image */}
        <div className="w-full md:w-2/5 bg-secondary relative min-h-[250px]">
          {item.images.length > 0 ? (
            <img src={item.images[0]} alt="" className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30">
              <PackageSearch className="h-16 w-16 mb-2" />
              <p className="text-sm font-medium">No Image Provided</p>
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant={item.type === "lost" ? "blood" : "success"} className="shadow-lg backdrop-blur-md">
              {item.type === "lost" ? "LOST" : "FOUND"}
            </Badge>
            {isResolved && <Badge variant="primary" className="shadow-lg backdrop-blur-md">RESOLVED</Badge>}
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-3/5 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.category}</p>
              <h2 className="text-2xl font-bold">{item.title}</h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md">
              <MapPin className="h-4 w-4" /> {item.location}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-md">
              <Calendar className="h-4 w-4" /> {item.date}
            </div>
          </div>

          <div className="mb-6 flex-1">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="mt-auto space-y-4 pt-4 border-t border-border">
            {/* Reporter Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={item.reporterAvatar} alt="" className="h-10 w-10 rounded-full border-2 border-border bg-secondary object-cover" />
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    {item.reporter}
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">{item.reporterRoll} · {item.department}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {item.selfPosted ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {!isResolved && (
                  <Btn variant="outline" className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" onClick={() => { onUpdateStatus(item.id, "resolved"); onClose(); }}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark Resolved
                  </Btn>
                )}
                <Btn variant="outline" className="text-blood border-blood/30 bg-blood/5 hover:bg-blood/10" onClick={() => { onDelete(item.id); onClose(); }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Report
                </Btn>
              </div>
            ) : (
              !isResolved && (
                <a href={`tel:${item.phone}`} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
                  <Phone className="h-4 w-4" /> Call {item.type === "lost" ? "Owner" : "Finder"} ({item.phone})
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function LostAndFound() {
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found" | "my">("all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<LostFoundItem | null>(null);

  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery<LostFoundItem[]>({
    queryKey: ['lost-found'],
    queryFn: async () => {
      const res = await api.get('/api/lost-found');
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/api/lost-found/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lost-found'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/lost-found/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lost-found'] })
  });

  const filtered = useMemo(() => {
    let data = items;
    if (activeTab === "lost") data = data.filter(i => i.type === "lost");
    if (activeTab === "found") data = data.filter(i => i.type === "found");
    if (activeTab === "my") data = data.filter(i => i.selfPosted);
    if (selectedCategory !== "All") data = data.filter(i => i.category === selectedCategory);
    if (search.trim()) data = data.filter(i => 
      i.title.toLowerCase().includes(search.toLowerCase()) || 
      i.description.toLowerCase().includes(search.toLowerCase())
    );
    return data;
  }, [items, activeTab, search, selectedCategory]);

  return (
    <div className="space-y-5">
      <PageHeader title="Lost & Found" description="Report lost items or help return found items to their owners.">
        <Btn size="sm" onClick={() => setIsCreateModalOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Report Item</Btn>
      </PageHeader>

      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {(["all", "lost", "found", "my"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition whitespace-nowrap", activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}>
            {tab === "all" ? "All Items" : tab === "lost" ? "Lost Items" : tab === "found" ? "Found Items" : "My Reports"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items, locations..." className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
        </div>
        <button onClick={() => setShowFilters(v => !v)} className={cn("flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition", showFilters ? "border-primary bg-primary-soft text-primary" : "border-input bg-surface text-muted-foreground hover:text-foreground")}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {selectedCategory !== "All" && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">1</span>}
        </button>
      </div>

      {showFilters && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">Category</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedCategory("All")} className={cn("rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition", selectedCategory === "All" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground")}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)} className={cn("rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition", selectedCategory === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground")}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-secondary/50 animate-pulse border border-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
          {filtered.map(item => (
            <Card key={item.id} className="overflow-hidden flex flex-col group cursor-pointer hover:border-primary/30 transition" onClick={() => setDetailItem(item)}>
              <div className="h-40 bg-secondary relative">
                {item.images.length > 0 ? (
                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <PackageSearch className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant={item.type === "lost" ? "blood" : "success"} className="shadow-sm backdrop-blur-md">
                    {item.type === "lost" ? "LOST" : "FOUND"}
                  </Badge>
                  {item.status === "resolved" && <Badge variant="primary" className="shadow-sm backdrop-blur-md">RESOLVED</Badge>}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
                  <p className="text-[10px] text-muted-foreground">{item.postedAt}</p>
                </div>
                <h3 className="font-semibold text-base mb-1 line-clamp-1">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{item.location}</span>
                </div>
                
                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={item.reporterAvatar} alt="" className="h-6 w-6 rounded-full bg-secondary object-cover" />
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">{item.reporter}</span>
                  </div>
                  <Btn variant="outline" size="sm" className="h-7 text-[10px] px-2 rounded-md">
                    View <Eye className="h-3 w-3 ml-1" />
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isCreateModalOpen && <CreateReportModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => setIsCreateModalOpen(false)} />}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onUpdateStatus={(id, status) => updateStatusMutation.mutate({ id, status })} onDelete={id => deleteMutation.mutate(id)} />}
    </div>
  );
}
