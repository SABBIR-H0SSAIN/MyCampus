import React, { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { MapPin, Search, Crosshair, Check, X, Navigation, Building2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Btn, Input } from "@/components/ui-bits";

const DEFAULT_COORDS = { lat: 22.9006, lng: 89.5024 }; // KUET Central Campus

// Popular Campus Preset Landmarks for Instant 1-Click Placement
const CAMPUS_PRESETS = [
  { name: "KUET Main Gate", lat: 22.8996, lng: 89.5042 },
  { name: "Fulbarigate Bus Stand", lat: 22.8990, lng: 89.5050 },
  { name: "Teligati Mor", lat: 22.9030, lng: 89.5015 },
  { name: "Khulna Medical College Hospital", lat: 22.8250, lng: 89.5400 },
  { name: "Central Library KUET", lat: 22.9008, lng: 89.5020 },
  { name: "Bangabandhu Hall", lat: 22.9015, lng: 89.5010 },
  { name: "Lalon Shah Hall", lat: 22.9000, lng: 89.5020 },
  { name: "Khan Jahan Ali Hall", lat: 22.8990, lng: 89.5010 },
  { name: "Shahid Smriti Hall", lat: 22.9010, lng: 89.5030 },
  { name: "Rokeya Hall", lat: 22.8995, lng: 89.5035 },
  { name: "KUET Auditorium", lat: 22.9012, lng: 89.5028 },
];

const customPinIcon = L.divIcon({
  className: "location-picker-pin",
  html: `<div class="relative cursor-grab active:cursor-grabbing">
    <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl border-2 border-white transition-transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-primary"></div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -38],
});

interface LocationPickerProps {
  value: string;
  lat?: number | null;
  lng?: number | null;
  onChange: (result: { address: string; lat: number; lng: number }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  modalTitle?: string;
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  value,
  lat,
  lng,
  onChange,
  placeholder = "e.g. Fulbarigate / KUET Campus",
  required = false,
  className = "",
  modalTitle = "Select Exact Location on Map",
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: lat || DEFAULT_COORDS.lat,
    lng: lng || DEFAULT_COORDS.lng,
  }));
  const [tempAddress, setTempAddress] = useState(value || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Sync coords if props change
  useEffect(() => {
    if (lat && lng) {
      setTempCoords({ lat, lng });
    }
  }, [lat, lng]);

  const handleOpenModal = () => {
    setTempCoords({
      lat: lat || DEFAULT_COORDS.lat,
      lng: lng || DEFAULT_COORDS.lng,
    });
    setTempAddress(value || "");
    setSearchQuery("");
    setIsOpen(true);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setIsReverseGeocoding(true);
    try {
      // Check nearest campus preset first (< 100m)
      for (const preset of CAMPUS_PRESETS) {
        const dLat = Math.abs(preset.lat - latitude);
        const dLng = Math.abs(preset.lng - longitude);
        if (dLat < 0.0015 && dLng < 0.0015) {
          setTempAddress(preset.name);
          setIsReverseGeocoding(false);
          return;
        }
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        // Extract concise readable part
        const parts = data.display_name.split(", ");
        const shortName = parts.slice(0, 3).join(", ");
        setTempAddress(shortName || data.display_name);
      }
    } catch {
      // Keep existing address on network error
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleCoordinateSelect = (selectedLat: number, selectedLng: number, addressOverride?: string) => {
    setTempCoords({ lat: selectedLat, lng: selectedLng });
    if (addressOverride) {
      setTempAddress(addressOverride);
    } else {
      reverseGeocode(selectedLat, selectedLng);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check presets first
    const preset = CAMPUS_PRESETS.find((p) =>
      p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (preset) {
      handleCoordinateSelect(preset.lat, preset.lng, preset.name);
      return;
    }

    setIsSearching(true);
    try {
      const query = searchQuery.toLowerCase().includes("khulna") || searchQuery.toLowerCase().includes("kuet")
        ? searchQuery
        : `${searchQuery}, Khulna, Bangladesh`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        const shortName = data[0].display_name.split(", ").slice(0, 3).join(", ");
        handleCoordinateSelect(foundLat, foundLng, shortName);
      }
    } catch {
      // Ignored
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleCoordinateSelect(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Geolocation denied or unavailable:", err);
        }
      );
    }
  };

  const handleConfirm = () => {
    const finalAddress = tempAddress.trim() || `${tempCoords.lat.toFixed(4)}, ${tempCoords.lng.toFixed(4)}`;
    onChange({
      address: finalAddress,
      lat: tempCoords.lat,
      lng: tempCoords.lng,
    });
    setIsOpen(false);
  };

  const markerRef = useRef<L.Marker | null>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          handleCoordinateSelect(newPos.lat, newPos.lng);
        }
      },
    }),
    []
  );

  return (
    <div className={className}>
      {/* Input Group with Map Trigger */}
      <div className="relative flex items-center">
        <Input
          value={value}
          onChange={(e) =>
            onChange({
              address: e.target.value,
              lat: lat || DEFAULT_COORDS.lat,
              lng: lng || DEFAULT_COORDS.lng,
            })
          }
          placeholder={placeholder}
          required={required}
          className="pr-10 text-xs sm:text-sm font-medium"
        />
        <button
          type="button"
          onClick={handleOpenModal}
          className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all cursor-pointer border border-primary/20 shadow-sm hover:scale-105"
          title="Pick location on map"
          aria-label="Pick location on map"
        >
          <MapPin className="h-4 w-4" />
        </button>
      </div>

      {lat && lng && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
          <span>Pinned GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
        </div>
      )}

      {/* Interactive Map Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-2/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">{modalTitle}</h3>
                  <p className="text-[11px] text-muted-foreground">Click anywhere or drag the pin to set your exact location</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Map Search & Landmark Presets Bar */}
            <div className="border-b border-border bg-surface p-3 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search area, road, or landmark..."
                      className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Btn size="sm" type="submit" disabled={isSearching} className="cursor-pointer text-xs h-9">
                    {isSearching ? "Searching..." : "Search"}
                  </Btn>
                </form>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition cursor-pointer h-9 shrink-0"
                >
                  <Navigation className="h-3.5 w-3.5 text-primary" />
                  <span>My Location</span>
                </button>
              </div>

              {/* Campus Landmark Quick Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-semibold text-muted-foreground shrink-0 flex items-center gap-1 mr-1">
                  <Building2 className="h-3 w-3" /> Quick spots:
                </span>
                {CAMPUS_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleCoordinateSelect(p.lat, p.lng, p.name)}
                    className="rounded-full border border-border bg-secondary/40 hover:bg-primary/10 hover:border-primary/40 hover:text-primary px-2.5 py-1 text-[11px] whitespace-nowrap transition cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Leaflet Map Frame */}
            <div className="relative h-[360px] sm:h-[420px] w-full bg-secondary/30">
              <MapContainer
                center={[tempCoords.lat, tempCoords.lng]}
                zoom={16}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler onSelect={handleCoordinateSelect} />
                <MapRecenter lat={tempCoords.lat} lng={tempCoords.lng} />
                <Marker
                  position={[tempCoords.lat, tempCoords.lng]}
                  icon={customPinIcon}
                  draggable={true}
                  eventHandlers={eventHandlers}
                  ref={markerRef}
                />
              </MapContainer>

              {/* Floating Helper Pill */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
                <div className="rounded-full bg-black/75 px-3.5 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-md">
                  💡 Click map or drag pin to position
                </div>
              </div>
            </div>

            {/* Modal Footer / Selected Location Confirmation */}
            <div className="border-t border-border bg-surface p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Selected Address:</span>
                  {isReverseGeocoding && <span className="text-[11px] text-primary animate-pulse">Resolving address...</span>}
                </div>
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Address or location description..."
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-xs font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] font-mono text-muted-foreground">
                  GPS: {tempCoords.lat.toFixed(6)}, {tempCoords.lng.toFixed(6)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1 sm:pt-0">
                <Btn
                  variant="outline"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer text-xs h-9"
                >
                  Cancel
                </Btn>
                <Btn
                  type="button"
                  onClick={handleConfirm}
                  className="cursor-pointer text-xs h-9 flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Set Location
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
