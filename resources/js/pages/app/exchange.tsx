import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, Btn, Card, PageHeader, Field, Input, Textarea } from "@/components/ui-bits";
import { ArrowLeftRight, Plus, Edit3, Trash2, Phone, X, MessageSquare, CheckCircle, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useOpenFromSearchParam } from "@/hooks/useOpenFromSearchParam";
import { ReportModal } from "@/components/ReportModal";

// --- Types ---
type ResponseItem = {
  id: string;
  responderName: string;
  responderAvatar: string;
  responderPhone: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  date: string;
};

type ExchangeListing = {
  id: string;
  owner: string;
  department: string;
  offering: string;
  desire: string;
  description: string;
  phone: string;
  image: string;
  images: string[];
  status: "Open" | "Pending" | "Completed";
  selfPosted: boolean;
  postedAt: string;
  responses: ResponseItem[];
};

type MyRequest = {
  exchangeId: string;
  status: "pending" | "accepted" | "declined";
  message: string;
  date: string;
};

// --- Modals ---

function EditExchangeModal({ post, onClose, onSave, isPending }: { post: ExchangeListing, onClose: () => void, onSave: (p: Partial<ExchangeListing>) => void, isPending: boolean }) {
  const [form, setForm] = useState({ offering: post.offering, desire: post.desire, description: post.description, phone: post.phone });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-lg">Edit Exchange Post</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground cursor-pointer"><X className="h-4 w-4 cursor-pointer" /></button>
        </div>
        <form className="overflow-y-auto p-4 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
          <Field label="Offering" required><Input value={form.offering} onChange={e => setForm({ ...form, offering: e.target.value })} required /></Field>
          <Field label="What you want" required><Input value={form.desire} onChange={e => setForm({ ...form, desire: e.target.value })} required /></Field>
          <Field label="Description" required><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></Field>
          <Field label="Phone Number" required><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Btn>
            <Btn type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResponsesModal({ post, onClose, onAccept, isPending }: { post: ExchangeListing, onClose: () => void, onAccept: (reqId: string) => void, isPending: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">Exchange Responses <Badge variant="primary">{post.responses.length}</Badge></h3>
            <p className="text-sm text-muted-foreground mt-1">For: {post.offering} ↔ {post.desire}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground self-start cursor-pointer"><X className="h-4 w-4 cursor-pointer" /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4 bg-background/50">
          {post.responses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto opacity-20 mb-3" />
              <p>No responses yet.</p>
            </div>
          ) : (
            post.responses.map(res => (
              <div key={res.id} className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={res.responderAvatar} alt="" className="h-10 w-10 rounded-full bg-secondary" />
                    <div>
                      <p className="font-medium text-sm">{res.responderName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {res.date}</p>
                    </div>
                  </div>
                  {res.status === "pending" && <Badge variant="warning">Pending</Badge>}
                  {res.status === "accepted" && <Badge variant="success">Accepted</Badge>}
                  {res.status === "declined" && <Badge variant="default">Declined</Badge>}
                </div>
                <div className="rounded-lg bg-secondary/50 p-3 text-sm text-foreground">
                  "{res.message}"
                </div>
                <div className="flex items-center justify-between pt-2">
                  <a href={`tel:${res.responderPhone}`} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    <Phone className="h-4 w-4" /> {res.responderPhone}
                  </a>
                  {res.status === "pending" && post.status !== "Completed" && (
                    <Btn size="sm" onClick={() => onAccept(res.id)} disabled={isPending}><CheckCircle className="h-4 w-4 cursor-pointer" /> {isPending ? "Accepting..." : "Accept Offer"}</Btn>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RequestExchangeModal({ post, onClose, onSubmit, isPending }: { post: ExchangeListing, onClose: () => void, onSubmit: (msg: string, phone: string) => void, isPending: boolean }) {
  const [msg, setMsg] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-lg">Request Exchange</h3>
            <p className="text-sm text-muted-foreground mt-1">Offering your item for {post.offering}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground cursor-pointer"><X className="h-4 w-4 cursor-pointer" /></button>
        </div>
        <form className="overflow-y-auto p-4 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(msg, phone); }}>
          <Field label="Message to advertiser" required hint="Mention exactly what you have and any condition details.">
            <Textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Hi, I have the exact book you're looking for in great condition..." required />
          </Field>
          <Field label="Your Phone Number" required>
            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Btn>
            <Btn type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit Request"}</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExchangeDetailsModal({ 
  post, 
  onClose, 
  onEdit, 
  onDelete, 
  onViewResponses, 
  isDeleting 
}: { 
  post: ExchangeListing, 
  onClose: () => void,
  onEdit: () => void,
  onDelete: () => void,
  onViewResponses: () => void,
  onReport: () => void,
  isDeleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">Exchange Details</h3>
            <Badge variant={post.status === "Open" ? "success" : post.status === "Pending" ? "warning" : "default"}>{post.status}</Badge>
            {post.selfPosted && <Badge variant="primary">My Post</Badge>}
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground cursor-pointer"><X className="h-4 w-4 cursor-pointer" /></button>
        </div>
        <div className="overflow-y-auto p-0">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            
            {/* Offering Section */}
            <div className="p-6 md:p-8 space-y-6 bg-background/50">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">1</div>
                <h2 className="text-lg font-semibold">Offering</h2>
              </div>
              
              <div className="aspect-video bg-secondary rounded-xl overflow-hidden border border-border">
                <img src={post.image} className="h-full w-full object-cover" alt={post.offering} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{post.offering}</h2>
                <div className="mt-4">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Description</h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Advertiser Info</h4>
                <div className="flex items-center justify-between bg-surface rounded-lg p-3 border border-border">
                  <Link to={`/app/profile/${(post as any).ownerRoll}`} onClick={onClose} className="flex flex-col group hover:opacity-80 transition-opacity cursor-pointer">
                    <p className="font-medium group-hover:text-primary transition-colors">{post.owner}</p>
                    <p className="text-xs text-muted-foreground">{post.department}</p>
                  </Link>
                  <a href={`tel:${post.phone}`} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-md cursor-pointer">
                    <Phone className="h-4 w-4" /> Call
                  </a>
                </div>
              </div>
            </div>

            {/* Want Section */}
            <div className="p-6 md:p-8 space-y-6 bg-surface flex flex-col">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success font-semibold">2</div>
                <h2 className="text-lg font-semibold">Wants</h2>
              </div>
              
              {post.images && post.images.length > 1 ? (
                <div className="aspect-video bg-secondary rounded-xl overflow-hidden border border-border">
                  <img src={post.images[1]} className="h-full w-full object-cover" alt={post.desire} />
                </div>
              ) : (
                <div className="aspect-video bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                  <ArrowLeftRight className="h-10 w-10 opacity-20 mb-3" />
                  <p className="text-sm font-medium">No reference image provided</p>
                </div>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary">{post.desire}</h2>
                <p className="text-sm text-muted-foreground mt-2">The advertiser is looking for this item in exchange for their offering.</p>
              </div>

              {/* Author Actions */}
              {post.selfPosted ? (
                <div className="pt-6 border-t border-border mt-auto space-y-3">
                  <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Manage Post</h4>
                  <div className="flex flex-col gap-2">
                    <Btn variant="outline" className="w-full cursor-pointer" onClick={() => { onClose(); onViewResponses(); }}>
                      <MessageSquare className="h-4 w-4 mr-2" /> 
                      View Responses {post.responses.length > 0 && <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] leading-none">{post.responses.length}</span>}
                    </Btn>
                    <div className="flex gap-2">
                      {post.status !== "Completed" && (
                        <Btn variant="outline" className="flex-1 cursor-pointer" onClick={() => { onClose(); onEdit(); }}>
                          <Edit3 className="h-4 w-4 mr-2" /> Edit Post
                        </Btn>
                      )}
                      <Btn variant="outline" className="flex-1 text-blood border-blood/20 hover:bg-blood/10 cursor-pointer" onClick={() => { onClose(); onDelete(); }} disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Btn>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-6 border-t border-border mt-auto flex justify-end">
                  <button 
                    onClick={() => { onClose(); onReport(); }}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                  >
                    <Flag className="h-4 w-4" /> Report Post
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function Exchange() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "requests">("all");

  const [editingPost, setEditingPost] = useState<ExchangeListing | null>(null);
  const [viewingResponses, setViewingResponses] = useState<ExchangeListing | null>(null);
  const [requestingPost, setRequestingPost] = useState<ExchangeListing | null>(null);
  const [viewingDetails, setViewingDetails] = useState<ExchangeListing | null>(null);
  const [reportingPost, setReportingPost] = useState<ExchangeListing | null>(null);

  const { data: exchanges = [], isLoading: isLoadingExchanges } = useQuery<ExchangeListing[]>({
    queryKey: ["exchange-posts"],
    queryFn: () => api.get("/api/exchange").then((res) => res.data),
  });

  const { data: myRequests = [], isLoading: isLoadingRequests } = useQuery<MyRequest[]>({
    queryKey: ["my-exchange-requests"],
    queryFn: () => api.get("/api/exchange/requests/my").then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/exchange/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-posts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExchangeListing> }) => api.put(`/api/exchange/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-posts"] });
      setEditingPost(null);
    },
  });

  const requestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { message: string, phone: string } }) => api.post(`/api/exchange/${id}/request`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-exchange-requests"] });
      setRequestingPost(null);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => api.put(`/api/exchange/requests/${requestId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-posts"] });
    },
  });

  const filtered = useMemo(() => {
    if (activeTab === "my") return exchanges.filter(e => e.selfPosted);
    if (activeTab === "requests") return exchanges.filter(e => myRequests.some(r => r.exchangeId === e.id));
    return exchanges;
  }, [exchanges, activeTab, myRequests]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exchange post?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveEdit = (updatedData: Partial<ExchangeListing>) => {
    if (!editingPost) return;
    updateMutation.mutate({ id: editingPost.id, data: updatedData });
  };

  const handleAcceptResponse = (responseId: string) => {
    acceptMutation.mutate(responseId);
  };

  const handleMakeRequest = (msg: string, phone: string) => {
    if (!requestingPost) return;
    requestMutation.mutate({ id: requestingPost.id, data: { message: msg, phone } });
  };

  // Global search bar (?open=<id>) → auto-open detail modal for that post
  useOpenFromSearchParam(exchanges, setViewingDetails);

  if (isLoadingExchanges || isLoadingRequests) {
    return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading exchanges...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Product Exchange" description="Trade what you don't need for something you do.">
        <Link to="/app/exchange/new">
          <Btn size="sm"><Plus className="h-4 w-4" /> New exchange</Btn>
        </Link>
      </PageHeader>

      <div className="flex gap-1 border-b border-border overflow-x-auto pb-[1px]">
        {(["all", "my", "requests"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2.5 text-sm font-medium transition whitespace-nowrap",
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
            )}
          >
            {tab === "all" ? "All Exchanges" :
              tab === "my" ? `My Exchanges (${exchanges.filter(e => e.selfPosted).length})` :
                `My Requests (${myRequests.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border bg-surface/50">
          <ArrowLeftRight className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">
            {activeTab === "requests" ? "You haven't requested any exchanges yet." : "No exchanges found."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e) => {
            const myReq = myRequests.find(r => r.exchangeId === e.id);

            return (
              <Card key={e.id} className={cn("overflow-hidden group flex flex-col", activeTab === "requests" && "border-primary/20 shadow-sm")}>
                <div className="grid grid-cols-2 gap-[2px] bg-border relative cursor-pointer" onClick={() => setViewingDetails(e)}>
                  <div className="aspect-square bg-secondary relative">
                    <img src={e.image} className="h-full w-full object-cover" alt="" />
                    <div className="absolute bottom-2 left-2 pointer-events-none">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-[10px] shadow-sm font-medium">Offering</Badge>
                    </div>
                  </div>
                  
                  {e.images && e.images.length > 1 ? (
                    <div className="aspect-square bg-secondary relative">
                      <img src={e.images[1]} className="h-full w-full object-cover opacity-90" alt="" />
                      <div className="absolute bottom-2 right-2 pointer-events-none">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 backdrop-blur-sm text-[10px] shadow-sm font-medium">Wants</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="grid place-items-center bg-primary-soft text-primary aspect-square">
                      <ArrowLeftRight className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  {e.images && e.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-background shadow-md p-1.5 rounded-full text-primary border border-border">
                        <ArrowLeftRight className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}

                  {e.selfPosted && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="primary" className="shadow-sm">My Post</Badge>
                    </div>
                  )}
                  {e.status === "Completed" && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] grid place-items-center z-20">
                      <Badge variant="outline" className="bg-surface">Completed</Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => setViewingDetails(e)}>
                    <Badge variant={e.status === "Open" ? "success" : e.status === "Pending" ? "warning" : "default"}>{e.status}</Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">{e.department}</span>
                  </div>
                  <div className="space-y-4 flex-1 cursor-pointer" onClick={() => setViewingDetails(e)}>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Offering</p>
                      <p className="text-sm font-semibold leading-snug">{e.offering}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Wants</p>
                      <p className="text-sm leading-snug">{e.desire}</p>
                    </div>
                  </div>

                  {activeTab === "requests" && myReq && (
                    <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Request</span>
                        <Badge variant={myReq.status === "pending" ? "warning" : myReq.status === "accepted" ? "success" : "default"} className="text-[10px]">
                          {myReq.status}
                        </Badge>
                      </div>
                      <p className="text-sm italic text-muted-foreground">"{myReq.message}"</p>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-border space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Posted by <span className="font-medium text-foreground">{e.owner}</span></span>
                      <a href={`tel:${e.phone}`} className="flex items-center gap-1 text-primary hover:underline font-medium"><Phone className="h-3 w-3" /> {e.phone}</a>
                    </div>

                    {e.selfPosted ? (
                      <div className="flex gap-2">
                        <Btn variant="outline" size="sm" className="flex-1 cursor-pointer" onClick={() => setViewingResponses(e)}>
                          <MessageSquare className="h-3.5 w-3.5" />
                          Responses {e.responses.length > 0 && <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] leading-none">{e.responses.length}</span>}
                        </Btn>
                        {e.status !== "Completed" && (
                          <button className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer" onClick={() => setEditingPost(e)}>
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-blood/20 text-blood hover:bg-blood/10 transition cursor-pointer" onClick={() => handleDelete(e.id)} disabled={deleteMutation.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      activeTab !== "requests" && (
                        myReq ? (
                          <Btn size="sm" variant="outline" className="w-full" disabled>
                            <CheckCircle className="h-4 w-4" /> Requested ({myReq.status})
                          </Btn>
                        ) : e.status === "Open" && (
                          <Btn size="sm" className="w-full cursor-pointer" onClick={() => setRequestingPost(e)}>Request Exchange</Btn>
                        )
                      )
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editingPost && (
        <EditExchangeModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={handleSaveEdit}
          isPending={updateMutation.isPending}
        />
      )}

      {viewingResponses && (
        <ResponsesModal
          // Find the latest version of the post from exchanges to keep modal up to date
          post={exchanges.find(e => e.id === viewingResponses.id) || viewingResponses}
          onClose={() => setViewingResponses(null)}
          onAccept={handleAcceptResponse}
          isPending={acceptMutation.isPending}
        />
      )}

      {requestingPost && (
        <RequestExchangeModal
          post={requestingPost}
          onClose={() => setRequestingPost(null)}
          onSubmit={handleMakeRequest}
          isPending={requestMutation.isPending}
        />
      )}

      {viewingDetails && (
        <ExchangeDetailsModal 
          post={viewingDetails} 
          onClose={() => setViewingDetails(null)} 
          onEdit={() => setEditingPost(viewingDetails)}
          onDelete={() => handleDelete(viewingDetails.id)}
          onViewResponses={() => setViewingResponses(viewingDetails)}
          onReport={() => setReportingPost(viewingDetails)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportingPost}
        onClose={() => setReportingPost(null)}
        reportableType="App\Models\ExchangePost"
        reportableId={reportingPost?.id || ""}
        itemTitle={reportingPost?.offering}
      />
    </div>
  );
}
