import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Download, Star, Bookmark, Plus, Search, Trash2, Edit, X, Upload, ExternalLink
} from "lucide-react";
import { Badge, Btn, Card, PageHeader, Field, Input, Select, Textarea } from "@/components/ui-bits";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  department: string;
  course: string;
  semester: string;
  academic_year: string;
  type: string;
  file_url: string;
  file_name: string;
  size: string;
  external_links: string[];
  uploader: string;
  uploader_id: number;
  uploader_avatar: string;
  postedAt: string;
  selfPosted: boolean;
  rating: number;
  downloads: number;
};

const DEPARTMENTS = [
  "CSE", "EEE", "ME", "CE", "ECE", "IEM", "LE", "TE", "BME", "URP", "Arch", "MSE", "BECM", "Mechatronics"
];
const SEMESTERS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2", "5-1", "5-2"];
const RESOURCE_TYPES = ["All", "Notes", "Slides", "Books", "Past Papers", "Cheatsheets", "Other"];

// ─── Create/Edit Modal ─────────────────────────────────────────────────────────────
function CreateResourceModal({ initialData, onClose, onSuccess }: { initialData?: ResourceItem, onClose: () => void, onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    department: initialData?.department || DEPARTMENTS[0],
    course_code: initialData?.course || "",
    semester: initialData?.semester || SEMESTERS[0],
    academic_year: initialData?.academic_year || "",
    resource_type: initialData?.type || RESOURCE_TYPES[1],
  });
  
  const [links, setLinks] = useState<string[]>(Array.isArray(initialData?.external_links) && initialData.external_links.length ? initialData.external_links : [""]);
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      
      const validLinks = links.filter(l => l.trim() !== "");
      if (validLinks.length > 0) formData.append("external_links", JSON.stringify(validLinks));
      else formData.append("external_links", "null");

      if (file) formData.append("file", file);

      if (initialData) {
        // Laravel handles PUT with FormData via POST + _method=PUT
        formData.append("_method", "PUT");
        await api.post(`/api/resources/${initialData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post('/api/resources', formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      onSuccess();
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{initialData ? "Edit Resource" : "Upload Resource"}</h2>
            <p className="text-sm text-muted-foreground mt-1">Help juniors find their way through your courses.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary transition cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
          <Field label="Title" required>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. OS Process Synchronisation — Full Notes" required />
          </Field>
          <Field label="Description (Optional)">
            <Textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's inside? Covered topics, level of detail…" />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Department" required>
              <Select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Course code" required>
              <Input value={form.course_code} onChange={e => setForm(f => ({ ...f, course_code: e.target.value }))} placeholder="e.g. CSE 3201" required />
            </Field>
            <Field label="Semester" required>
              <Select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} required>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Academic year (Optional)">
              <Input value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} placeholder="e.g. 2024" />
            </Field>
            <Field label="Resource type" required>
              <Select value={form.resource_type} onChange={e => setForm(f => ({ ...f, resource_type: e.target.value }))} required>
                {RESOURCE_TYPES.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="External links (Optional)">
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input type="url" value={link} onChange={e => {
                    const newLinks = [...links];
                    newLinks[i] = e.target.value;
                    setLinks(newLinks);
                  }} placeholder="e.g. https://drive.google.com/…" />
                  {links.length > 1 && (
                    <button type="button" onClick={() => setLinks(links.filter((_, idx) => idx !== i))} className="p-2 text-muted-foreground hover:text-blood rounded-md transition cursor-pointer">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <Btn type="button" variant="outline" size="sm" onClick={() => setLinks([...links, ""])} className="cursor-pointer text-xs mt-1">
                + Add another link
              </Btn>
            </div>
          </Field>

          <Field label="File upload (Required)" hint="PDF, PPTX, DOCX, ZIP — up to 50 MB">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition">
              <Upload className="h-5 w-5" />
              <div className="text-center">
                <span className="font-semibold text-primary">Click to browse</span> or drag and drop
                {file && <p className="mt-2 text-xs text-foreground font-mono bg-secondary px-2 py-1 rounded">{file.name}</p>}
                {!file && initialData?.file_name && <p className="mt-2 text-xs text-foreground font-mono bg-secondary px-2 py-1 rounded">Current: {initialData.file_name}</p>}
              </div>
              <input type="file" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar,.txt" required={!initialData} />
            </label>
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" type="button" onClick={onClose} className="cursor-pointer">Cancel</Btn>
            <Btn type="submit" variant="primary" disabled={mutation.isPending} className="cursor-pointer">
              {mutation.isPending ? "Saving..." : initialData ? "Save Changes" : "Publish resource"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Details Modal ─────────────────────────────────────────────────────────────
function ResourceDetailsModal({ item, onClose }: { item: ResourceItem, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="primary">{item.type}</Badge>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary transition cursor-pointer"><X className="h-5 w-5" /></button>
        </div>
        
        <h2 className="text-xl font-bold">{item.title}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span>{item.course}</span> · <span>{item.department}</span> · <span>{item.semester}</span>
          {item.academic_year && <span> · {item.academic_year}</span>}
        </div>
        
        <div className="flex items-center gap-3 mt-5 p-3 rounded-lg bg-secondary/50 border border-border">
          <Link to={`/app/profile/${item.uploader_id}`} className="shrink-0 hover:opacity-80 transition-opacity">
            <img src={item.uploader_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/app/profile/${item.uploader_id}`} className="text-sm font-semibold truncate hover:underline block">{item.uploader}</Link>
            <p className="text-xs text-muted-foreground">{item.postedAt}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1 justify-end"><Star className="h-3 w-3 fill-warning text-warning" /> {item.rating}</div>
            <div className="flex items-center gap-1 justify-end"><Download className="h-3 w-3" /> {item.downloads}</div>
          </div>
        </div>

        {item.description && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-1">Description</h3>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {Array.isArray(item.external_links) && item.external_links.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-2">External Links</h3>
            <div className="flex flex-col gap-2">
              {item.external_links.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1.5 break-all">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {link}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border flex justify-end gap-3 items-center">
          <p className="text-xs font-mono text-muted-foreground mr-auto">{item.size}</p>
          {item.file_url ? (
            <a href={item.file_url} target="_blank" rel="noreferrer" download>
              <Btn className="cursor-pointer gap-2"><Download className="h-4 w-4" /> Download File</Btn>
            </a>
          ) : (
            <Btn disabled>No file attached</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ResourceHub() {
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All departments");
  const [filterSemester, setFilterSemester] = useState("All semesters");
  const [filterType, setFilterType] = useState("All");
  const [filterTab, setFilterTab] = useState<"all" | "my">("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [viewItem, setViewItem] = useState<ResourceItem | null>(null);

  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery<ResourceItem[]>({
    queryKey: ['resources', search, filterDept, filterSemester, filterType],
    queryFn: async () => {
      const res = await api.get('/api/resources', {
        params: {
          search,
          department: filterDept,
          semester: filterSemester,
          resource_type: filterType
        }
      });
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/resources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] })
  });

  const filtered = useMemo(() => {
    let data = items;
    if (filterTab === "my") data = data.filter(i => i.selfPosted);
    return data;
  }, [items, filterTab]);

  return (
    <div className="space-y-5">
      <PageHeader title="Study Resources" description="Notes, slides, books, past papers — curated by course code.">
        <Btn size="sm" onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer"><Plus className="h-4 w-4 mr-1.5" /> Upload</Btn>
      </PageHeader>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setFilterTab("all")} 
          className={cn("px-4 py-3 text-sm font-medium transition cursor-pointer", filterTab === "all" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          All Resources
        </button>
        <button 
          onClick={() => setFilterTab("my")} 
          className={cn("px-4 py-3 text-sm font-medium transition cursor-pointer", filterTab === "my" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          My Resources
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by course code, title…" 
            className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" 
          />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="h-10 rounded-md border border-input bg-surface px-3 text-sm cursor-pointer outline-none focus:border-primary">
          <option>All departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} className="h-10 rounded-md border border-input bg-surface px-3 text-sm cursor-pointer outline-none focus:border-primary">
          <option>All semesters</option>
          {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {RESOURCE_TYPES.map((t) => (
          <button 
            key={t} 
            onClick={() => setFilterType(t)}
            className={cn("rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition cursor-pointer", filterType === t ? "border-primary bg-primary text-primary-foreground font-semibold" : "border-border bg-surface text-muted-foreground hover:text-foreground")}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary/50 animate-pulse border border-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No resources found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} onClick={() => setViewItem(r)} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition hover:border-primary/40 relative cursor-pointer">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">{r.type}</Badge>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.course} · {r.department} · {r.semester} {r.academic_year && `· ${r.academic_year}`}</span>
                  </div>
                  <h3 className="mt-1 truncate text-sm font-semibold">{r.title}</h3>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Link to={`/app/profile/${r.uploader_id}`} onClick={e => e.stopPropagation()} className="shrink-0 hover:opacity-80 transition-opacity">
                      <img src={r.uploader_avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                    </Link>
                    <Link to={`/app/profile/${r.uploader_id}`} onClick={e => e.stopPropagation()} className="truncate hover:underline">
                      {r.uploader}
                    </Link>
                    <span className="mx-1">•</span>
                    <span>{r.size}</span>
                    <span className="mx-1">•</span>
                    <span>{r.postedAt}</span>
                  </div>
                  {r.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{r.description}</p>}
                </div>
              </div>
              
              <div className="flex shrink-0 items-center justify-between sm:justify-end gap-4 text-xs text-muted-foreground mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating}</span>
                  <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {r.downloads}</span>
                  <button onClick={e => e.stopPropagation()} className="hover:text-primary cursor-pointer transition" aria-label="Bookmark"><Bookmark className="h-4 w-4" /></button>
                </div>
                
                <div className="flex items-center gap-2">
                  {r.selfPosted && (
                    <>
                      <button onClick={e => { e.stopPropagation(); setEditingItem(r); }} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteMutation.mutate(r.id); }} className="p-2 text-blood hover:bg-blood/10 rounded-md transition cursor-pointer mr-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {r.file_url ? (
                    <a href={r.file_url} target="_blank" rel="noreferrer" download onClick={e => e.stopPropagation()}>
                      <Btn size="sm" className="cursor-pointer">Download</Btn>
                    </a>
                  ) : (
                    <Btn size="sm" variant="outline" disabled onClick={e => e.stopPropagation()}>No file</Btn>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isCreateModalOpen && <CreateResourceModal onClose={() => setIsCreateModalOpen(false)} onSuccess={() => setIsCreateModalOpen(false)} />}
      {editingItem && <CreateResourceModal initialData={editingItem} onClose={() => setEditingItem(null)} onSuccess={() => setEditingItem(null)} />}
      {viewItem && <ResourceDetailsModal item={viewItem} onClose={() => setViewItem(null)} />}
    </div>
  );
}
