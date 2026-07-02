import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  RefreshCw,
  Droplet,
  BookOpen,
  Home,
  Megaphone,
  Bell,
  User,
  Search,
  Settings,
  Menu,
  X,
  Shield,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/app/exchange", label: "Exchange", icon: RefreshCw },
  { to: "/app/blood", label: "Blood Network", icon: Droplet },
  { to: "/app/resources", label: "Resources", icon: BookOpen },
  { to: "/app/roommates", label: "Roommates", icon: Home },
  { to: "/app/lost-found", label: "Lost & Found Hub", icon: Search },
  { to: "/app/announcements", label: "Announcements", icon: Megaphone },
];

function NavItem({ to, label, icon: Icon, exact }: { to: string; label: string; icon: any; exact?: boolean }) {
  const location = useLocation();
  const path = location.pathname;
  const active = exact ? path === to : path === to || path.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const unread = 3; // Placeholder mock

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileMenuOpen]);

  // Mock avatar, since user model doesn't have an avatar field yet
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link to="/app"><Logo size="md" /></Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Workspace</p>
          {nav.map((n) => <NavItem key={n.to} {...n} />)}
        </nav>
        <div className="relative border-t border-border p-3" ref={profileMenuRef}>
          <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="w-full flex items-center gap-3 rounded-md p-2 hover:bg-secondary text-left cursor-pointer">
            <img src={avatar} alt="" className="h-9 w-9 rounded-full bg-secondary" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground">
                {user?.roll_number} · {user?.department}
              </div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-md border border-border bg-surface p-1 shadow-lg">
              <Link to="/app/profile" onClick={() => setProfileMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer">
                Profile
              </Link>
              <button onClick={() => { setProfileMenuOpen(false); logout(); }} className="w-full text-left rounded-md px-3 py-2 text-sm text-blood hover:bg-secondary cursor-pointer">
                Logout
              </button>
            </div>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className="mt-2 block rounded-md border border-dashed border-border px-3 py-2 text-center text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer">
              Switch to Admin →
            </Link>
          )}
        </div>
      </aside>

      {/* Topbar */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:pl-72 lg:pr-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Link to="/app"><Logo mark size="md" /></Link>
        </div>
        <div className="hidden flex-1 max-w-md lg:block">
          <GlobalSearchBar variant="inline" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface hover:bg-secondary hover:border-primary/20 transition-all cursor-pointer"
            aria-label="Search"
            type="button"
          >
            <Search className="h-4 w-4" />
          </button>
          <Link to="/app/notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface hover:bg-secondary hover:border-primary/20 cursor-pointer transition-all duration-200" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blood ring-2 ring-background animate-pulse" />}
          </Link>
          <Link to="/app/profile" className="lg:hidden cursor-pointer">
            <img src={avatar} alt="profile" className="h-9 w-9 rounded-xl bg-secondary outline outline-1 outline-border hover:outline-primary/30 transition-all duration-200" />
          </Link>
        </div>
      </header>

      <main className="pb-24 lg:pb-12 lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border bg-surface/95 px-2 backdrop-blur-xl lg:hidden">
        <MobileNavLink to="/app" label="Home" icon={LayoutDashboard} exact />
        <MobileNavLink to="/app/marketplace" label="Market" icon={ShoppingBag} />
        <MobileNavLink to="/app/resources" label="Library" icon={BookOpen} />
        <MobileNavLink to="/app/notifications" label="Alerts" icon={Bell} />
        <MobileNavLink to="/app/profile" label="Me" icon={User} />
        {/* More button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground cursor-pointer active:scale-95 transition-transform"
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>

      {/* Mobile full-nav drawer */}
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden fade-in-backdrop"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Slide-up panel */}
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-surface pb-safe lg:hidden slide-up-enter">
            {/* Drawer handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-sm font-semibold">Navigation</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-3">
              {nav.map((n) => {
                const path = location.pathname;
                const active = n.exact ? path === n.to : path === n.to || path.startsWith(n.to + "/");
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 cursor-pointer",
                      active
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-primary text-primary-foreground" : "bg-secondary"
                    )}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    {n.label}
                  </Link>
                );
              })}
            </div>
            <div className="border-t border-border p-3 space-y-2">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-primary-soft/20 p-3 shadow-sm hover:bg-primary-soft/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Go to adminpanel</div>
                      <div className="text-xs text-muted-foreground">Admin Console</div>
                    </div>
                  </div>
                  <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </Link>
              )}
              <button
                onClick={() => { setMobileDrawerOpen(false); logout(); }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-blood hover:bg-blood/8 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 shrink-0 text-blood" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile search modal — full-screen sheet with the global search bar */}
      {mobileSearchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden fade-in-backdrop"
            onClick={() => setMobileSearchOpen(false)}
          />
          {/* Top-pinned search sheet */}
          <div className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-hidden rounded-b-2xl border-b border-border bg-surface lg:hidden slide-down-enter">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-semibold">Search</span>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary cursor-pointer transition-colors"
                aria-label="Close search"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Search input + scrollable results */}
            <div className="px-4 pt-4">
              <GlobalSearchBar
                variant="modal"
                autoFocus
                onNavigate={() => setMobileSearchOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MobileNavLink({ to, label, icon: Icon, exact }: { to: string; label: string; icon: any; exact?: boolean }) {
  const location = useLocation();
  const path = location.pathname;
  const active = exact ? path === to : path === to || path.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={cn(
        "flex h-full flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200",
        active ? "bg-primary/10" : ""
      )}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      {label}
    </Link>
  );
}
