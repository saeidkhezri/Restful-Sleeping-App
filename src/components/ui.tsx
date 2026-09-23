import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

// ─── glass card ──────────────────────────────────────────────────────────────

export function GlassCard({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("glass rounded-3xl p-5", onClick && "cursor-pointer active:scale-[0.985] transition-transform", className)}
    >
      {children}
    </div>
  );
}

// ─── icon badge ──────────────────────────────────────────────────────────────

export function IconBadge({
  icon: Icon,
  tone = "violet",
  className,
}: {
  icon: LucideIcon;
  tone?: "violet" | "teal" | "gold" | "rose";
  className?: string;
}) {
  const tones: Record<string, string> = {
    violet: "from-violet-500/30 to-fuchsia-500/20 text-violet-200 shadow-[0_0_24px_rgba(167,139,250,.25)]",
    teal: "from-teal-400/30 to-cyan-500/20 text-teal-200 shadow-[0_0_24px_rgba(94,234,212,.25)]",
    gold: "from-amber-300/30 to-orange-400/20 text-amber-200 shadow-[0_0_24px_rgba(252,217,160,.25)]",
    rose: "from-rose-400/30 to-pink-500/20 text-rose-200 shadow-[0_0_24px_rgba(251,113,133,.25)]",
  };
  return (
    <div
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br border border-white/10",
        tones[tone],
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={1.8} />
    </div>
  );
}

// ─── section title row ───────────────────────────────────────────────────────

export function SectionTitle({
  icon,
  title,
  desc,
  tone,
  action,
}: {
  icon: LucideIcon;
  title: string;
  desc?: string;
  tone?: "violet" | "teal" | "gold" | "rose";
  action?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold text-white">{title}</h3>
        {desc && <p className="mt-0.5 text-xs leading-relaxed text-white/55">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── status chip ─────────────────────────────────────────────────────────────

export function Chip({
  children,
  active = false,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  active?: boolean;
  tone?: "neutral" | "teal" | "rose";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
        tone === "teal" && "border-teal-300/30 bg-teal-400/10 text-teal-200",
        tone === "rose" && "border-rose-300/30 bg-rose-400/10 text-rose-200",
        tone === "neutral" &&
          (active ? "border-white/25 bg-white/10 text-white" : "border-white/12 bg-white/5 text-white/50"),
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── animated toggle switch ─────────────────────────────────────────────────

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full border transition-colors duration-300",
        on ? "border-teal-300/50 bg-teal-400/30 shadow-[0_0_18px_rgba(94,234,212,.35)]" : "border-white/15 bg-white/8",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "absolute top-1 size-[22px] rounded-full shadow-md",
          on
            ? "start-[30px] bg-teal-100"
            : "start-1 bg-white/60",
        )}
      />
    </button>
  );
}

// ─── gradient cta button ─────────────────────────────────────────────────────

export function GradientButton({
  children,
  onClick,
  disabled,
  tone = "teal",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "teal" | "gold" | "rose" | "violet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    teal: "from-teal-300 via-cyan-300 to-violet-400 text-night-950",
    gold: "from-amber-200 via-yellow-200 to-amber-300 text-night-950",
    rose: "from-rose-300 via-pink-300 to-rose-400 text-night-950",
    violet: "from-violet-300 via-fuchsia-300 to-violet-400 text-night-950",
  };
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-gradient-to-r bg-[length:200%_100%] px-6 py-4 text-[15px] font-extrabold tracking-wide shadow-xl transition",
        tones[tone],
        disabled
          ? "cursor-not-allowed opacity-30 saturate-0"
          : "animate-[glow-sweep_5s_ease-in-out_infinite] shadow-teal-400/20 active:brightness-110",
        className,
      )}
      style={disabled ? undefined : { animationName: "glow-sweep" }}
    >
      {children}
    </motion.button>
  );
}
