import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImagePlus, X, ArrowLeft } from "lucide-react";
import { Btn, Field, Input, Select, Textarea, PageHeader } from "@/components/ui-bits";
import { marketplaceCategories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const CONDITIONS = ["Like new", "Excellent", "Good", "Fair"];
const MAX_IMAGES = 6;

export default function NewListing() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "", category: "", price: "", condition: "Like new",
    location: "", phone: "", description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES - previews.length);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeImage = (i: number) => {
    setPreviews(p => p.filter((_, idx) => idx !== i));
    setImageFiles(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('price', form.price);
      formData.append('condition', form.condition);
      formData.append('location', form.location);
      formData.append('phone', form.phone);
      formData.append('description', form.description);

      imageFiles.forEach((file) => {
        formData.append('images[]', file);
      });

      await api.post('/api/marketplace', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate("/app/marketplace");
    } catch (error) {
      console.error("Failed to create listing", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Create listing"
        description="Set a fair price. Add clear photos. Sell faster."
      >
        <Link to="/app/marketplace">
          <Btn variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Btn>
        </Link>
      </PageHeader>

      <form className="space-y-6 rounded-2xl border border-border bg-surface p-6" onSubmit={handleSubmit}>

        {/* Image upload */}
        <Field label="Photos" hint={`${previews.length} of ${MAX_IMAGES} added`} required>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
                <img src={src} alt={`preview ${i}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-muted-foreground hover:text-blood"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {previews.length < MAX_IMAGES && (
              <label className={cn(
                "aspect-square cursor-pointer rounded-lg border border-dashed border-border bg-background",
                "grid place-items-center text-muted-foreground transition hover:border-primary hover:text-primary"
              )}>
                <div className="flex flex-col items-center gap-1">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px]">Add photo</span>
                </div>
                <input
                  id="listing-images"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImages}
                />
              </label>
            )}
            {/* Empty placeholder slots */}
            {Array.from({ length: Math.max(0, MAX_IMAGES - previews.length - 1) }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg border border-border bg-secondary/30" />
            ))}
          </div>
        </Field>

        {/* Core fields */}
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title" required>
            <Input
              id="listing-title"
              placeholder="e.g. Casio FX-991EX (Pristine)"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              required
            />
          </Field>
          <Field label="Category" required>
            <Select
              id="listing-category"
              value={form.category}
              onChange={e => set("category", e.target.value)}
              required
            >
              <option value="" disabled>Select category</option>
              {marketplaceCategories.filter(c => c !== "All").map(c => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Price (BDT)" required>
            <Input
              id="listing-price"
              type="number"
              min={0}
              placeholder="1450"
              value={form.price}
              onChange={e => set("price", e.target.value)}
              required
            />
          </Field>
          <Field label="Condition" required>
            <Select
              id="listing-condition"
              value={form.condition}
              onChange={e => set("condition", e.target.value)}
              required
            >
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Location" required>
            <Input
              id="listing-location"
              placeholder="Hall-3, KUET"
              value={form.location}
              onChange={e => set("location", e.target.value)}
              required
            />
          </Field>
          <Field label="Phone number" required>
            <Input
              id="listing-phone"
              type="tel"
              placeholder="+880 17XX XXX XXX"
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
              required
            />
          </Field>
        </div>

        <Field label="Description" required>
          <Textarea
            id="listing-description"
            rows={5}
            placeholder="Add details about the item — age, accessories included, reason for selling…"
            value={form.description}
            onChange={e => set("description", e.target.value)}
            required
          />
        </Field>

        {/* Tips */}
        <div className="rounded-lg border border-info/20 bg-info/5 px-4 py-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-info">Tips for faster sales</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Use clear, well-lit photos from multiple angles.</li>
            <li>Price realistically — check similar listings first.</li>
            <li>Mention all flaws honestly to build trust.</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Link to="/app/marketplace">
            <Btn variant="outline" type="button" size="sm">Cancel</Btn>
          </Link>
          <Btn type="submit" size="sm" disabled={submitting}>
            {submitting ? "Publishing…" : "Publish listing"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
