import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Filter, Home, Droplet, ShoppingBag, RefreshCw, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/ui-bits";
import { MultiPostMap, MapPostItem } from "@/components/ui/MultiPostMap";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function CampusMapPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all module data in parallel
  const { data: roommates = [] } = useQuery<any[]>({
    queryKey: ["roommates"],
    queryFn: async () => (await api.get("/api/roommates")).data,
  });

  const { data: bloodRequests = [] } = useQuery<any[]>({
    queryKey: ["blood-requests"],
    queryFn: async () => (await api.get("/api/blood-requests")).data,
  });

  const { data: marketplace = [] } = useQuery<any[]>({
    queryKey: ["marketplace"],
    queryFn: async () => {
      const res = await api.get("/api/marketplace");
      return res.data?.data || res.data || [];
    },
  });

  const { data: exchange = [] } = useQuery<any[]>({
    queryKey: ["exchange"],
    queryFn: async () => {
      const res = await api.get("/api/exchange");
      return res.data?.data || res.data || [];
    },
  });

  const { data: lostFound = [] } = useQuery<any[]>({
    queryKey: ["lost-found"],
    queryFn: async () => {
      const res = await api.get("/api/lost-found");
      return res.data?.data || res.data || [];
    },
  });

  // Combine into unified map items
  const allMapItems = useMemo(() => {
    const list: MapPostItem[] = [];

    // 1. Roommates
    (Array.isArray(roommates) ? roommates : []).forEach((r) => {
      list.push({
        id: `rm-${r.id}`,
        title: r.title,
        subtitle: `Rent: ৳${r.budget}/mo · ${r.status}`,
        location: r.location,
        categoryTag: "ROOMMATE",
      });
    });

    // 2. Blood Requests
    (Array.isArray(bloodRequests) ? bloodRequests : []).forEach((b) => {
      list.push({
        id: `blood-${b.id}`,
        title: `${b.blood_group} Needed (${b.units} units)`,
        subtitle: `${b.hospital} · ${b.priority}`,
        location: b.hospital,
        categoryTag: `BLOOD ${b.blood_group}`,
      });
    });

    // 3. Marketplace
    (Array.isArray(marketplace) ? marketplace : []).forEach((m) => {
      list.push({
        id: `mk-${m.id}`,
        title: m.title,
        subtitle: `Price: ৳${m.price} · ${m.category}`,
        location: "Central Campus, Dhaka",
        categoryTag: "MARKETPLACE",
      });
    });

    // 4. Product Exchange
    (Array.isArray(exchange) ? exchange : []).forEach((ex) => {
      list.push({
        id: `ex-${ex.id}`,
        title: `Offering: ${ex.offering}`,
        subtitle: `Wants: ${ex.desire}`,
        location: "Campus TSC, Dhaka",
        categoryTag: "EXCHANGE",
      });
    });

    // 5. Lost & Found
    (Array.isArray(lostFound) ? lostFound : []).forEach((lf) => {
      list.push({
        id: `lf-${lf.id}`,
        title: lf.title,
        subtitle: `${String(lf.type).toUpperCase()} · ${lf.category}`,
        location: lf.location || "Campus Library",
        categoryTag: "LOST & FOUND",
      });
    });

    return list;
  }, [roommates, bloodRequests, marketplace, exchange, lostFound]);

  // Filter items based on activeCategory and searchQuery
  const filteredMapItems = useMemo(() => {
    return allMapItems.filter((item) => {
      // Category filter
      if (activeCategory === "Roommates" && !item.categoryTag?.startsWith("ROOMMATE")) return false;
      if (activeCategory === "Blood" && !item.categoryTag?.startsWith("BLOOD")) return false;
      if (activeCategory === "Marketplace" && item.categoryTag !== "MARKETPLACE") return false;
      if (activeCategory === "Exchange" && item.categoryTag !== "EXCHANGE") return false;
      if (activeCategory === "Lost & Found" && item.categoryTag !== "LOST & FOUND") return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesSub = item.subtitle?.toLowerCase().includes(q);
        return matchesTitle || matchesLoc || matchesSub;
      }

      return true;
    });
  }, [allMapItems, activeCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interactive Campus Map"
        description="Unified OpenStreetMap view of active roommate ads, blood donation requests, marketplace items, and lost & found pins across campus."
      />

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { label: "All", count: allMapItems.length, icon: MapPin },
              { label: "Roommates", icon: Home },
              { label: "Blood", icon: Droplet },
              { label: "Marketplace", icon: ShoppingBag },
              { label: "Exchange", icon: RefreshCw },
              { label: "Lost & Found", icon: HelpCircle },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                  activeCategory === cat.label
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-surface text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search map location or post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Unified Multi-Marker Map */}
      <MultiPostMap items={filteredMapItems} height="h-[600px]" zoom={13} />
    </div>
  );
}
