import { cn } from "@/lib/utils";

export function Logo({ 
  className, 
  mark = false,
  size = "lg"
}: { 
  className?: string; 
  mark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: {
      container: "gap-1.5",
      img: "h-8 w-8",
      text: "text-lg"
    },
    md: {
      container: "gap-2",
      img: "h-10 w-10",
      text: "text-xl"
    },
    lg: {
      container: "gap-2.5",
      img: "h-12 w-12 sm:h-14 sm:w-14",
      text: "text-2xl sm:text-3xl"
    }
  };

  const activeSize = sizes[size] || sizes.lg;

  return (
    <div className={cn("flex items-center font-display font-semibold tracking-tight text-primary", activeSize.container, className)}>
      <img src="/images/logo.png" alt="MyCampus Logo" className={cn("object-contain shrink-0", activeSize.img)} />
      {!mark && <span className={cn("font-bold tracking-tight shrink-0", activeSize.text)}>MyCampus</span>}
    </div>
  );
}

