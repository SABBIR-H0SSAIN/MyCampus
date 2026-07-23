import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, ArrowRight, Layers } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface MapPostItem {
  id: string | number;
  title: string;
  subtitle?: string;
  location: string;
  categoryTag?: string;
  lat?: number;
  lng?: number;
  badgeVariant?: "primary" | "blood" | "success" | "outline";
  onSelect?: () => void;
}

const DEFAULT_CENTER = { lat: 23.7644, lng: 90.3892 };

// High-speed local coordinate dictionary for instant 0ms map rendering
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  fulbarigate: { lat: 22.8996, lng: 89.5042 },
  sonadanga: { lat: 22.8188, lng: 89.5537 },
  teligati: { lat: 22.9030, lng: 89.5015 },
  kuet: { lat: 22.9006, lng: 89.5024 },
  "lalon shah hall": { lat: 22.9000, lng: 89.5020 },
  "khan jahan ali hall": { lat: 22.8990, lng: 89.5010 },
  "shahid smriti hall": { lat: 22.9010, lng: 89.5030 },
  mirpur: { lat: 23.8069, lng: 90.3687 },
  dhanmondi: { lat: 23.7461, lng: 90.3742 },
  tsc: { lat: 23.7324, lng: 90.3957 },
  farmgate: { lat: 23.7561, lng: 90.3872 },
  uttara: { lat: 23.8759, lng: 90.3795 },
  "square hospital": { lat: 23.7531, lng: 90.3817 },
  "dhaka medical": { lat: 23.7258, lng: 90.3976 },
  "evercare hospital": { lat: 23.8103, lng: 90.4312 },
  "rajshahi medical": { lat: 24.3733, lng: 88.5833 },
};

const geocodeCache = new Map<string, { lat: number; lng: number }>();

function quickResolve(addressStr: string): { lat: number; lng: number } | null {
  if (!addressStr) return null;
  const lower = addressStr.toLowerCase();

  for (const [key, coords] of Object.entries(KNOWN_LOCATIONS)) {
    if (lower.includes(key)) {
      return coords;
    }
  }

  if (geocodeCache.has(lower)) {
    return geocodeCache.get(lower)!;
  }

  return null;
}

// Category-based SVG Pin Icon — Clean, crisp, no glowing pulse rings
function createCategoryPinIcon(tag: string = "") {
  let colorBg = "bg-[#0d9488] text-white border-2 border-white shadow-md"; // Teal for Roommates
  let symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

  const tagUpper = tag.toUpperCase();

  if (tagUpper.startsWith("BLOOD")) {
    colorBg = "bg-[#e11d48] text-white border-2 border-white shadow-md"; // Rose Red
    symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;
  } else if (tagUpper === "MARKETPLACE") {
    colorBg = "bg-[#4f46e5] text-white border-2 border-white shadow-md"; // Indigo
    symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  } else if (tagUpper === "EXCHANGE") {
    colorBg = "bg-[#9333ea] text-white border-2 border-white shadow-md"; // Purple
    symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`;
  } else if (tagUpper === "LOST & FOUND") {
    colorBg = "bg-[#d97706] text-white border-2 border-white shadow-md"; // Amber
    symbolSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
  }

  return L.divIcon({
    className: "custom-map-pin-icon",
    html: `<div class="relative cursor-pointer">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl ${colorBg} transition-transform duration-200 hover:scale-110 hover:z-50">
        ${symbolSvg}
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${colorBg.split(' ')[0]}"></div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
}

interface MultiPostMapProps {
  items: MapPostItem[];
  height?: string;
  zoom?: number;
  className?: string;
}

function MapBoundsFitter({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }
  }, [points, map]);
  return null;
}

export function MultiPostMap({
  items,
  height = "h-[540px]",
  zoom = 13,
  className = "",
}: MultiPostMapProps) {
  // Compute resolved items & apply radial distribution for duplicate locations so pins don't overlap
  const resolvedItems = useMemo(() => {
    const locationCounts: Record<string, number> = {};

    return items.map((item, idx) => {
      let baseLat = item.lat;
      let baseLng = item.lng;

      if (!baseLat || !baseLng) {
        const quick = quickResolve(item.location);
        if (quick) {
          baseLat = quick.lat;
          baseLng = quick.lng;
        } else {
          baseLat = DEFAULT_CENTER.lat;
          baseLng = DEFAULT_CENTER.lng;
        }
      }

      const locKey = (item.location || "campus").toLowerCase().trim();
      const count = locationCounts[locKey] || 0;
      locationCounts[locKey] = count + 1;

      // Apply radial spread for stacked pins so markers are offset neatly around the area
      if (count > 0) {
        const angle = count * (2 * Math.PI / 5);
        const radius = 0.003 * Math.sqrt(count); // ~300m radial spread
        baseLat += radius * Math.cos(angle);
        baseLng += radius * Math.sin(angle);
      }

      return {
        ...item,
        lat: baseLat,
        lng: baseLng,
      };
    });
  }, [items]);

  const points = resolvedItems.map((i) => ({ lat: i.lat, lng: i.lng }));

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xl transition-all duration-300 ${className}`}>
      {/* Map Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border/80 bg-surface-2/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <span>Interactive Campus Location Map</span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary">
            {resolvedItems.length} active pins
          </span>
        </div>
      </div>

      {/* Map Frame */}
      <div className={`${height} w-full relative z-0`}>
        <MapContainer
          center={points.length > 0 ? [points[0].lat, points[0].lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {points.length > 0 && <MapBoundsFitter points={points} />}

          {resolvedItems.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCategoryPinIcon(item.categoryTag)}
            >
              <Popup>
                <div className="p-3.5 space-y-2 text-xs font-sans min-w-[200px] max-w-[240px]">
                  {item.categoryTag && (
                    <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                      {item.categoryTag}
                    </span>
                  )}
                  <div className="font-bold text-foreground text-sm leading-tight">{item.title}</div>
                  {item.subtitle && <div className="text-primary font-semibold">{item.subtitle}</div>}
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  {item.onSelect && (
                    <button
                      onClick={() => item.onSelect?.()}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 px-3 py-2 font-sans text-xs font-bold text-primary-foreground transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                      type="button"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
