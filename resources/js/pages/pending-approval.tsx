import { Logo } from "@/components/brand/Logo";
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
        <div className="max-w-md w-full text-center space-y-5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            You're in the queue<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground">
            Admins will verify your student ID. Most approvals happen within 12–24 hours —
            we'll email you the moment you're in.
          </p>
          <p className="pt-4 text-xs text-muted-foreground">
            Done waiting? <Link to="/login" className="font-medium text-primary hover:underline cursor-pointer">Return to login</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
