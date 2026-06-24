import { Link } from "react-router-dom";
import { Badge, Card, PageHeader, Stat } from "@/components/ui-bits";
import { Users, UserCheck, ShoppingBag, BookOpen, Flag, Activity, ArrowRight } from "lucide-react";

const adminAnalytics = {
  totalUsers: 1240,
  activeUsers: 890,
  pendingRegistrations: 14,
  marketplaceItems: 342,
  resources: 128,
  openReports: 5,
  weekly: [
    { day: "Mon", users: 400, posts: 120 },
    { day: "Tue", users: 450, posts: 140 },
    { day: "Wed", users: 380, posts: 110 },
    { day: "Thu", users: 500, posts: 160 },
    { day: "Fri", users: 480, posts: 150 },
    { day: "Sat", users: 300, posts: 80 },
    { day: "Sun", users: 290, posts: 70 },
  ],
};

const adminReports = [
  { id: "1", target: "Listing: iPhone 13 Pro", reason: "Suspected scam", reporter: "user_492", severity: "high", status: "Open" },
  { id: "2", target: "Profile: John Doe", reason: "Inappropriate avatar", reporter: "user_118", severity: "medium", status: "Open" },
];

export default function AdminDashboard() {
  const a = adminAnalytics;
  const maxUsers = Math.max(...a.weekly.map(d => d.users));

  return (
    <div className="space-y-8">
      <PageHeader title="Overview" description="Platform health, registrations queue, and active reports." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Total users" value={a.totalUsers.toLocaleString()} hint={<span className="flex items-center gap-1"><Users className="h-3 w-3" /> verified</span>} />
        <Stat label="Active (7d)" value={a.activeUsers.toLocaleString()} hint="44% retention" accent="success" />
        <Stat label="Pending" value={a.pendingRegistrations} hint="Awaiting review" accent="warning" />
        <Stat label="Listings" value={a.marketplaceItems} hint={<span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> active</span>} />
        <Stat label="Resources" value={a.resources.toLocaleString()} hint={<span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> shared</span>} />
        <Stat label="Open reports" value={a.openReports} hint={<span className="flex items-center gap-1"><Flag className="h-3 w-3" /> needs attention</span>} accent="blood" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" /> Platform activity · last 7 days</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Users · Posts</span>
          </div>
          <div className="flex h-56 items-end gap-3">
            {a.weekly.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end gap-1">
                  <div className="flex-1 rounded-t bg-primary/80" style={{ height: `${(d.users / maxUsers) * 100}%` }} />
                  <div className="flex-1 rounded-t bg-info/60" style={{ height: `${(d.posts / maxUsers) * 100}%` }} />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><UserCheck className="h-4 w-4 text-primary" /> Pending registrations</h3>
            <Badge variant="warning">{a.pendingRegistrations}</Badge>
          </div>
          <div className="p-4 flex items-center justify-center text-sm text-muted-foreground h-48">
            Manage pending users in the queue.
          </div>
          <Link to="/admin/registrations" className="flex items-center justify-center gap-1 border-t border-border p-3 text-xs font-medium text-primary hover:bg-primary-soft/50 cursor-pointer">Review all <ArrowRight className="h-3 w-3 cursor-pointer" /></Link>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Flag className="h-4 w-4 text-blood" /> Recent reports</h3>
          <Link to="/admin/reports" className="text-xs text-primary hover:underline cursor-pointer">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr><th className="px-4 py-2 text-left">Target</th><th className="px-4 py-2 text-left">Reason</th><th className="px-4 py-2 text-left">Reporter</th><th className="px-4 py-2 text-left">Severity</th><th className="px-4 py-2 text-left">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminReports.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.target}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.reason}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.reporter}</td>
                  <td className="px-4 py-3"><Badge variant={r.severity === "high" ? "blood" : r.severity === "medium" ? "warning" : "outline"}>{r.severity}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={r.status === "Resolved" ? "success" : "warning"}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
