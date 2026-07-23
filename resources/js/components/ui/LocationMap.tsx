import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Create clean, crisp vector marker pin without glowing rings
const createLocationPin = (colorClass: string = "bg-[#0d9488] text-white border-2 border-white shadow-md") => {
  return L.divIcon({
    className: "custom-map-pin-icon",
    html: `<div class="relative cursor-pointer">
      <div class="flex h-9 w-9 items-center justify-center rounded-xl ${colorClass} transition-transform duration-200 hover:scale-110 hover:z-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${colorClass.split(' ')[0]}"></div>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
};

const DEFAULT_CENTER = { lat: 23.7644, lng: 90.3892 };

// High-speed local coordinate dictionary (0ms lookup)
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

function quickResolveLocation(addressStr: string): { lat: number; lng: number } | null {
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

interface LocationMapProps {
  address?: string;
  lat?: number;
  lng?: number;
  title: string;
  subtitle?: string;
  height?: string;
  zoom?: number;
  badgeColor?: string;
}

function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom, { animate: true });
  }, [lat, lng, zoom, map]);
  return null;
}

export function LocationMap({
  address,
  lat: propLat,
  lng: propLng,
  title,
  subtitle,
  height = "h-56",
  zoom = 14,
  badgeColor = "bg-[#0d9488] text-white border-2 border-white shadow-md",
}: LocationMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (propLat && propLng) return { lat: propLat, lng: propLng };
    if (address) {
      const matched = quickResolveLocation(address);
      if (matched) return matched;
    }
    return DEFAULT_CENTER;
  });

  useEffect(() => {
    if (propLat && propLng) {
      setCoords({ lat: propLat, lng: propLng });
      return;
    }

    if (!address) return;

    const matched = quickResolveLocation(address);
    if (matched) {
      setCoords(matched);
      return;
    }

    const clean = address.trim().toLowerCase();
    const searchQuery = clean.includes("dhaka") || clean.includes("khulna")
      ? address
      : `${address}, Bangladesh`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const newCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          geocodeCache.set(clean, newCoords);
          setCoords(newCoords);
        }
      })
      .catch(() => {});
  }, [address, propLat, propLng]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address || `${coords.lat},${coords.lng}`
  )}`;

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-border/80 bg-surface-2/80 px-3.5 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <span className="truncate">{address || title}</span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer shrink-0"
        >
          Open in Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Map Canvas Frame */}
      <div className={`${height} w-full relative z-0`}>
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={zoom}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <RecenterMap lat={coords.lat} lng={coords.lng} zoom={zoom} />
          <Marker position={[coords.lat, coords.lng]} icon={createLocationPin(badgeColor)}>
            <Popup>
              <div className="p-3.5 space-y-1.5 text-xs">
                <div className="font-bold text-foreground text-sm leading-tight">{title}</div>
                {subtitle && <div className="font-semibold text-primary">{subtitle}</div>}
                {address && <div className="text-[11px] text-muted-foreground">{address}</div>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
