import { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search, Heart, MapPin, Plus, Tag, X, SlidersHorizontal,
  Edit3, CheckCircle, Package, Eye, ArrowUpDown, LayoutGrid,
  List, Phone, Flag, ImagePlus, ChevronLeft, ChevronRight,
  ExternalLink, ShieldCheck,
} from "lucide-react";
import { Badge, Btn, Card, PageHeader, Field, Input, Select, Textarea } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import { marketplaceListings, marketplaceCategories } from "@/lib/mock-data";

//  Types 
type Listing = {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  seller: string;
  sellerAvatar: string;
  sellerRoll: string;
  department: string;
  image: string;
  images: string[];
  sold: boolean;
  location: string;
  phone: string;
  description: string;
  selfPosted: boolean;
  favorites: boolean;
  postedAt: string;
};

//  Mock data with enriched fields 
const SELLER_AVATARS: Record<string, { avatar: string; roll: string }> = {
  "Tahmid R.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=tahmid", roll: "1907042" },
  "Anika T.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=anika", roll: "2005014" },
  "Rafi H.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=rafi", roll: "1809021" },
  "Ifaz K.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=ifaz", roll: "1903055" },
  "Sumaiya R.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=sumaiya", roll: "2007033" },
  "Naimul I.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=naimul", roll: "1701022" },
  "Mehrab S.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=mehrab", roll: "1905031" },
  "Sadia P.": { avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=sadia", roll: "2107015" },
};

const DESCRIPTIONS: Record<string, string> = {
  m1: "Pristine Casio FX-991EX scientific calculator. Bought last semester, used for exams only. No scratches, all functions work perfectly. Box and manual included.",
  m2: "Keychron K2 v2 with brown switches. Used 6 months for coding assignments. Comes with original USB-C cable. Minor keycap shine on home row.",
  m3: "Foxter MTB 26-inch. Serviced last month — new brake pads, fresh chain lube. No rust. Perfect for KUET gate to city-centre commute.",
  m4: "Frank White 8th edition. Highlighted chapters 1–6 only. Clean otherwise. Great for ME 2203. Selling because graduated.",
  m5: "MX Master 3S, wireless. Bought new 4 months ago. Slightly used, no marks. 7-button programmable. Perfect for design/dev work.",
  m6: "Foldable drafting table, wooden surface. Small chip on corner. Selling because switched to digital. Off-campus pickup only.",
  m7: "Wacom Intuos Small (CTL-4100). Comes with 3 spare nibs and original cable. No dead zones.",
  m8: "Casio FX-100MS in good condition. Minor scratches on back cover. All scientific functions verified.",
  m9: "JBL Charge 5 portable Bluetooth speaker. 20-hour battery. IP67 waterproof. Used indoors only. Includes original cable and box.",
  m10: "Full engineering drawing set: compass, dividers, set squares, French curves, scales. Used for 2 semesters. All pieces present.",
  m11: "Silver edition FX-991EX. Used twice for lab practicals. Still has protective film on screen. Works like new.",
  m12: "7-in-1 USB-C hub: 3×USB-A, SD, microSD, HDMI 4K, 100W PD. Upgrading to Thunderbolt dock, hence selling.",
};

const PHONES: Record<string, string> = {
  m1: "+880 1700 000042", m2: "+880 1711 000014", m3: "+880 1712 000021",
  m4: "+880 1713 000055", m5: "+880 1715 000033", m6: "+880 1717 000022",
  m7: "+880 1719 000031", m8: "+880 1718 000015", m9: "+880 1700 000042",
  m10: "+880 1700 000042", m11: "+880 1712 000021", m12: "+880 1718 000015",
};

function enrich(l: any, selfPosted = false): Listing {
  const s = SELLER_AVATARS[l.seller] ?? { avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${l.id}`, roll: "0000000" };
  return {
    ...l,
    sellerAvatar: s.avatar,
    sellerRoll: s.roll,
    images: [l.image, l.image],
    phone: PHONES[l.id] ?? "+880 1700 000000",
    description: DESCRIPTIONS[l.id] ?? "No description provided.",
    selfPosted,
    favorites: false,
    postedAt: "2d ago",
  };
}

const MOCK_LISTINGS: Listing[] = [
  ...marketplaceListings.map((l) => enrich(l, l.id === "m1" || l.id === "m2")),
  enrich({ id: "m9", title: "JBL Charge 5 Speaker", price: 5800, condition: "Excellent", category: "Electronics", seller: "Tahmid R.", department: "CSE '19", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=70", sold: false, location: "Hall-3" }, true),
  enrich({ id: "m10", title: "Engineering Drawing Set", price: 350, condition: "Good", category: "Academic", seller: "Tahmid R.", department: "CSE '19", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=70", sold: false, location: "Hall-3" }, true),
  enrich({ id: "m11", title: "Casio FX-991EX (Silver)", price: 1350, condition: "Like new", category: "Academic", seller: "Rafi H.", department: "ME '18", image: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=600&q=70", sold: false, location: "Hall-2" }),
  enrich({ id: "m12", title: "USB-C Hub — 7-in-1", price: 1800, condition: "Like new", category: "Electronics", seller: "Sadia P.", department: "EEE '21", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=70", sold: false, location: "Hall-7" }),
];

const CONDITIONS = ["All", "Like new", "Excellent", "Good", "Fair"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];
const COND_COLOR: Record<string, "success" | "info" | "warning" | "default"> = {
  "Like new": "success", "Excellent": "info", "Good": "warning", "Fair": "default",
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ listing, onClose, onToggleFav, onEdit, onMarkSold }: {
  listing: Listing;
  onClose: () => void;
  onToggleFav: (id: string) => void;
  onEdit: (l: Listing) => void;
  onMarkSold: (id: string) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = listing.images?.length ? listing.images : [listing.image];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-surface shadow-2xl max-h-[92dvh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5">
          <Badge variant={COND_COLOR[listing.condition]}>{listing.condition}</Badge>
          <div className="flex items-center gap-2">
            {listing.selfPosted && !listing.sold && (
              <Btn size="sm" variant="outline" onClick={() => { onClose(); onEdit(listing); }}>
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Btn>
            )}
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex flex-col sm:flex-row">
          {/* Gallery */}
          <div className="relative sm:w-5/12 shrink-0 bg-secondary">
            <div className="aspect-square relative overflow-hidden">
              <img src={imgs[imgIdx]} alt={listing.title} className="h-full w-full object-cover" />
              {listing.sold && (
                <div className="absolute inset-0 grid place-items-center bg-background/70">
                  <span className="rounded-full bg-surface px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-muted-foreground border border-border">Sold</span>
                </div>
              )}
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-background/80 hover:bg-background">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-background/80 hover:bg-background">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imgs.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={cn("h-1.5 rounded-full transition-all", i === imgIdx ? "w-4 bg-primary" : "w-1.5 bg-white/60")} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 p-2 overflow-x-auto">
                {imgs.map((src, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={cn("h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition", i === imgIdx ? "border-primary" : "border-border")}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-4 p-5 overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold leading-tight">{listing.title}</h2>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">৳ {listing.price.toLocaleString()}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                <Tag className="h-3 w-3" /> {listing.category}
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                <MapPin className="h-3 w-3" /> {listing.location}
              </span>
              <span className="rounded-md border border-border px-2.5 py-1 text-muted-foreground">
                Posted {listing.postedAt}
              </span>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>

            {/* Seller */}
            <div className="rounded-xl border border-border bg-background p-3.5">
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Seller</p>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={listing.sellerAvatar} alt={listing.seller} className="h-10 w-10 rounded-full border-2 border-border bg-secondary object-cover" />
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      {listing.seller}
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{listing.sellerRoll} · {listing.department}</p>
                  </div>
                </div>
                <Link
                  to="/app/profile"
                  onClick={onClose}
                  className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                >
                  Profile <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Actions */}
            {!listing.sold ? (
              <div className="space-y-2">
                <a
                  href={`tel:${listing.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  <Phone className="h-4 w-4" /> {listing.phone}
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleFav(listing.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition",
                      listing.favorites ? "border-blood/40 bg-blood/10 text-blood" : "border-border hover:bg-secondary"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", listing.favorites && "fill-current")} />
                    {listing.favorites ? "Saved" : "Save"}
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition">
                    <Flag className="h-4 w-4" /> Report
                  </button>
                </div>
                {listing.selfPosted && (
                  <button
                    onClick={() => { onMarkSold(listing.id); onClose(); }}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-success/30 bg-success/10 px-4 py-2.5 text-sm font-medium text-success hover:bg-success/15 transition"
                  >
                    <CheckCircle className="h-4 w-4" /> Mark as Sold
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-center text-sm text-muted-foreground">
                This item has been sold.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Full Edit Modal ──────────────────────────────────────────────────────────
function EditModal({ listing, onClose, onSave }: {
  listing: Listing;
  onClose: () => void;
  onSave: (l: Listing) => void;
}) {
  const [form, setForm] = useState({
    title: listing.title,
    price: listing.price,
    condition: listing.condition,
    category: listing.category,
    location: listing.location,
    phone: listing.phone,
    description: listing.description,
  });
  const [previews, setPreviews] = useState<string[]>(listing.images ?? [listing.image]);

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).slice(0, 6 - previews.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-surface shadow-2xl max-h-[92dvh] flex flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <p className="font-semibold">Edit listing</p>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="overflow-y-auto p-5 space-y-5"
          onSubmit={e => {
            e.preventDefault();
            onSave({ ...listing, ...form, images: previews, image: previews[0] ?? listing.image });
          }}
        >
          {/* Photo grid */}
          <Field label="Photos" hint={`${previews.length} of 6`} required>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-muted-foreground hover:text-blood">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {previews.length < 6 && (
                <label className="aspect-square cursor-pointer rounded-lg border border-dashed border-border bg-background grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition">
                  <div className="flex flex-col items-center gap-1">
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px]">Add</span>
                  </div>
                  <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImages} />
                </label>
              )}
              {Array.from({ length: Math.max(0, 5 - previews.length) }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg border border-border bg-secondary/30" />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required>
              <Input id="edit-title" value={form.title} onChange={e => set("title", e.target.value)} required />
            </Field>
            <Field label="Category" required>
              <Select id="edit-category" value={form.category} onChange={e => set("category", e.target.value)} required>
                {marketplaceCategories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Price (BDT)" required>
              <Input id="edit-price" type="number" min={0} value={form.price} onChange={e => set("price", Number(e.target.value))} required />
            </Field>
            <Field label="Condition" required>
              <Select id="edit-condition" value={form.condition} onChange={e => set("condition", e.target.value)} required>
                {CONDITIONS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Location" required>
              <Input id="edit-location" value={form.location} onChange={e => set("location", e.target.value)} required />
            </Field>
            <Field label="Phone number" required>
              <Input id="edit-phone" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} required placeholder="+880 17XX XXX XXX" />
            </Field>
          </div>

          <Field label="Description" required>
            <Textarea id="edit-description" rows={4} value={form.description} onChange={e => set("description", e.target.value)} required />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="outline" type="button" onClick={onClose} size="sm">Cancel</Btn>
            <Btn type="submit" size="sm">Save changes</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

//  Listing Card 
function ListingCard({ listing, viewMode, onToggleFav, onEdit, onClick }: {
  listing: Listing;
  viewMode: "grid" | "list";
  onToggleFav: (id: string) => void;
  onEdit?: (l: Listing) => void;
  onClick: (l: Listing) => void;
}) {
  if (viewMode === "list") {
    return (
      <Card
        className={cn("flex gap-4 p-3 cursor-pointer transition hover:border-primary/40 hover:shadow-sm", listing.sold && "opacity-60")}
        onClick={() => onClick(listing)}
      >
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
          <img src={listing.image} alt={listing.title} loading="lazy" className="h-full w-full object-cover" />
          {listing.sold && <div className="absolute inset-0 grid place-items-center bg-background/70"><Badge variant="outline">Sold</Badge></div>}
        </div>
        <div className="flex flex-1 items-start justify-between gap-3 min-w-0" onClick={e => e.stopPropagation()}>
          <div className="min-w-0 cursor-pointer" onClick={() => onClick(listing)}>
            <p className="truncate text-sm font-semibold">{listing.title}</p>
            <p className="font-mono text-sm font-bold text-primary mt-0.5">৳ {listing.price.toLocaleString()}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <Badge variant={COND_COLOR[listing.condition]} className="text-[10px]">{listing.condition}</Badge>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>
            </div>
            {/* Seller row */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <img src={listing.sellerAvatar} alt="" className="h-4 w-4 rounded-full border border-border bg-secondary" />
              <Link to="/app/profile" onClick={e => e.stopPropagation()} className="font-mono text-[10px] text-muted-foreground hover:text-primary transition">
                {listing.seller} · {listing.department}
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {listing.selfPosted && onEdit && !listing.sold && (
              <button onClick={e => { e.stopPropagation(); onEdit(listing); }} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onToggleFav(listing.id); }}
              className={cn("grid h-8 w-8 place-items-center rounded-md", listing.favorites ? "text-blood" : "text-muted-foreground hover:text-blood")}
              aria-label="Save"
            >
              <Heart className={cn("h-4 w-4", listing.favorites && "fill-current")} />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Grid card
  return (
    <Card
      className={cn("overflow-hidden cursor-pointer transition hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]", listing.sold && "opacity-60")}
      onClick={() => onClick(listing)}
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img src={listing.image} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        {listing.selfPosted && !listing.sold && (
          <div className="absolute left-2 top-2">
            <Badge variant="primary" className="text-[10px]">My Ad</Badge>
          </div>
        )}
        <button
          aria-label={listing.favorites ? "Remove from saved" : "Save listing"}
          onClick={e => { e.stopPropagation(); onToggleFav(listing.id); }}
          className={cn("absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 transition", listing.favorites ? "text-blood" : "text-muted-foreground hover:text-blood")}
        >
          <Heart className={cn("h-4 w-4", listing.favorites && "fill-current")} />
        </button>
        {listing.selfPosted && onEdit && !listing.sold && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(listing); }}
            className="absolute right-2 bottom-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-muted-foreground hover:text-foreground transition"
            aria-label="Edit listing"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
        )}
        {listing.sold && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold tracking-wider uppercase text-muted-foreground border border-border">Sold</span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{listing.title}</h3>
        <p className="font-mono text-sm font-bold text-primary">৳ {listing.price.toLocaleString()}</p>
        <div className="flex items-center justify-between">
          <Badge variant={COND_COLOR[listing.condition]} className="text-[10px]">{listing.condition}</Badge>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{listing.location}</span>
        </div>
        {/* Seller row */}
        <div className="flex items-center gap-1.5 pt-0.5" onClick={e => e.stopPropagation()}>
          <img src={listing.sellerAvatar} alt="" className="h-4 w-4 rounded-full border border-border bg-secondary" />
          <Link to="/app/profile" className="font-mono text-[10px] text-muted-foreground hover:text-primary transition truncate">
            {listing.seller} · {listing.department}
          </Link>
        </div>
      </div>
    </Card>
  );
}

//  Main Page 
export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"all" | "my" | "saved">("all");
  const [detailListing, setDetailListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const toggleFav = (id: string) =>
    setListings(prev => prev.map(l => l.id === id ? { ...l, favorites: !l.favorites } : l));

  const handleSaveEdit = (updated: Listing) => {
    setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    setEditingListing(null);
  };

  const markSold = (id: string) => {
    setMarkingId(id);
    setTimeout(() => {
      setListings(prev => prev.map(l => l.id === id ? { ...l, sold: true } : l));
      setMarkingId(null);
    }, 600);
  };

  const filtered = useMemo(() => {
    let data = listings;
    if (activeTab === "my") data = data.filter(l => l.selfPosted);
    if (activeTab === "saved") data = data.filter(l => l.favorites);
    if (search.trim()) data = data.filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.seller.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedCategory !== "All") data = data.filter(l => l.category === selectedCategory);
    if (selectedCondition !== "All") data = data.filter(l => l.condition === selectedCondition);
    return [...data].sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return 0;
    });
  }, [listings, search, selectedCategory, selectedCondition, sortBy, activeTab]);

  const myCounts = {
    active: listings.filter(l => l.selfPosted && !l.sold).length,
    sold: listings.filter(l => l.selfPosted && l.sold).length,
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Marketplace" description="Buy and sell within the verified KUET community.">
        <Link to="/app/marketplace/new">
          <Btn size="sm"><Plus className="h-4 w-4" /> List item</Btn>
        </Link>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["all", "my", "saved"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2.5 text-sm font-medium transition",
              activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "all" ? "All listings" : tab === "my" ? `My Ads (${myCounts.active})` : `Saved (${listings.filter(l => l.favorites).length})`}
          </button>
        ))}
      </div>

      {/* My Ads stats */}
      {activeTab === "my" && (
        <div className="flex flex-wrap gap-3">
          {([
            [Package, "text-primary", myCounts.active, "active"],
            [CheckCircle, "text-success", myCounts.sold, "sold"],
            [Eye, "text-info", 247, "views"],
          ] as const).map(([Icon, color, value, label]) => (
            <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5">
              <Icon className={cn("h-4 w-4", color)} />
              <span className="text-sm"><span className="font-bold">{value}</span> <span className="text-muted-foreground">{label}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Search + Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="marketplace-search" type="search" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search listings, sellers…"
            className="h-10 w-full rounded-md border border-input bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div className="relative">
          <select id="marketplace-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="h-10 appearance-none rounded-md border border-input bg-surface pl-3 pr-8 text-sm outline-none transition focus:border-primary">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
        <button
          id="marketplace-filter-toggle"
          onClick={() => setShowFilters(v => !v)}
          className={cn("flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
            showFilters ? "border-primary bg-primary-soft text-primary" : "border-input bg-surface text-muted-foreground hover:text-foreground")}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {(selectedCategory !== "All" || selectedCondition !== "All") && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {(selectedCategory !== "All" ? 1 : 0) + (selectedCondition !== "All" ? 1 : 0)}
            </span>
          )}
        </button>
        <div className="flex overflow-hidden rounded-md border border-input bg-surface">
          {([["grid", LayoutGrid], ["list", List]] as const).map(([mode, Icon]) => (
            <button key={mode} id={`view-${mode}`} onClick={() => setViewMode(mode)}
              className={cn("flex h-10 w-10 items-center justify-center transition",
                mode === "list" && "border-l border-input",
                viewMode === mode ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Filter options</p>
            <button onClick={() => { setSelectedCategory("All"); setSelectedCondition("All"); }} className="text-xs text-muted-foreground hover:text-foreground transition">Reset all</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["Category", marketplaceCategories, selectedCategory, setSelectedCategory],
              ["Condition", CONDITIONS, selectedCondition, setSelectedCondition],
            ] as const).map(([label, opts, selected, setFn]) => (
              <div key={label}>
                <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {opts.map(c => (
                    <button key={c} onClick={() => setFn(c)}
                      className={cn("rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition",
                        selected === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"
                      )}>{c}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> listing{filtered.length !== 1 ? "s" : ""}
        {search && <> for "<span className="font-medium text-foreground">{search}</span>"</>}
      </p>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Tag className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No listings found</p>
          <p className="text-xs text-muted-foreground/60">Try adjusting your filters or search query</p>
          {(search || selectedCategory !== "All" || selectedCondition !== "All") && (
            <Btn variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedCondition("All"); }}>Clear filters</Btn>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map(listing => (
            <ListingCard key={listing.id} listing={listing} viewMode="grid"
              onToggleFav={toggleFav}
              onEdit={listing.selfPosted ? setEditingListing : undefined}
              onClick={setDetailListing}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(listing => (
            <div key={listing.id}>
              <ListingCard listing={listing} viewMode="list"
                onToggleFav={toggleFav}
                onEdit={listing.selfPosted ? setEditingListing : undefined}
                onClick={setDetailListing}
              />
              {activeTab === "my" && listing.selfPosted && !listing.sold && (
                <div className="mt-1 flex justify-end">
                  <button
                    onClick={() => markSold(listing.id)}
                    disabled={markingId === listing.id}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-success hover:bg-success/10 transition"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {markingId === listing.id ? "Marking…" : "Mark as sold"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detailListing && (
        <DetailModal
          listing={listings.find(l => l.id === detailListing.id) ?? detailListing}
          onClose={() => setDetailListing(null)}
          onToggleFav={toggleFav}
          onEdit={l => { setDetailListing(null); setEditingListing(l); }}
          onMarkSold={markSold}
        />
      )}

      {/* Edit Modal */}
      {editingListing && (
        <EditModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
