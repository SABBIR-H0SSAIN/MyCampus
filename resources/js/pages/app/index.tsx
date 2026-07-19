import { Link } from "react-router-dom";
import { Badge, Card, Section, Stat } from "@/components/ui-bits";
import { announcements, badges, notifications, quickActions, recentActivity, stats, bloodRequests } from "@/lib/mock-data";
import { ArrowRight, Award, Tag, FileUp, RefreshCw, Droplet, Home, UserCog, Bell, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const iconMap: Record<string, any> = { Tag, FileUp, RefreshCw, Droplet, Home, UserCog };

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    }
  });

  const earnedBadges = badges.filter((b) => b.earned);

  const currentStats = data?.stats || stats;
  const recentActivities = data?.recentActivity || recentActivity;
  const unreadNotifs = data?.unreadNotifs || [];

  // Format rank nicely, or default to Newcomer
  const rank = "Newcomer";

  return (
    <div className="space-y-8">
      {/* Onboarding — plain text, no card chrome */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {user?.name?.split(" ")[0]}.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose an action below to get started.</p>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">{user?.department} · Batch {user?.batch} · Roll {user?.roll_number}</p>
      </section>

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
              <Link key={a.key} to={a.to} className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary-soft/20 hover:shadow-md hover:shadow-primary/5 cursor-pointer card-hover-lift">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-all duration-200 group-hover:scale-110 group-hover:from-primary/25 group-hover:to-primary/10 group-hover:shadow-sm">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-center text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity timeline */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Recent activity
            </h3>
            <button className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer transition-colors">View all</button>
          </div>
          <ul className="divide-y divide-border">
            {recentActivities.map((a: any, i: number) => (
              <li key={a.id} className="flex items-start gap-3 p-4 hover:bg-surface-hover/50 transition-colors">
                <div className="relative mt-0.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  {/* Connecting line */}
                  {i < recentActivities.length - 1 && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-px h-[calc(100%+8px)] bg-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{a.text}</p>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Notifications + Badges */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bell className="h-3.5 w-3.5" />
                </div>
                Notifications
              </h3>
              <Badge variant="primary">{unreadNotifs.length} new</Badge>
            </div>
            <ul className="divide-y divide-border">
              {unreadNotifs.slice(0, 3).map((n: any) => (
                <li key={n.id} className="p-4 text-sm hover:bg-surface-hover/50 transition-colors">
                  <p className="line-clamp-2">{n.title}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{n.time}</p>
                </li>
              ))}
            </ul>
            <Link to="/app/notifications" className="block border-t border-border p-3 text-center text-xs font-medium text-primary hover:bg-primary-soft/30 cursor-pointer transition-colors">See all</Link>
          </Card>
        </div>
      </div>

    </div>
  );
}