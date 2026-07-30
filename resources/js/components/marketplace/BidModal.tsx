import { useState } from "react";
import { Gavel, X, ArrowRight, TrendingUp } from "lucide-react";
import { Btn, Field, Input, Textarea } from "@/components/ui-bits";

interface BidModalProps {
  listing: {
    id: string;
    title: string;
    price: number;
    highestBid?: number | null;
    bidsCount?: number;
    image?: string;
    seller?: string;
    myBid?: {
      id: string;
      amount: number;
      message?: string;
      status: string;
    } | null;
  };
  onClose: () => void;
  onSubmit: (data: { amount: number; message: string; phone: string }) => void;
  isPending: boolean;
}

export function BidModal({ listing, onClose, onSubmit, isPending }: BidModalProps) {
  const defaultAmount = listing.myBid?.amount || (listing.highestBid ? Math.round(listing.highestBid * 1.05) : listing.price);
  const [amount, setAmount] = useState<number | string>(defaultAmount);
  const [message, setMessage] = useState(listing.myBid?.message || "");
  const [phone, setPhone] = useState("");

  const handleIncrement = (inc: number) => {
    const current = typeof amount === "number" ? amount : parseFloat(amount) || listing.price;
    setAmount(current + inc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === "number" ? amount : parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    onSubmit({ amount: numAmount, message, phone });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
              <Gavel className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {listing.myBid ? "Update Your Bid" : "Place a Bid / Offer"}
              </h3>
              <p className="text-xs text-muted-foreground">Make a competitive offer to the seller</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Listing preview banner */}
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl mb-5 border border-border/60">
          {listing.image && (
            <img src={listing.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-border/80" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm line-clamp-1">{listing.title}</p>
            <div className="flex items-center gap-3 text-xs mt-0.5">
              <span className="text-muted-foreground">Asking: <strong className="text-foreground">৳{listing.price.toLocaleString()}</strong></span>
              {listing.highestBid ? (
                <span className="text-primary font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Top Bid: ৳{listing.highestBid.toLocaleString()}
                </span>
              ) : (
                <span className="text-muted-foreground">No bids yet</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Field label="Your Offer Amount (৳)" required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">৳</span>
                <Input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 font-mono text-base font-bold"
                  placeholder="e.g. 1200"
                />
              </div>
            </Field>

            {/* Quick increment buttons */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-muted-foreground font-medium">Quick add:</span>
              {[50, 100, 200, 500].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleIncrement(inc)}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition cursor-pointer"
                >
                  +৳{inc}
                </button>
              ))}
            </div>
          </div>

          <Field label="Note / Meeting Spot (Optional)" hint="e.g., Can pick up today at Central Library">
            <Textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add terms or flexible meeting times..."
            />
          </Field>

          <Field label="Your Phone (Optional)">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 17..."
            />
          </Field>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border mt-5">
            <Btn variant="outline" type="button" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : (
                <>
                  <Gavel className="h-4 w-4 mr-1.5" />
                  {listing.myBid ? "Update Bid" : "Submit Bid"}
                </>
              )}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
