import { cn } from "../utils/cn";

export default function Logo({
  size = "md",
  withText = false,
  theme = "dark",
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  theme?: "dark" | "light";
  className?: string;
}) {
  const sizes = {
    sm: { icon: 32, text: 14, gap: 6 },
    md: { icon: 48, text: 18, gap: 10 },
    lg: { icon: 64, text: 22, gap: 12 },
    xl: { icon: 96, text: 28, gap: 16 },
  };

  const s = sizes[size];

  const moonColor = theme === "dark" ? "#fcd9a0" : "#d97706";
  const waveColor = theme === "dark" ? "#5eead4" : "#0f766e";
  const textColor = theme === "dark" ? "#f6f7fb" : "#111827";

  return (
    <div
      className={cn("flex items-center", className)}
      style={{ gap: withText ? s.gap : 0 }}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={`moonGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde8c8" />
            <stop offset="50%" stopColor={moonColor} />
            <stop offset="100%" stopColor="#d9b380" />
          </linearGradient>
          <linearGradient id={`waveGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={waveColor} />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Crescent moon */}
        <g filter={`url(#glow-${size})`}>
          <circle cx="256" cy="256" r="85" fill={`url(#moonGrad-${size})`} />
          <circle cx="295" cy="256" r="68" fill={theme === "dark" ? "#1a1a3a" : "#f6f7fb"} />
        </g>

        {/* Sound wave arcs */}
        <g
          stroke={`url(#waveGrad-${size})`}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          filter={`url(#glow-${size})`}
        >
          <path d="M 330 190 Q 400 256 330 322" strokeOpacity="0.9" />
          <path d="M 360 170 Q 440 256 360 342" strokeOpacity="0.7" />
          <path d="M 390 150 Q 480 256 390 362" strokeOpacity="0.5" />
        </g>
      </svg>

      {withText && (
        <div className="flex flex-col">
          <span
            className="font-extrabold leading-tight"
            style={{ fontSize: s.text, color: textColor }}
          >
            حافظ خواب
          </span>
          <span
            className="font-medium"
            style={{ fontSize: s.text * 0.6, color: theme === "dark" ? "rgba(246,247,251,0.6)" : "rgba(17,24,39,0.6)" }}
          >
            Peaceful Sleep Guardian
          </span>
        </div>
      )}
    </div>
  );
}
