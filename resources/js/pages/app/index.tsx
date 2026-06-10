import { Link } from "react-router-dom";
import { Badge, Card, Section, Stat } from "@/components/ui-bits";
import { announcements, badges, notifications, quickActions, recentActivity, stats, bloodRequests } from "@/lib/mock-data";
import { ArrowRight, Award, Tag, FileUp, RefreshCw, Droplet, Home, UserCog, Bell, TrendingUp, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const iconMap: Record<string, any> = { Tag, FileUp, RefreshCw, Droplet, Home, UserCog };

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: realStats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data.stats;
    }
  });

  const unreadNotifs = notifications.filter((n) => n.unread);
  const earnedBadges = badges.filter((b) => b.earned);
  const urgent = bloodRequests.find((b) => b.emergency && b.status === "Active");

  // Format rank nicely, or default to Newcomer
  const rank = "Newcomer";
  
  // Merge real stats with mock fallback while loading
  const currentStats = realStats || stats;

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft via-surface to-surface p-6 md:p-8">
        <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Welcome back</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{user?.name?.split(" ")[0]}, your campus is live.</h1>
            <p className="mt-2 text-sm text-muted-foreground">{user?.department} · Batch {user?.batch} · Roll {user?.roll_number}</p>
          </div>
        </div>
      </section>

      {/* Urgent banner */}
      {urgent && (
        <Link to="/app/blood" className="flex items-center gap-4 rounded-xl border border-blood/30 bg-blood/5 p-4 transition hover:bg-blood/10">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blood/15 text-blood"><AlertTriangle className="h-4 w-4" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="blood">URGENT</Badge><span className="font-mono text-[11px] text-muted-foreground">{urgent.posted}</span></div>
            <p className="mt-1 truncate text-sm"><span className="font-semibold text-blood">{urgent.group}</span> needed · {urgent.units} units · {urgent.hospital}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      )}

      {/* Stats grid */}
      <Section title="Your contribution">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Listings" value={currentStats.activeListings} hint={`${currentStats.totalAds} total · ${currentStats.sold} sold`} />
          <Stat label="Resources" value={currentStats.resources} hint={`${currentStats.downloads} downloads`} />
          <Stat label="Exchanges" value={currentStats.exchanges} hint="Completed trades" />
          <Stat label="Blood Posts" value={currentStats.bloodPosts} hint="Donation requests" accent="blood" />
        </div>
      </Section>

      {/* Quick actions */}
      <Section title="Quick actions">
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {quickActions.map((a) => {
            const Icon = iconMap[a.icon];
            return (
              <Link key={a.key} to={a.to} className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:bg-primary-soft/30">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary transition group-hover:scale-105"><Icon className="h-4 w-4" /></div>
                <span className="text-center text-[11px] font-medium leading-tight">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity timeline */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <button className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">View all</button>
          </div>
          <ul className="divide-y divide-border">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-4">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Notifications + Badges */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4" /> Notifications</h3>
              <Badge variant="primary">{unreadNotifs.length} new</Badge>
            </div>
            <ul className="divide-y divide-border">
              {unreadNotifs.slice(0, 3).map((n) => (
                <li key={n.id} className="p-4 text-sm">
                  <p className="line-clamp-2">{n.title}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{n.time}</p>
                </li>
              ))}
            </ul>
            <Link to="/app/notifications" className="block border-t border-border p-3 text-center text-xs font-medium text-primary hover:bg-primary-soft/50">See all</Link>
          </Card>
        </div>
      </div>

    </div>
  );
}
