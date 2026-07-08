import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Flag, AlertTriangle } from "lucide-react";
import { Btn, Field, Select, Textarea } from "@/components/ui-bits";
import api from "@/lib/api";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reportableType: string;
  reportableId: string;
  itemTitle?: string;
};

const REPORT_REASONS = [
  "Inappropriate content or language",
  "Spam or misleading",
  "Scam or fraudulent activity",
  "Harassment or bullying",
  "Other"
];

export function ReportModal({ isOpen, onClose, reportableType, reportableId, itemTitle }: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/reports", {
        reportable_type: reportableType,
        reportable_id: reportableId,
        reason,
        description
      });
      return res.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setReason(REPORT_REASONS[0]);
        setDescription("");
        onClose();
      }, 2000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-6">
        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center text-success">
              <Flag className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl">Report Submitted</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for keeping our community safe. Our moderation team will review this shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-blood">
                <Flag className="h-5 w-5" />
                <h3 className="font-semibold text-lg text-foreground">Report Content</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-5 w-5 cursor-pointer" />
              </button>
            </div>

            {itemTitle && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                <div>
                  <span className="font-medium">You are reporting:</span>
                  <p className="text-muted-foreground line-clamp-2 mt-0.5">{itemTitle}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Reason for reporting" required>
                <Select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  {REPORT_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Additional details (optional)">
                <Textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide any additional context to help our moderators understand the issue..."
                />
              </Field>

              <div className="pt-4 flex justify-end gap-3">
                <Btn variant="outline" type="button" onClick={onClose}>Cancel</Btn>
                <Btn type="submit" disabled={reportMutation.isPending} className="bg-blood text-white hover:bg-blood/90 border-transparent">
                  {reportMutation.isPending ? "Submitting..." : "Submit Report"}
                </Btn>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
