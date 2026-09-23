import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BellRing, Hand, Vibrate } from "lucide-react";
import { dictionaries, type Lang } from "../i18n";
import { AlarmController } from "../lib/audioEngine";

export interface AlarmBehavior {
  volume: number; // final volume 0..1
  rise: boolean;
  riseSec: number;
}

export default function RingingScreen({
  lang,
  alarmId,
  customDataUrl,
  vibrate,
  behavior,
  onDismiss,
}: {
  lang: Lang;
  alarmId: string;
  customDataUrl: string | null;
  vibrate: boolean;
  behavior: AlarmBehavior;
  onDismiss: () => void;
}) {
  const t = dictionaries[lang];
  const playerRef = useRef<AlarmController | null>(null);

  useEffect(() => {
    // sound — loops forever until dismissed; optionally rises gently to the final volume
    const player = new AlarmController();
    playerRef.current = player;
    player.start(alarmId, customDataUrl, {
      volume: behavior.volume,
      riseSec: behavior.rise ? behavior.riseSec : 0,
    });

    // vibration — relentless pattern
    let vibTimer: ReturnType<typeof setInterval> | null = null;
    if (vibrate && "vibrate" in navigator) {
      const pattern = [700, 250, 700, 250, 1100, 300];
      navigator.vibrate(pattern);
      vibTimer = setInterval(() => navigator.vibrate(pattern), 3400);
    }
    return () => {
      player.stop();
      if (vibTimer) clearInterval(vibTimer);
      try {
        navigator.vibrate?.(0);
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    playerRef.current?.stop();
    try {
      navigator.vibrate?.(0);
    } catch {
      /* noop */
    }
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-8"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #3d0f1e 0%, #1c0710 45%, #0a0308 100%)",
      }}
    >
      {/* pulsing halo */}
      <div className="pointer-events-none absolute inset-0">
        {[0, 0.8, 1.6].map((d) => (
          <span
            key={d}
            className="animate-ring-pulse absolute left-1/2 top-[34%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-400/50"
            style={{ animationDelay: `${d}s`, animationDuration: "2.4s" }}
          />
        ))}
      </div>

      <motion.div
        animate={{ rotate: [-11, 11, -11] }}
        transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut" }}
        className="relative"
      >
        <div className="absolute inset-0 -m-10 rounded-full bg-rose-500/30 blur-3xl animate-breathe" />
        <BellRing className="relative size-28 text-rose-300 drop-shadow-[0_0_36px_rgba(251,113,133,.8)]" strokeWidth={1.4} />
      </motion.div>

      {vibrate && (
        <div className="mt-4 flex items-center gap-1.5 text-rose-200/70">
          <Vibrate className="size-4 animate-alarm-flash" />
          <Vibrate className="size-4 animate-alarm-flash" style={{ animationDelay: "0.3s" }} />
        </div>
      )}

      <h1 className="mt-6 text-4xl font-black tracking-wide text-white drop-shadow-[0_0_24px_rgba(251,113,133,.6)] animate-alarm-flash">
        {t.wakeTitle}
      </h1>
      <p className="mt-2 text-sm font-semibold text-rose-100/80">{t.wakeSub}</p>

      <motion.button
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 18 }}
        whileTap={{ scale: 0.94 }}
        onClick={dismiss}
        className="relative mt-12 grid size-44 place-items-center rounded-full border-2 border-amber-200/50 bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 text-night-950 shadow-[0_0_60px_rgba(252,217,160,.45)]"
      >
        <span className="animate-ring-pulse absolute inset-0 rounded-full border border-amber-200/60" />
        <span className="flex flex-col items-center gap-1">
          <Hand className="size-7" strokeWidth={2} />
          <span className="px-4 text-center text-[15px] font-black leading-tight">{t.dismiss}</span>
        </span>
      </motion.button>

      <p className="mt-5 text-[11px] text-rose-100/50">{t.ringingNote}</p>
    </motion.div>
  );
}
