import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge, Btn, Card, Stat } from "@/components/ui-bits";
import { Mail, Phone, Github, Linkedin, Pencil, ShieldCheck, Globe } from "lucide-react";
import api from "@/lib/api";
import { marketplaceListings, resources, exchangePosts, bloodRequests, roommatePosts } from "@/lib/mock-data";

const tabs = ["Listings", "Exchange", "Resources", "Blood", "Roommate"] as const;

export default function Profile() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Listings");

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/api/profile');
      return res.data.user;
    }
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data.stats;
    }
  });

  if (isLoading || !data) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

  const profile = data.profile || {};
  const social = profile.social_links || {};
  const contactInfo = profile.contact_info || {};

  // Default mock avatar/cover if not present
  const avatar = profile.avatar_path ? `/storage/${profile.avatar_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
  const cover = profile.cover_path ? `/storage/${profile.cover_path}` : "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="space-y-6">
      {/* Cover + avatar */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {/* Cover photo */}
        <div className="h-36 md:h-48 bg-gradient-to-br from-primary/30 to-info/20">
          <img src={cover} className="h-full w-full object-cover opacity-70" alt="" />
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
            <div className="shrink-0">
              <Link to="/app/profile/edit">
                <Btn variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit profile</Btn>
              </Link>
            </div>
          </div>
          {/* Bio */}
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{profile.bio || "No bio added yet."}</p>
          {/* Social / contact links */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {data.email}</span>
            {contactInfo.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {contactInfo.phone}</span>}
            {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition"><Github className="h-3.5 w-3.5" /> GitHub</a>}
            {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a>}
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
              {marketplaceListings.slice(0,4).map(m => (
                <Card key={m.id} className="overflow-hidden"><div className="aspect-square bg-secondary"><img src={m.image} className="h-full w-full object-cover" alt="" /></div><div className="p-3"><p className="truncate text-sm font-semibold">{m.title}</p><p className="font-mono text-xs text-primary">৳ {m.price}</p></div></Card>
              ))}
            </div>
          )}
          {tab === "Exchange" && (
            <div className="space-y-3">
              {exchangePosts.slice(0,3).map(e => (
                <Card key={e.id} className="flex items-center justify-between p-4"><div><p className="text-sm font-semibold">{e.offering}</p><p className="text-xs text-muted-foreground">wants {e.desire}</p></div><Badge variant={e.status === "Open" ? "success" : "outline"}>{e.status}</Badge></Card>
              ))}
            </div>
          )}
          {tab === "Resources" && (
            <div className="space-y-3">
              {resources.slice(0,4).map(r => (
                <Card key={r.id} className="flex items-center justify-between p-4"><div><Badge variant="primary">{r.type}</Badge><p className="mt-1 text-sm font-semibold">{r.title}</p><p className="font-mono text-[10px] text-muted-foreground">{r.course}</p></div><span className="font-mono text-xs text-muted-foreground">{r.downloads} dl</span></Card>
              ))}
            </div>
          )}
          {tab === "Blood" && (
            <div className="space-y-3">
              {bloodRequests.slice(0,2).map(b => (
                <Card key={b.id} className="flex items-center gap-3 p-4"><div className="grid h-10 w-10 place-items-center rounded-lg bg-blood/15 font-mono text-sm font-bold text-blood">{b.group}</div><div className="flex-1"><p className="text-sm font-semibold">{b.units} units · {b.hospital}</p><p className="text-[11px] text-muted-foreground">{b.date}</p></div><Badge variant={b.status === "Active" ? "success" : "outline"}>{b.status}</Badge></Card>
              ))}
            </div>
          )}
          {tab === "Roommate" && (
            <div className="grid gap-3 md:grid-cols-2">
              {roommatePosts.slice(0,2).map(r => (
                <Card key={r.id} className="p-4"><p className="text-sm font-semibold">{r.location}</p><p className="text-xs text-muted-foreground">৳ {r.budget}/mo · {r.moveIn}</p></Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
