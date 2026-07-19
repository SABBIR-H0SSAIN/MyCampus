import { Link, Outlet, useLocation } from "react-router-dom";
import { Shield, UserCheck, Users, Flag, Megaphone, LayoutDashboard, Bell, LogOut, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/registrations", label: "Registrations", icon: UserCheck, dynamicBadge: "pending-registrations" },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

function NavItem({ to, label, icon: Icon, exact, badge, dynamicBadge }: any) {
  const location = useLocation();
  const path = location.pathname;
  const active = exact ? path === to : path === to || path.startsWith(to + "/");
  
  const { data: pendingCount } = useQuery({
    queryKey: ["admin-registrations-count", "pending"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/admin/registrations?status=pending");
        return res.data?.total || res.data?.data?.length || 0;
      } catch (err) {
        return 0;
      }
    },
    enabled: dynamicBadge === "pending-registrations",
  });
  
  const displayBadge = dynamicBadge === "pending-registrations" && pendingCount && pendingCount > 0 ? pendingCount : badge;

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 truncate">{label}</span>
      {displayBadge ? (
        <span className="rounded bg-warning/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-warning">{displayBadge}</span>
      ) : null}
    </Link>
  );
}

export function AdminLayout() {
  const { logout } = useAuth();
  return (
    <div className="min-h-dvh bg-sidebar text-sidebar-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
          <Logo size="md" />
          <span className="rounded bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-sidebar-primary shrink-0">Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((n) => <NavItem key={n.to} {...n} />)}
        </nav>
        <div className="space-y-1 border-t border-sidebar-border p-3">
          <Link
            to="/app"
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" /> Back to the app
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-blood hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-blood" /> Logout
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar/90 px-4 backdrop-blur lg:pl-72 lg:pr-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo mark size="md" />
            <span className="rounded bg-sidebar-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-sidebar-primary shrink-0">ADMIN</span>
          </div>
          <Link
            to="/app"
            className="flex items-center gap-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground transition hover:bg-sidebar-accent cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to the app
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative grid h-9 w-9 place-items-center rounded-md border border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground transition hover:bg-sidebar-accent cursor-pointer" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blood" />
          </button>
          <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-md border border-sidebar-border bg-sidebar-accent/50 text-blood transition hover:bg-sidebar-accent hover:text-blood cursor-pointer" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </button>
          <div className="h-9 w-9 rounded-full bg-sidebar-accent" />
        </div>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl bg-background p-4 text-foreground lg:min-h-[calc(100dvh-4rem)] lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
