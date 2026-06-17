import { Logo } from "@/components/brand/Logo";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function PendingApproval() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-warning/10 text-warning">
            <Clock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Registration Pending</h1>
            <p className="text-muted-foreground">
              Your account is currently under review by our administrators. This process ensures only verified KUET students can access MyCampus.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm">
            <p className="font-medium">What happens next?</p>
            <ul className="mt-2 text-left text-muted-foreground space-y-2 list-disc pl-5">
              <li>Admins will verify your student ID card.</li>
              <li>You will receive an email once approved.</li>
              <li>Approval typically takes 12-24 hours.</li>
            </ul>
          </div>
          <div className="pt-4">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
