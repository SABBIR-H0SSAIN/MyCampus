import { cn } from "@/lib/utils";

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5 font-display font-semibold tracking-tight text-primary", className)}>
      <img src="/images/logo.png" alt="MYCampus Logo" className="h-12 w-12 sm:h-14 sm:w-14 object-contain shrink-0" />
      {!mark && <span className="text-2xl sm:text-3xl font-bold tracking-tight">MYCampus</span>}
    </div>
  );
}
