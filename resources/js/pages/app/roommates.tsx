import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet, MapPin, Calendar, Search, Filter, X, Send } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// --- Types ---
interface Profile {
  id: number;
  user_id: number;
  avatar_url?: string;
  department?: string;
}

interface User {
  id: number;
  name: string;
  gender?: string;
  roll_number?: string;
  profile?: Profile;
}

interface RoommatePost {
  id: number;
  user_id: number;
  title: string;
  location: string;
  budget: number;
  move_in_date: string;
  lifestyle: string[];
  looking_for: string;
  description: string;
  contact: string;
  status: string;
  created_at: string;
  user?: User;
}

interface RoommateRequest {
  id: number;
  roommate_post_id: number;
  requester_id: number;
  message: string;
  contact_number: string;
  status: string;
  created_at: string;
  requester?: User;
  post?: RoommatePost;
}

// --- Zod Schema ---
const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  location: z.string().min(3, "Location must be at least 3 characters").max(255),
  budget: z.number().min(0, "Budget cannot be negative"),
  move_in_date: z.string().min(1, "Move in date is required"),
  looking_for: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contact: z.string().min(10, "Contact must be at least 10 characters").max(255),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

const LIFESTYLE_OPTIONS = [
  "Non-smoker", "Smoker", "Early bird", "Night owl", "Quiet", "Social", "Neat", "Pets allowed", "No pets", "Vegetarian", "Student focused"
];

// --- Components ---

function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "outline", className?: string }) {
  const variants = {
    default: "bg-primary text-primary-foreground",
    success: "bg-green-500/10 text-green-700 dark:text-green-400",
    outline: "border border-border text-foreground",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

function Btn({ children, className, variant = "primary", size = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "ghost" | "danger", size?: "sm" | "default" | "icon" }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-transparent hover:bg-secondary hover:text-foreground",
    ghost: "hover:bg-secondary hover:text-foreground",
    danger: "bg-blood text-white hover:bg-blood/90",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 py-2 text-sm",
    icon: "h-10 w-10 justify-center",
  };
  return (
    <button className={cn("inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

// --- Main Page ---
export default function RoommateFinder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"explore" | "my_ads" | "my_requests">("explore");
  const [genderFilter, setGenderFilter] = useState("All");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [requestModalPost, setRequestModalPost] = useState<RoommatePost | null>(null);
  const [responsesModalPost, setResponsesModalPost] = useState<RoommatePost | null>(null);
  const [viewingDetails, setViewingDetails] = useState<RoommatePost | null>(null);

  // Queries
  const { data: posts, isLoading: postsLoading } = useQuery<RoommatePost[]>({
    queryKey: ["roommates", searchQuery],
    queryFn: async () => {
      const res = await api.get("/api/roommates", { params: { search: searchQuery } });
      return res.data;
    }
  });

  const { data: actualMyRequests } = useQuery<RoommateRequest[]>({
    queryKey: ["my-roommate-requests"],
    queryFn: async () => {
      const res = await api.get("/api/my-roommate-requests");
      return res.data;
    }
  });

  // Mutations
  const closeAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.put(`/api/roommates/${id}`, { status: "Closed" });
    },
    onSuccess: () => {
      toast.success("Ad marked as closed");
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
    },
    onError: () => {
      toast.error("Failed to close ad");
    }
  });

  const openAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.put(`/api/roommates/${id}`, { status: "Open" });
    },
    onSuccess: () => {
      toast.success("Ad reopened");
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
    },
    onError: () => {
      toast.error("Failed to reopen ad");
    }
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/api/roommates/${id}`);
    },
    onSuccess: () => {
      toast.success("Ad deleted");
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
    },
    onError: () => {
      toast.error("Failed to delete ad");
    }
  });

  const sendRequestMutation = useMutation({
    mutationFn: async ({ postId, message, contact_number }: { postId: number, message: string, contact_number: string }) => {
      return api.post(`/api/roommates/${postId}/request`, { message, contact_number });
    },
    onSuccess: () => {
      toast.success("Request sent successfully!");
      setRequestModalPost(null);
      queryClient.invalidateQueries({ queryKey: ["my-roommate-requests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number, status: string }) => {
      return api.post(`/api/roommate-requests/${requestId}/respond`, { status });
    },
    onSuccess: () => {
      toast.success("Response sent");
      queryClient.invalidateQueries({ queryKey: ["roommate-responses"] });
    },
    onError: () => {
      toast.error("Failed to respond");
    }
  });


  const displayPosts = (Array.isArray(posts) ? posts : [])?.filter(p => {
    if (activeTab === "my_ads") return p.user_id === user?.id;
    if (activeTab === "explore") {
      if (genderFilter !== "All" && p.user?.gender !== genderFilter) return false;
      return p.status === "Open";
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roommate Finder</h1>
          <p className="text-muted-foreground mt-1">Find compatible housemates near KUET.</p>
        </div>
        <Btn onClick={() => setIsCreateModalOpen(true)} className="gap-2 cursor-pointer">
          <Plus className="h-4 w-4" /> New Post
        </Btn>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-1 border-b border-border overflow-x-auto pb-[1px]">
          {(["explore", "my_ads", "my_requests"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-2.5 text-sm font-medium transition whitespace-nowrap cursor-pointer",
                activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
              )}
            >
              {tab === "explore" ? "Explore Ads" :
                tab === "my_ads" ? `My Ads` :
                  `My Requests`}
            </button>
          ))}
        </div>

        {activeTab === "explore" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by area or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer w-full sm:w-48"
            >
              <option value="All">All Genders</option>
              <option value="male">Male only</option>
              <option value="female">Female only</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "explore" || activeTab === "my_ads" ? (
        postsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-xl bg-secondary animate-pulse" />)}
          </div>
        ) : displayPosts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold">No posts found</h3>
            <p className="text-muted-foreground max-w-sm mt-1">
              {activeTab === "explore" ? "There are currently no roommate posts matching your search." : "You haven't posted any roommate ads yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayPosts?.map(post => (
              <div 
                key={post.id} 
                className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col h-full cursor-pointer group"
                onClick={() => setViewingDetails(post)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link to={`/app/profile/${post.user?.roll_number || post.user?.id}`} onClick={e => e.stopPropagation()} className="shrink-0 hover:opacity-80 transition-opacity">
                      <img src={post.user?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${post.user?.name}&background=random`} alt="" className="h-10 w-10 rounded-full bg-secondary object-cover" />
                    </Link>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors" title={post.title}>{post.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        <Link to={`/app/profile/${post.user?.roll_number || post.user?.id}`} onClick={e => e.stopPropagation()} className="hover:underline">{post.user?.name}</Link> · {post.user?.profile?.department}
                      </p>
                    </div>
                  </div>
                  <Badge variant={post.status === "Open" ? "success" : "outline"}>{post.status}</Badge>
                </div>

                <div className="space-y-2.5 text-sm mb-4 flex-grow">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-4 w-4 text-primary" /> 
                    <span className="font-medium text-foreground">৳ {post.budget}</span>/month
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> 
                    <span className="truncate">{post.location}</span>
                  </p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" /> 
                    <span>Move in: {new Date(post.move_in_date).toLocaleDateString()}</span>
                  </p>
                </div>

                {post.looking_for && (
                  <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2 border-l-2 border-primary/50 pl-2">
                    "Looking for: {post.looking_for}"
                  </p>
                )}

                {post.lifestyle && post.lifestyle.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {post.lifestyle.slice(0, 3).map((l, i) => (
                      <span key={i} className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">{l}</span>
                    ))}
                    {post.lifestyle.length > 3 && (
                      <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">+{post.lifestyle.length - 3}</span>
                    )}
                  </div>
                )}

                {activeTab === "my_ads" ? (
                  <div className="mt-auto grid grid-cols-2 gap-2" onClick={e => e.stopPropagation()}>
                    <Btn variant="outline" size="sm" onClick={() => setResponsesModalPost(post)} className="cursor-pointer">
                      View Responses
                    </Btn>
                    {post.status === "Open" ? (
                      <Btn variant="outline" size="sm" onClick={() => closeAdMutation.mutate(post.id)} className="cursor-pointer">Mark Closed</Btn>
                    ) : (
                      <Btn variant="outline" size="sm" onClick={() => openAdMutation.mutate(post.id)} className="cursor-pointer">Reopen</Btn>
                    )}
                    <div className="col-span-2">
                      <Btn variant="danger" size="sm" className="w-full cursor-pointer bg-blood/10 text-blood hover:bg-blood/20 border-transparent" onClick={() => {
                        if(confirm('Are you sure you want to delete this ad?')) deleteAdMutation.mutate(post.id);
                      }}>Delete Post</Btn>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto pt-4 border-t border-border" onClick={e => e.stopPropagation()}>
                    {post.user_id !== user?.id && post.status === "Open" ? (
                      <Btn 
                        className="w-full cursor-pointer" 
                        onClick={() => setRequestModalPost(post)}
                      >
                        <Send className="h-4 w-4 mr-2" /> Request to be Roommate
                      </Btn>
                    ) : (
                      <Btn 
                        variant="secondary"
                        className="w-full cursor-pointer" 
                        onClick={() => setViewingDetails(post)}
                      >
                        View Details
                      </Btn>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* My Requests Tab */
        <div className="space-y-4">
          {(!Array.isArray(actualMyRequests) || actualMyRequests.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Send className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-semibold">No requests made</h3>
              <p className="text-muted-foreground max-w-sm mt-1">You haven't requested to be a roommate on any posts yet.</p>
            </div>
          ) : (
            (Array.isArray(actualMyRequests) ? actualMyRequests : []).map(req => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <h4 className="font-semibold">{req.post?.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">To: {req.post?.user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic bg-secondary p-2 rounded-md border-l-2 border-primary">"{req.message}"</p>
                </div>
                <div className="flex items-center gap-3 md:flex-col md:items-end">
                  <Badge variant={req.status === 'Accepted' ? 'success' : req.status === 'Declined' ? 'outline' : 'default'}>
                    {req.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <CreateRoommateModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["roommates"] });
            setActiveTab("my_ads");
          }} 
        />
      )}

      {/* REQUEST MODAL */}
      {requestModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Send Request</h2>
              <button onClick={() => setRequestModalPost(null)} className="rounded-full p-1.5 hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 bg-secondary/50 p-3 rounded-lg">
              <p className="text-sm font-medium">{requestModalPost.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Posted by {requestModalPost.user?.name}</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const message = formData.get("message") as string;
              const contact_number = formData.get("contact_number") as string;
              if (message.trim().length === 0 || contact_number.trim().length === 0) return;
              sendRequestMutation.mutate({ postId: requestModalPost.id, message, contact_number });
            }} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Your Phone Number *</label>
                <input 
                  type="tel"
                  name="contact_number"
                  required
                  placeholder="017XXXXXXXX"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message *</label>
                <textarea 
                  name="message"
                  required
                  placeholder="Hi, I'm interested in being your roommate..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Btn type="button" variant="ghost" onClick={() => setRequestModalPost(null)} className="cursor-pointer">Cancel</Btn>
                <Btn type="submit" disabled={sendRequestMutation.isPending} className="cursor-pointer">
                  {sendRequestMutation.isPending ? "Sending..." : "Send Request"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {viewingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-lg my-8 flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-xl font-bold">Roommate Ad Details</h2>
              <button onClick={() => setViewingDetails(null)} className="rounded-full p-2 hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{viewingDetails.title}</h1>
                  <Badge variant={viewingDetails.status === "Open" ? "success" : "outline"}>{viewingDetails.status}</Badge>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
                  <p className="flex items-center gap-3 text-muted-foreground">
                    <Wallet className="h-5 w-5 text-primary" /> 
                    <span><strong className="text-foreground">৳ {viewingDetails.budget}</strong> / month</span>
                  </p>
                  <p className="flex items-center gap-3 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" /> 
                    <span className="text-foreground">{viewingDetails.location}</span>
                  </p>
                  <p className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5 text-primary" /> 
                    <span className="text-foreground">{new Date(viewingDetails.move_in_date).toLocaleDateString()}</span>
                  </p>
                </div>
                
                <div className="bg-secondary/30 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <Link to={`/app/profile/${viewingDetails.user?.roll_number || viewingDetails.user?.id}`} className="hover:opacity-80 transition-opacity">
                    <img src={viewingDetails.user?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${viewingDetails.user?.name}&background=random`} alt="" className="h-16 w-16 rounded-full bg-secondary object-cover mb-2" />
                  </Link>
                  <Link to={`/app/profile/${viewingDetails.user?.roll_number || viewingDetails.user?.id}`} className="font-semibold text-foreground hover:underline">
                    {viewingDetails.user?.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{viewingDetails.user?.profile?.department}</p>
                  <p className="text-xs text-muted-foreground capitalize">{viewingDetails.user?.gender}</p>
                </div>
              </div>

              {viewingDetails.lifestyle && viewingDetails.lifestyle.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Lifestyle Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingDetails.lifestyle.map((l, i) => (
                      <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingDetails.looking_for && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Ideal Roommate</h3>
                  <p className="text-sm text-muted-foreground italic border-l-4 border-primary pl-3 py-1">"{viewingDetails.looking_for}"</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{viewingDetails.description}</p>
              </div>
            </div>

            <div className="p-5 border-t border-border bg-secondary/10 flex flex-wrap gap-3 justify-end rounded-b-xl">
              {viewingDetails.user_id === user?.id ? (
                <>
                  <Btn variant="outline" onClick={() => { setViewingDetails(null); setResponsesModalPost(viewingDetails); }} className="cursor-pointer flex-1 sm:flex-none">
                    View Responses
                  </Btn>
                  {viewingDetails.status === "Open" ? (
                    <Btn variant="outline" onClick={() => { closeAdMutation.mutate(viewingDetails.id); setViewingDetails(null); }} className="cursor-pointer flex-1 sm:flex-none">Mark Closed</Btn>
                  ) : (
                    <Btn variant="outline" onClick={() => { openAdMutation.mutate(viewingDetails.id); setViewingDetails(null); }} className="cursor-pointer flex-1 sm:flex-none">Reopen</Btn>
                  )}
                  <Btn variant="danger" className="cursor-pointer flex-1 sm:flex-none" onClick={() => {
                    if(confirm('Are you sure you want to delete this ad?')) {
                      deleteAdMutation.mutate(viewingDetails.id);
                      setViewingDetails(null);
                    }
                  }}>Delete Post</Btn>
                </>
              ) : (
                viewingDetails.status === "Open" && (
                  <Btn 
                    className="w-full sm:w-auto cursor-pointer" 
                    onClick={() => { setViewingDetails(null); setRequestModalPost(viewingDetails); }}
                  >
                    <Send className="h-4 w-4 mr-2" /> Request to be Roommate
                  </Btn>
                )
              )}
            </div>
          </div>
        </div>
      )}
      
      {responsesModalPost && (
        <ResponsesModal 
          post={responsesModalPost} 
          onClose={() => setResponsesModalPost(null)} 
          onRespond={(id, status) => respondToRequestMutation.mutate({ requestId: id, status })}
        />
      )}
    </div>
  );
}

// --- Create Modal Component ---
function CreateRoommateModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { budget: 0 }
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/api/roommates", data);
    },
    onSuccess: () => {
      toast.success("Post created successfully!");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create post.");
    }
  });

  const onSubmit = (data: CreatePostForm) => {
    mutation.mutate({
      ...data,
      lifestyle: selectedLifestyles
    });
  };

  const toggleLifestyle = (tag: string) => {
    if (selectedLifestyles.includes(tag)) {
      setSelectedLifestyles(prev => prev.filter(t => t !== tag));
    } else {
      if(selectedLifestyles.length >= 5) {
        toast.error("You can select up to 5 lifestyle tags");
        return;
      }
      setSelectedLifestyles(prev => [...prev, tag]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-lg my-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">Find a Roommate</h2>
            <p className="text-sm text-muted-foreground">Post an ad to find roommates for your flat.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Title *</label>
              <input {...register("title")} placeholder="e.g. Need 1 roommate for 2BHK flat" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              {errors.title && <p className="text-xs text-blood">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location/Area *</label>
              <input {...register("location")} placeholder="e.g. Fulbarigate" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              {errors.location && <p className="text-xs text-blood">{errors.location.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Budget (per month) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                <input {...register("budget", { valueAsNumber: true })} type="number" min="0" placeholder="2500" className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              {errors.budget && <p className="text-xs text-blood">{errors.budget.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Move-in Date *</label>
              <input {...register("move_in_date")} type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              {errors.move_in_date && <p className="text-xs text-blood">{errors.move_in_date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number *</label>
              <input {...register("contact")} placeholder="017XXXXXXXX" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              {errors.contact && <p className="text-xs text-blood">{errors.contact.message}</p>}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Lifestyle Preferences (Up to 5)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {LIFESTYLE_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleLifestyle(tag)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors", selectedLifestyles.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-input hover:border-primary")}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Looking For (Ideal Roommate)</label>
              <input {...register("looking_for")} placeholder="e.g. Someone quiet, non-smoker, preferably from CSE" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Description (About the flat/room) *</label>
              <textarea {...register("description")} rows={4} placeholder="Describe the flat, facilities, internet, meal system, etc." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              {errors.description && <p className="text-xs text-blood">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Btn type="button" variant="ghost" onClick={onClose} className="cursor-pointer">Cancel</Btn>
            <Btn type="submit" disabled={mutation.isPending} className="cursor-pointer">
              {mutation.isPending ? "Posting..." : "Post Ad"}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Responses Modal Component ---
function ResponsesModal({ post, onClose, onRespond }: { post: RoommatePost, onClose: () => void, onRespond: (id: number, status: string) => void }) {
  const { data: responses, isLoading } = useQuery<RoommateRequest[]>({
    queryKey: ["roommate-responses", post.id],
    queryFn: async () => {
      const res = await api.get(`/api/roommates/${post.id}/requests`);
      return res.data;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-border bg-surface p-0 shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Responses</h2>
            <p className="text-sm text-muted-foreground">{post.title}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-24 rounded-lg bg-secondary animate-pulse" />)}
            </div>
          ) : (!Array.isArray(responses) || responses.length === 0) ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No one has requested to be your roommate yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(Array.isArray(responses) ? responses : []).map(req => (
                <div key={req.id} className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/app/profile/${req.requester?.roll_number || req.requester?.id}`} className="shrink-0 hover:opacity-80 transition-opacity">
                        <img src={req.requester?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${req.requester?.name}&background=random`} alt="" className="h-10 w-10 rounded-full bg-secondary object-cover" />
                      </Link>
                      <div>
                        <Link to={`/app/profile/${req.requester?.roll_number || req.requester?.id}`} className="text-sm font-semibold text-foreground hover:underline">
                          {req.requester?.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{req.requester?.profile?.department}</p>
                      </div>
                    </div>
                    <Badge variant={req.status === 'Accepted' ? 'success' : req.status === 'Declined' ? 'outline' : 'default'}>
                      {req.status}
                    </Badge>
                  </div>
                  <div className="mt-4 p-3 bg-secondary/30 rounded-md text-sm border-l-2 border-primary">
                    <p className="text-xs font-semibold text-foreground mb-1">Phone: {req.contact_number}</p>
                    <p className="text-muted-foreground">"{req.message}"</p>
                  </div>
                  
                  {req.status === 'Pending' && (
                    <div className="mt-4 flex gap-3 justify-end">
                      <Btn variant="outline" size="sm" onClick={() => onRespond(req.id, 'Declined')} className="cursor-pointer text-blood hover:text-blood">Decline</Btn>
                      <Btn variant="primary" size="sm" onClick={() => onRespond(req.id, 'Accepted')} className="cursor-pointer">Accept</Btn>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
