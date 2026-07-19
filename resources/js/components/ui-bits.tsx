import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-0 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Select.displayName = "Select";

export const Btn = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "danger" | "primary" | "blood", size?: "default" | "sm" | "lg" }>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer press-effect",
          (variant === "default" || variant === "primary") && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
          (variant === "danger" || variant === "blood") && "bg-blood text-white hover:bg-blood/90 shadow-sm",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-xl px-3",
          size === "lg" && "h-11 rounded-xl px-8",
          className
        )}
        {...props}
      />
    );
  }
);
Btn.displayName = "Btn";

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} {required && <span className="text-blood">*</span>}
      </label>
      {children}
      {hint && <p className="text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-border bg-card text-card-foreground shadow-sm card-hover-glow transition-all duration-200", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ className, variant = "default", children, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "outline" | "warning" | "success" | "blood" | "info" | "primary" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "primary" && "border-transparent bg-primary/12 text-primary",
        variant === "outline" && "text-foreground border-border",
        variant === "warning" && "border-transparent bg-warning/15 text-warning",
        variant === "success" && "border-transparent bg-success/12 text-success",
        variant === "info" && "border-transparent bg-info/12 text-info",
        variant === "blood" && "border-transparent bg-blood/12 text-blood",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-5 mb-5 md:flex-row md:items-end md:justify-between relative">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children && <div className="mt-4 flex items-center gap-2 md:mt-0">{children}</div>}
      {/* Gradient accent line */}
      <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
    </div>
  );
}

export function Stat({ label, value, hint, accent = "default" }: { label: string; value: string | number; hint?: React.ReactNode; accent?: "default" | "warning" | "success" | "blood" }) {
  return (
    <Card className={cn("p-4 flex flex-col justify-between relative overflow-hidden card-hover-lift", accent !== "default" && "")}>
      {/* Accent bar at top */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[3px] rounded-t-xl",
        accent === "default" && "bg-gradient-to-r from-primary/60 to-primary/20",
        accent === "warning" && "bg-gradient-to-r from-warning/60 to-warning/20",
        accent === "success" && "bg-gradient-to-r from-success/60 to-success/20",
        accent === "blood" && "bg-gradient-to-r from-blood/60 to-blood/20",
      )} />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {accent !== "default" && <span className={cn("h-2 w-2 rounded-full", accent === "warning" && "bg-warning", accent === "success" && "bg-success", accent === "blood" && "bg-blood")} />}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </Card>
  );
}
