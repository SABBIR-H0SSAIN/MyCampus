import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Btn, Field, Input, Textarea, PageHeader } from "@/components/ui-bits";
import { ImagePlus, X, ArrowRightLeft } from "lucide-react";
import api from "@/lib/api";

export default function NewExchange() {
  const navigate = useNavigate();
  const [offerImage, setOfferImage] = useState<string | null>(null);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [wantImage, setWantImage] = useState<string | null>(null);
  const [wantFile, setWantFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (val: string | null) => void, setFile: (f: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Create new FormData to format exactly what the API expects
    const submitData = new FormData();
    submitData.append('offering', formData.get('offering') as string);
    submitData.append('desire', formData.get('desire') as string);
    submitData.append('description', formData.get('description') as string);
    submitData.append('phone', formData.get('phone') as string);
    
    if (offerFile) submitData.append('images[]', offerFile);
    if (wantFile) submitData.append('images[]', wantFile);

    try {
      await api.post('/api/exchange', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate("/app/exchange");
    } catch (err) {
      console.error("Failed to create exchange post", err);
      alert("Failed to post. Check console for details.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="New exchange post" description="Describe what you're offering and what you're looking for.">
        <Link to="/app/exchange">
          <Btn variant="outline" size="sm">Cancel</Btn>
        </Link>
      </PageHeader>
      
      <form 
        className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden" 
        onSubmit={handleSubmit}
      >
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Offering Section */}
          <div className="p-6 md:p-8 space-y-6 bg-background/50">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                1
              </div>
              <h2 className="text-lg font-semibold">What you offer</h2>
            </div>
            
            <Field label="Product Photo" required>
              {offerImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary group">
                  <img src={offerImage} alt="Offering" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => { setOfferImage(null); setOfferFile(null); }} className="h-10 w-10 bg-background rounded-full flex items-center justify-center text-blood hover:bg-surface shadow-sm transition-transform hover:scale-110">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <div className="rounded-full bg-secondary p-4 text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload offering photo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImage(e, setOfferImage, setOfferFile)} required />
                </label>
              )}
            </Field>

            <Field label="Product Name" required>
              <Input name="offering" placeholder="e.g. Casio FX-991EX Calculator" required />
            </Field>
            
            <Field label="Details & Condition" required>
              <Textarea name="description" rows={4} placeholder="Describe the condition, age, and any other relevant details..." required />
            </Field>

            <Field label="Your Phone Number" required>
              <Input name="phone" type="tel" placeholder="+880 17XX XXX XXX" required />
            </Field>
          </div>

          {/* Want Section */}
          <div className="p-6 md:p-8 space-y-6 bg-surface">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success font-semibold">
                  2
                </div>
                <h2 className="text-lg font-semibold">What you want</h2>
              </div>
              <ArrowRightLeft className="h-5 w-5 text-muted-foreground/50" />
            </div>

            <Field label="Reference Photo (Optional)">
              {wantImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary group">
                  <img src={wantImage} alt="Wanted" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => { setWantImage(null); setWantFile(null); }} className="h-10 w-10 bg-background rounded-full flex items-center justify-center text-blood hover:bg-surface shadow-sm transition-transform hover:scale-110">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-colors">
                  <div className="rounded-full bg-secondary p-4 text-muted-foreground">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Upload reference photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Optional, helps others understand what you need</p>
                  </div>
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleImage(e, setWantImage, setWantFile)} />
                </label>
              )}
            </Field>

            <Field label="Desired Item Name" required>
              <Input name="desire" placeholder="e.g. Engineering Mathematics by Stroud" required />
            </Field>

            <Field label="Acceptable Extras">
              <Input placeholder="e.g. + 500 BDT cash, or can take older edition" />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-background/50 p-6">
          <Link to="/app/exchange">
            <Btn type="button" variant="outline" disabled={isSubmitting}>Cancel</Btn>
          </Link>
          <Btn type="submit" size="lg" className="min-w-[200px]" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Exchange"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
