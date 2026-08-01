import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" />
          <stop offset="0.6" stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="logoCapGrad" x1="8" y1="12" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Container with subtle border */}
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        fill="url(#logoBgGrad)"
      />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="1"
      />

      {/* Graduation Cap Diamond */}
      <path
        d="M20 10.5L32.5 16.5L20 22.5L7.5 16.5L20 10.5Z"
        fill="url(#logoCapGrad)"
      />

      {/* Mortarboard Arch / Cap Base */}
      <path
        d="M12.5 19.8V24.5C12.5 27.8 15.8 30 20 30C24.2 30 27.5 27.8 27.5 24.5V19.8L20 23.5L12.5 19.8Z"
        fill="white"
        fillOpacity="0.9"
      />

      {/* Tassel */}
      <path
        d="M29.5 18V24.5"
        stroke="#fde047"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="29.5" cy="25.5" r="1.25" fill="#facc15" />

      {/* Center cap node */}
      <circle cx="20" cy="16.5" r="1.2" fill="#0d9488" />
    </svg>
  );
}

export function Logo({ 
  className, 
  mark = false,
  size = "md"
}: { 
  className?: string; 
  mark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: {
      container: "gap-2",
      icon: "h-7 w-7",
      text: "text-base tracking-tight"
    },
    md: {
      container: "gap-2.5",
      icon: "h-8 w-8",
      text: "text-lg tracking-tight"
    },
    lg: {
      container: "gap-2.5",
      icon: "h-10 w-10",
      text: "text-2xl tracking-tight"
    }
  };

  const activeSize = sizes[size] || sizes.md;

  return (
    <div className={cn("inline-flex items-center select-none font-display", activeSize.container, className)}>
      <LogoMark className={activeSize.icon} />
      {!mark && (
        <span className={cn("font-bold text-foreground inline-flex items-center", activeSize.text)}>
          <span>My</span>
          <span className="text-primary">Campus</span>
        </span>
      )}
    </div>
  );
}
