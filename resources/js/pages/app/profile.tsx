import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Badge, Btn, Card, Stat } from "@/components/ui-bits";
import { Mail, Phone, Github, Linkedin, Pencil, ShieldCheck, Globe, Camera, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const tabs = ["Listings", "Exchange", "Resources", "Blood", "Roommate"] as const;

export default function Profile() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Listings");

  const { id } = useParams<{ id?: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const isOwnProfile = !id || (currentUser && id === currentUser.id.toString());

  const { data, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const endpoint = id ? `/api/users/${id}/profile` : '/api/profile';
      const res = await api.get(endpoint);
      return res.data.user;
    }
  });

  const { data: dashboardStats } = useQuery<{
    activeListings: number;
    totalAds: number;
    sold: number;
    resources: number;
    downloads: number;
    exchanges: number;
    bloodPosts: number;
  }>({
    queryKey: ['dashboard-stats', id],
    queryFn: async () => {
      if (!isOwnProfile) return null as any;
      const res = await api.get('/api/dashboard/stats');
      return res.data.stats;
    },
    enabled: !!isOwnProfile
  });

  // Cover photo upload mutation
  const coverMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("cover", file);
      const res = await api.post("/api/profile/cover", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
    }
  });

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    coverMutation.mutate(file);
  }

  if (isLoading || !data) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

  const profile = data.profile || {};
  const social = profile.social_links || {};
  const contactInfo = profile.contact_info || {};

  // Default mock avatar/cover if not present
  const avatar = profile.avatar_path ? `/storage/${profile.avatar_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
  const cover = profile.cover_path ? `/storage/${profile.cover_path}` : "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop";

  const userListings = data.marketplace_listings || [];
  const userExchanges = data.exchange_posts || [];
  const userResources = data.resources || [];
  const userBloodRequests = data.blood_requests || [];
  const userRoommates = data.roommate_posts || [];

  return (
    <div className="space-y-6">
      {/* Cover + avatar */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {/* Cover photo */}
        <div className="relative h-36 md:h-48 bg-gradient-to-br from-primary/30 to-info/20">
          <img src={cover} className="h-full w-full object-cover opacity-70" alt="" />
          {isOwnProfile && (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/80 hover:bg-background border border-border text-[11px] font-medium text-foreground shadow-sm transition cursor-pointer"
            >
              {coverMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
              <span>{profile.cover_path ? "Change Cover" : "Add Cover"}</span>
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>
        {/* Profile info row */}
        <div className="px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Avatar + name side by side */}
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt=""
                className="h-20 w-20 shrink-0 rounded-2xl border-4 border-surface ring-2 ring-border bg-surface object-cover"
              />
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
                  {data.name}
                  {data.is_approved ? <ShieldCheck className="h-4 w-4 text-primary shrink-0" /> : null}
                </h1>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">
                  {data.roll_number} · {data.department} · Batch {data.batch}
                </p>
              </div>
            </div>
            {/* Edit button */}
            {isOwnProfile && (
              <div className="shrink-0">
                <Link to="/app/profile/edit">
                  <Btn variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit profile</Btn>
                </Link>
              </div>
            )}
          </div>
          {/* Bio */}
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{profile.bio || "No bio added yet."}</p>
          {/* Social / contact links */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {data.email}</span>
            {contactInfo.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {contactInfo.phone}</span>}
            {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition"><Github className="h-3.5 w-3.5" /> GitHub</a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition cursor-pointer"><Linkedin className="h-3.5 w-3.5 cursor-pointer" /> LinkedIn</a>}
            {social.website && <a href={social.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition"><Globe className="h-3.5 w-3.5" /> Website</a>}
          </div>
        </div>
      </div>

      {/* Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Listings" value={dashboardStats.activeListings} hint={`${dashboardStats.totalAds} total · ${dashboardStats.sold} sold`} />
          <Stat label="Resources" value={dashboardStats.resources} hint={`${dashboardStats.downloads} downloads`} />
          <Stat label="Exchanges" value={dashboardStats.exchanges} hint="Completed trades" />
          <Stat label="Blood Posts" value={dashboardStats.bloodPosts} hint="Donation requests" accent="blood" />
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex flex-wrap gap-1 border-b border-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium transition ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
        <div className="pt-6">
          {tab === "Listings" && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {userListings.length > 0 ? userListings.map((m: any) => (
                <Card key={m.id} className="overflow-hidden">
                  <div className="aspect-square bg-secondary">
                    {/* Marketplace controller already stores the absolute public path
                        (e.g. "/storage/marketplace/foo.jpg"), so we use m.images[0] as-is. */}
                    <img src={m.images?.[0] || "https://placehold.co/400?text=No+Image"} className="h-full w-full object-cover" alt="" />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{m.title}</p>
                    <p className="font-mono text-xs text-primary">৳ {m.price}</p>
                  </div>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground col-span-full">No listings available.</p>
              )}
            </div>
          )}
          {tab === "Exchange" && (
            <div className="space-y-3">
              {userExchanges.length > 0 ? userExchanges.map((e: any) => (
                <Card key={e.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">{e.offering}</p>
                    <p className="text-xs text-muted-foreground">wants {e.desire}</p>
                  </div>
                  <Badge variant={e.status === "Open" ? "success" : "outline"}>{e.status}</Badge>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground">No exchange posts available.</p>
              )}
            </div>
          )}
          {tab === "Resources" && (
            <div className="space-y-3">
              {userResources.length > 0 ? userResources.map((r: any) => (
                <Card key={r.id} className="flex items-center justify-between p-4">
                  <div>
                    <Badge variant="primary">{r.resource_type}</Badge>
                    <p className="mt-1 text-sm font-semibold">{r.title}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{r.course_code}</p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{r.downloads || 0} dl</span>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground">No resources available.</p>
              )}
            </div>
          )}
          {tab === "Blood" && (
            <div className="space-y-3">
              {userBloodRequests.length > 0 ? userBloodRequests.map((b: any) => (
                <Card key={b.id} className="flex items-center gap-3 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-blood/15 font-mono text-sm font-bold text-blood">{b.blood_group}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{b.units} units · {b.hospital}</p>
                    <p className="text-[11px] text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={b.status === "Active" ? "success" : "outline"}>{b.status}</Badge>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground">No blood requests available.</p>
              )}
            </div>
          )}
          {tab === "Roommate" && (
            <div className="grid gap-3 md:grid-cols-2">
              {userRoommates.length > 0 ? userRoommates.map((r: any) => (
                <Card key={r.id} className="p-4">
                  <p className="text-sm font-semibold">{r.location}</p>
                  <p className="text-xs text-muted-foreground">৳ {r.budget}/mo · {new Date(r.move_in_date).toLocaleDateString()}</p>
                </Card>
              )) : (
                <p className="text-sm text-muted-foreground col-span-full">No roommate posts available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
