import { Logo } from "@/components/brand/Logo";
import { XCircle, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Btn } from "@/components/ui-bits";

export default function RegistrationRejected() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-destructive">Registration Rejected</h1>
            <p className="text-muted-foreground">
              Unfortunately, your registration request has been rejected by the administrator.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm text-left">
            <p className="font-semibold text-foreground">Rejection Reason:</p>
            <p className="mt-2 text-muted-foreground italic">
              {user?.rejection_reason || "No specific reason was provided. Please verify your uploaded student ID card matches your registration details."}
            </p>
          </div>
          <div className="pt-4 flex flex-col items-center gap-4">
            <Btn variant="danger" onClick={logout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Log out & re-register
            </Btn>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline cursor-pointer">
              Return to Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
