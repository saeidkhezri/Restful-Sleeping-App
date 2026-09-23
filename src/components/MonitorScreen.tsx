import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Ear, MoonStar, OctagonX, Volume2 } from "lucide-react";
import { dictionaries, digits, type Lang } from "../i18n";
import { frameMatchScore, median, tapHaptic, VoiceSession, type VoiceFingerprint } from "../lib/audioEngine";
import { cn } from "../utils/cn";

const TICK = 55;
const CALIB_MS = 2300;
const WINDOW_FRAMES = 34; // ~1.9s
const NEED_FRAMES = 11; // matched frames to trigger
const BARS = 24;

export default function MonitorScreen({
  lang,
  fingerprints,
  alarmName,
  onAlarm,
  onStop,
}: {
  lang: Lang;
  fingerprints: VoiceFingerprint[];
  alarmName: string;
  onAlarm: () => void;
  onStop: () => void;
}) {
  const t = dictionaries[lang];
  const [calibrating, setCalibrating] = useState(true);
  const [calibPct, setCalibPct] = useState(0);
  const [level, setLevel] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(BARS).fill(0.08));
  const [heard, setHeard] = useState(false);
  const [matchPct, setMatchPct] = useState(0);
  const [dead, setDead] = useState(false);

  const sessionRef = useRef<VoiceSession | null>(null);
  const ambientRef = useRef(0.015);
  const windowRef = useRef<number[]>([]);
  const calibRmsRef = useRef<number[]>([]);
  const liveUntilRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const startedAt = performance.now();

    (async () => {
      const session = new VoiceSession();
      try {
        await session.start();
      } catch {
        if (!cancelled) setDead(true);
        return;
      }
      if (cancelled) {
        void session.stop();
        return;
      }
      sessionRef.current = session;

      interval = setInterval(() => {
        const now = performance.now();
        const f = session.sample();
        const lvl = session.level();
        setLevel(lvl);
        setBars((prev) => [...prev.slice(1), 0.08 + Math.min(0.92, lvl * 1.35)]);

        // calibration phase
        if (now - startedAt < CALIB_MS) {
          calibRmsRef.current.push(f.rms);
          setCalibPct(Math.min(100, ((now - startedAt) / CALIB_MS) * 100));
          return;
        }
        if (calibRmsRef.current.length) {
          const amb = median(calibRmsRef.current);
          ambientRef.current = Math.max(amb * 2.6, 0.016);
          calibRmsRef.current = [];
          liveUntilRef.current = now + 1500; // settle grace
          setCalibrating(false);
        }
        if (now < liveUntilRef.current) return;

        const score = frameMatchScore(f, fingerprints, ambientRef.current);
        const w = windowRef.current;
        w.push(score >= 0.75 ? 1 : score >= 0.45 ? 0.4 : 0);
        if (w.length > WINDOW_FRAMES) w.shift();
        const matched = w.reduce((s, x) => s + x, 0);
        setMatchPct(Math.min(1, matched / NEED_FRAMES));
        const isHeard = score >= 0.75;
        setHeard((prev) => (prev === isHeard ? prev : isHeard));

        if (matched >= NEED_FRAMES) {
          tapHaptic();
          cleanup();
          onAlarm();
        }
      }, TICK);
    })();

    const cleanup = () => {
      if (interval) clearInterval(interval);
      void sessionRef.current?.stop();
      sessionRef.current = null;
    };

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ring gauge for level
  const C = 2 * Math.PI * 78;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="absolute inset-0 z-30 flex flex-col bg-[#05050d]/85 backdrop-blur-xl"
    >
      {/* header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", calibrating ? "bg-amber-300" : "bg-teal-300")} />
            <span className={cn("relative inline-flex size-2.5 rounded-full", calibrating ? "bg-amber-300" : "bg-teal-300")} />
          </span>
          <span className={cn("text-xs font-bold tracking-wide", calibrating ? "text-amber-200" : "text-teal-200")}>
            {calibrating ? t.calibrating : t.listening}
          </span>
        </div>
        <div className="text-[10px] font-semibold tracking-widest text-white/35">{t.brand}</div>
      </div>

      {/* center visual */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        <div className="relative grid size-72 place-items-center">
          {/* breathing halo */}
          <div className="absolute inset-4 rounded-full bg-violet-500/15 blur-2xl animate-breathe" />
          {/* rotating ticks */}
          <svg className="absolute inset-0 size-full animate-spin-slower" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 13" />
            <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(94,234,212,0.25)" strokeWidth="1" strokeDasharray="1 24" />
          </svg>
          {/* level gauge */}
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke={heard ? "url(#gradHeard)" : "url(#gradLvl)"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - Math.min(1, level))}
              style={{ transition: "stroke-dashoffset 90ms linear" }}
            />
            <defs>
              <linearGradient id="gradLvl" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="gradHeard" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fcd9a0" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>
          {/* moon */}
          <div className="relative">
            <img
              src="/images/moon.png"
              alt=""
              className="h-36 w-36 rounded-full object-cover [mask-image:radial-gradient(circle,black_58%,transparent_75%)] animate-floaty"
            />
            <MoonStar className="absolute -top-1 -end-1 size-5 text-teal-200/70" strokeWidth={1.4} />
          </div>
          {/* live waveform strip */}
          <div className="pointer-events-none absolute inset-x-6 -bottom-3 flex h-7 items-end justify-center gap-[3px]">
            {bars.map((b, i) => (
              <span
                key={i}
                className={cn(
                  "w-[4px] rounded-full transition-all duration-100",
                  heard ? "bg-gradient-to-t from-rose-400 to-amber-300" : "bg-gradient-to-t from-violet-400/70 to-teal-300/70",
                )}
                style={{ height: `${Math.max(10, b * 100)}%` }}
              />
            ))}
          </div>
        </div>

        {/* status */}
        <div className="mt-6 flex h-8 items-center justify-center">
          {dead ? (
            <p className="text-sm font-bold text-rose-300">{t.micFailTitle}</p>
          ) : calibrating ? (
            <div className="flex items-center gap-2 text-amber-200/90">
              <span className="text-sm font-bold">{t.calibrating}</span>
              <span className="text-xs text-white/45" dir="ltr">
                {digits(Math.round(calibPct), lang)}%
              </span>
            </div>
          ) : heard ? (
            <div className="flex items-center gap-2">
              <Ear className="size-4 text-amber-300 animate-breathe" />
              <span className="text-sm font-extrabold text-amber-200 text-glow-gold">{t.heardYou}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/55">
              <Ear className="size-4" />
              <span className="text-sm">{t.listening}</span>
            </div>
          )}
        </div>

        {/* match meter */}
        <div className="mt-2 w-full max-w-60">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-150",
                matchPct > 0.6 ? "bg-gradient-to-r from-amber-300 to-rose-400 shadow-[0_0_12px_rgba(251,113,133,.7)]" : "bg-teal-300/70",
              )}
              style={{ width: `${matchPct * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-white/40">
            <span className="flex items-center gap-1">
              <Volume2 className="size-3" />
              {t.levelLabel}
            </span>
            <span className="h-1 w-24 overflow-hidden rounded-full bg-white/8">
              <span className="block h-full bg-white/30 transition-all duration-100" style={{ width: `${level * 100}%` }} />
            </span>
          </div>
        </div>

        <p className="mt-7 max-w-[32ch] text-center text-[11px] leading-relaxed text-white/45">{t.monDesc}</p>
      </div>

      {/* footer controls */}
      <div className="px-6 pb-8">
        <div className="glass mb-4 flex items-center gap-3 rounded-2xl px-4 py-3">
          <BellRing className="size-4.5 shrink-0 text-amber-200" strokeWidth={1.8} />
          <span className="flex-1 truncate text-xs font-bold text-white/75">{t.alarmWith(alarmName)}</span>
        </div>
        <button
          onClick={() => {
            tapHaptic();
            onStop();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/25 bg-rose-400/10 px-6 py-4 text-[15px] font-extrabold text-rose-200 active:scale-[0.98]"
        >
          <OctagonX className="size-5" strokeWidth={2} />
          {t.stopGuard}
        </button>
        <p className="mt-4 text-center text-[10px] leading-relaxed text-white/35">{t.screenOffOk}</p>
      </div>
    </motion.div>
  );
}
