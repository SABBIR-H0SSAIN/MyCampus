import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, Btn, Card, PageHeader, Field, Input, Textarea } from "@/components/ui-bits";
import { exchangePosts, currentUser } from "@/lib/mock-data";
import { ArrowLeftRight, Plus, Edit3, Trash2, Phone, X, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Mock Enrichment ---
type ResponseItem = {
  id: string;
  responderName: string;
  responderAvatar: string;
  responderPhone: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  date: string;
};

type ExchangeListing = typeof exchangePosts[0] & {
  phone: string;
  selfPosted: boolean;
  responses: ResponseItem[];
  postedAt: string;
  description: string;
};

type MyRequest = {
  exchangeId: string;
  status: "pending" | "accepted" | "declined";
  message: string;
  date: string;
};

const MOCK_RESPONSES: Record<string, ResponseItem[]> = {
  e1: [
    { id: "r1", responderName: "Sadia P.", responderAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=sadia", responderPhone: "+880 1718 000015", message: "Hi Tahmid, I have the Stroud book in excellent condition. Let me know if we can meet at the library.", status: "pending", date: "2 hours ago" },
    { id: "r2", responderName: "Naimul I.", responderAvatar: "https://api.dicebear.com/9.x/notionists/svg?seed=naimul", responderPhone: "+880 1717 000022", message: "I have an older edition if you're okay with that.", status: "declined", date: "1 day ago" }
  ]
};

const enrichedExchanges: ExchangeListing[] = exchangePosts.map((e, idx) => ({
  ...e,
  phone: "+880 1700 0000" + (40 + idx),
  selfPosted: e.owner === "Tahmid R.",
  responses: e.owner === "Tahmid R." ? (MOCK_RESPONSES[e.id] || []) : [],
  postedAt: `${idx + 1} days ago`,
  description: "Looking for a quick exchange, item is in good condition.",
}));

// --- Modals ---

function EditExchangeModal({ post, onClose, onSave }: { post: ExchangeListing, onClose: () => void, onSave: (p: ExchangeListing) => void }) {
  const [form, setForm] = useState({ offering: post.offering, desire: post.desire, description: post.description, phone: post.phone });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-lg">Edit Exchange Post</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form className="overflow-y-auto p-4 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave({ ...post, ...form }); }}>
          <Field label="Offering" required><Input value={form.offering} onChange={e => setForm({ ...form, offering: e.target.value })} required /></Field>
          <Field label="What you want" required><Input value={form.desire} onChange={e => setForm({ ...form, desire: e.target.value })} required /></Field>
          <Field label="Description" required><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></Field>
          <Field label="Phone Number" required><Input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="outline" onClick={onClose}>Cancel</Btn>
            <Btn type="submit">Save Changes</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResponsesModal({ post, onClose, onAccept }: { post: ExchangeListing, onClose: () => void, onAccept: (reqId: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">Exchange Responses <Badge variant="primary">{post.responses.length}</Badge></h3>
            <p className="text-sm text-muted-foreground mt-1">For: {post.offering} ↔ {post.desire}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground self-start"><X className="h-4 w-4" /></button>
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
                  {res.status === "pending" && (
                    <Btn size="sm" onClick={() => onAccept(res.id)}><CheckCircle className="h-4 w-4" /> Accept Offer</Btn>
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

function RequestExchangeModal({ post, onClose, onSubmit }: { post: ExchangeListing, onClose: () => void, onSubmit: (msg: string, phone: string) => void }) {
  const [msg, setMsg] = useState("");
  const [phone, setPhone] = useState(currentUser?.contact || "+880 ");
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="font-semibold text-lg">Request Exchange</h3>
            <p className="text-sm text-muted-foreground mt-1">Offering your item for {post.offering}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <form className="overflow-y-auto p-4 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(msg, phone); }}>
          <Field label="Message to advertiser" required hint="Mention exactly what you have and any condition details.">
            <Textarea rows={4} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Hi, I have the exact book you're looking for in great condition..." required />
          </Field>
          <Field label="Your Phone Number" required>
            <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" variant="outline" onClick={onClose}>Cancel</Btn>
            <Btn type="submit">Submit Request</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function Exchange() {
  const [exchanges, setExchanges] = useState<ExchangeListing[]>(enrichedExchanges);
  const [activeTab, setActiveTab] = useState<"all" | "my" | "requests">("all");
  const [editingPost, setEditingPost] = useState<ExchangeListing | null>(null);
  const [viewingResponses, setViewingResponses] = useState<ExchangeListing | null>(null);
  const [requestingPost, setRequestingPost] = useState<ExchangeListing | null>(null);
  
  const [myRequests, setMyRequests] = useState<MyRequest[]>([
    { exchangeId: "e3", status: "pending", message: "I have the French curves in pristine condition.", date: "Just now" }
  ]);

  const filtered = useMemo(() => {
    if (activeTab === "my") return exchanges.filter(e => e.selfPosted);
    if (activeTab === "requests") return exchanges.filter(e => myRequests.some(r => r.exchangeId === e.id));
    return exchanges;
  }, [exchanges, activeTab, myRequests]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exchange post?")) {
      setExchanges(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSaveEdit = (updated: ExchangeListing) => {
    setExchanges(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingPost(null);
  };

  const handleAcceptResponse = (postId: string, responseId: string) => {
    setExchanges(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          status: "Completed",
          responses: post.responses.map(r => r.id === responseId ? { ...r, status: "accepted" as const } : { ...r, status: "declined" as const })
        };
      }
      return post;
    }));
  };

  const handleMakeRequest = (msg: string, phone: string) => {
    if (!requestingPost) return;
    
    // Add to my requests
    setMyRequests(prev => [...prev, {
      exchangeId: requestingPost.id,
      status: "pending",
      message: msg,
      date: "Just now"
    }]);

    // Push into the post's responses (so we can simulate the other user's view if we wanted to, though since it's not selfPosted we won't see it in ResponsesModal easily, but good for data integrity)
    setExchanges(prev => prev.map(post => {
      if (post.id === requestingPost.id) {
        return {
          ...post,
          responses: [...post.responses, {
            id: `r_new_${Date.now()}`,
            responderName: currentUser?.name || "Me",
            responderAvatar: currentUser?.avatar || "",
            responderPhone: phone,
            message: msg,
            status: "pending",
            date: "Just now"
          }]
        };
      }
      return post;
    }));

    setRequestingPost(null);
  };

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
            // Simulate status changes: If the post is marked completed and we requested it, did we get accepted?
            // In a real app the backend would sync this. We'll use myReq.status for now.

            return (
            <Card key={e.id} className={cn("overflow-hidden group flex flex-col", activeTab === "requests" && "border-primary/20 shadow-sm")}>
              <div className="grid grid-cols-2 relative">
                <div className="aspect-square bg-secondary"><img src={e.image} className="h-full w-full object-cover" alt="" /></div>
                <div className="grid place-items-center bg-primary-soft text-primary"><ArrowLeftRight className="h-7 w-7 opacity-50 group-hover:opacity-100 transition-opacity" /></div>
                {e.selfPosted && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="primary" className="shadow-sm">My Post</Badge>
                  </div>
                )}
                {e.status === "Completed" && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] grid place-items-center">
                    <Badge variant="outline" className="bg-surface">Completed</Badge>
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={e.status === "Open" ? "success" : e.status === "Pending" ? "warning" : "default"}>{e.status}</Badge>
                  <span className="font-mono text-[10px] text-muted-foreground">{e.department}</span>
                </div>
                <div className="space-y-4 flex-1">
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
                      <Btn variant="outline" size="sm" className="flex-1" onClick={() => setViewingResponses(e)}>
                        <MessageSquare className="h-3.5 w-3.5" /> 
                        Responses {e.responses.length > 0 && <span className="ml-1 rounded-full bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] leading-none">{e.responses.length}</span>}
                      </Btn>
                      {e.status !== "Completed" && (
                        <button className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition" onClick={() => setEditingPost(e)}>
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      <button className="grid h-9 w-9 place-items-center rounded-md border border-blood/20 text-blood hover:bg-blood/10 transition" onClick={() => handleDelete(e.id)}>
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
                        <Btn size="sm" className="w-full" onClick={() => setRequestingPost(e)}>Request Exchange</Btn>
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
        />
      )}

      {viewingResponses && (
        <ResponsesModal 
          post={exchanges.find(e => e.id === viewingResponses.id) || viewingResponses} 
          onClose={() => setViewingResponses(null)} 
          onAccept={(reqId) => handleAcceptResponse(viewingResponses.id, reqId)} 
        />
      )}

      {requestingPost && (
        <RequestExchangeModal
          post={requestingPost}
          onClose={() => setRequestingPost(null)}
          onSubmit={handleMakeRequest}
        />
      )}
    </div>
  );
}
