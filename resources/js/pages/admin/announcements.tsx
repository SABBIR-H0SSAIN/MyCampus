import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pin, Pencil, Trash2, Plus, X, Loader2, AlertCircle,
  Megaphone, Clock, CheckCircle2,
} from "lucide-react";
import {
  Badge, Btn, Card, Field, Input, PageHeader, Select, Textarea,
} from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Announcement = {
  id: string;
  title: string;
  body: string;
  category: "Academic" | "Event" | "Club" | "Emergency";
  isPinned: boolean;
  publishedAt: string | null;
  author: string;
  createdAt: string;
  isScheduled: boolean;
};

type FormState = {
  title: string;
  body: string;
  category: string;
  is_pinned: boolean;
  published_at: string;
};

const BLANK_FORM: FormState = {
  title: "",
  body: "",
  category: "Academic",
  is_pinned: false,
  published_at: "",
};

type Category = "All" | "Academic" | "Event" | "Club" | "Emergency";

const CATEGORIES: Category[] = ["All", "Academic", "Event", "Club", "Emergency"];

const CATEGORY_BADGE_VARIANT: Record<string, "primary" | "warning" | "blood" | "success" | "info"> = {
  Academic:  "primary",
  Event:     "warning",
  Club:      "success",
  Emergency: "blood",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();

  // Filter state
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery<Announcement[]>({
    queryKey: ["admin-announcements", activeCategory],
    queryFn: async () => {
      const params = activeCategory !== "All" ? `?category=${activeCategory}` : "";
      const res = await api.get(`/api/admin/announcements${params}`);
      return res.data;
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });

  const createMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      await api.post("/api/admin/announcements", {
        ...payload,
        published_at: payload.published_at || null,
      });
    },
    onSuccess: () => { invalidate(); closeForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormState }) => {
      await api.put(`/api/admin/announcements/${id}`, {
        ...payload,
        published_at: payload.published_at || null,
      });
    },
    onSuccess: () => { invalidate(); closeForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/announcements/${id}`);
    },
    onSuccess: () => { invalidate(); setConfirmDeleteId(null); },
  });

  const pinMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/announcements/${id}/toggle-pin`);
    },
    onSuccess: () => invalidate(),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setForm(BLANK_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: Announcement) {
    setForm({
      title:        a.title,
      body:         a.body,
      category:     a.category,
      is_pinned:    a.isPinned,
      published_at: a.publishedAt ?? "",
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(BLANK_FORM);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Publish, pin, schedule, and manage platform announcements."
        children={
          <Btn onClick={showForm ? closeForm : openCreate} variant={showForm ? "outline" : "primary"}>
            {showForm ? (
              <><X className="h-4 w-4" /> Cancel</>
            ) : (
              <><Plus className="h-4 w-4" /> New Announcement</>
            )}
          </Btn>
        }
      />

      {/* Category filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <Card className="mb-6 p-6">
          <h3 className="mb-4 text-sm font-semibold">
            {editingId ? "Edit Announcement" : "Compose Announcement"}
          </h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Title" required>
              <Input
                id="ann-title"
                placeholder="e.g. Library extended hours during finals"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Category" required>
                <Select
                  id="ann-category"
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option>Academic</option>
                  <option>Event</option>
                  <option>Club</option>
                  <option>Emergency</option>
                </Select>
              </Field>

              <Field label="Scheduled Publish Date" hint="Leave blank to publish now">
                <Input
                  id="ann-schedule"
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                />
              </Field>

              <Field label="Options">
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-input bg-surface px-3 text-sm select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={form.is_pinned}
                    onChange={(e) => setForm((f) => ({ ...f, is_pinned: e.target.checked }))}
                  />
                  Pin to top
                </label>
              </Field>
            </div>

            <Field label="Body" required>
              <Textarea
                id="ann-body"
                rows={5}
                required
                placeholder="Write the full announcement content here…"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </Field>

            {/* Form error */}
            {(createMutation.isError || updateMutation.isError) && (
              <p className="flex items-center gap-2 text-sm text-blood">
                <AlertCircle className="h-4 w-4" />
                Something went wrong. Please try again.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Btn variant="outline" type="button" onClick={closeForm}>
                Cancel
              </Btn>
              <Btn type="submit" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                ) : editingId ? (
                  <><CheckCircle2 className="h-4 w-4" /> Save Changes</>
                ) : (
                  <><Megaphone className="h-4 w-4" /> Publish</>
                )}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="text-sm">Loading announcements…</span>
        </div>
      )}

      {/* ── Error ── */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blood/30 bg-blood/5 py-16 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-blood" />
          <p className="text-sm font-medium">Failed to load announcements.</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !isError && data?.length === 0 && (
        <div className="grid place-items-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
            <Megaphone className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold">No announcements yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Click "New Announcement" to publish your first one.
          </p>
        </div>
      )}

      {/* ── Announcement List ── */}
      {!isLoading && data && data.length > 0 && (
        <div className="space-y-3">
          {data.map((a) => (
            <Card key={a.id} className={cn("p-5", a.isPinned && "ring-1 ring-primary/20")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={CATEGORY_BADGE_VARIANT[a.category] ?? "info"}>
                      {a.category}
                    </Badge>
                    {a.isPinned && (
                      <Badge variant="primary">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </Badge>
                    )}
                    {a.isScheduled && (
                      <Badge variant="outline">
                        <Clock className="h-2.5 w-2.5" /> Scheduled
                      </Badge>
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {a.createdAt} · {a.author}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{a.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
                </div>

                {/* Right: action buttons */}
                <div className="flex shrink-0 items-center gap-1">
                  {/* Pin/Unpin */}
                  <button
                    onClick={() => pinMutation.mutate(a.id)}
                    disabled={pinMutation.isPending}
                    title={a.isPinned ? "Unpin" : "Pin to top"}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-md border border-border bg-background transition-colors",
                      a.isPinned
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:border-primary hover:text-primary",
                    )}
                  >
                    <Pin className="h-4 w-4" />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(a)}
                    title="Edit"
                    className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setConfirmDeleteId(a.id)}
                    title="Delete"
                    className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-blood/50 hover:text-blood"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {confirmDeleteId && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          {/* Dialog */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-blood/10 text-blood">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">Delete Announcement?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This action cannot be undone. The announcement will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Btn
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Btn>
              <Btn
                variant="danger"
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
                ) : (
                  "Delete"
                )}
              </Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
