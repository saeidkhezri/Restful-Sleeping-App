import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Fingerprint,
  Mic,
  AudioLines,
  RefreshCw,
  Square,
} from "lucide-react";
import { dictionaries, digits, type Lang } from "../i18n";
import {
  buildFingerprint,
  tapHaptic,
  validateFingerprint,
  VoiceSession,
  type FrameData,
  type InvalidReason,
  type VoiceFingerprint,
} from "../lib/audioEngine";
import { cn } from "../utils/cn";
import { GradientButton } from "./ui";

type Phase = "intro" | "recording" | "analyzing" | "fail" | "saved" | "micfail" | "done";

const TICK = 50;
const BARS = 26;

export default function RecordingModal({
  lang,
  needSentence,
  needHum,
  onSave,
  onClose,
}: {
  lang: Lang;
  needSentence: boolean;
  needHum: boolean;
  onSave: (fps: { sentence: VoiceFingerprint; hum: VoiceFingerprint }) => void;
  onClose: () => void;
}) {
  const t = dictionaries[lang];
  const [stepIdx, setStepIdx] = useState(0); // 0 sentence, 1 hum
  const [phase, setPhase] = useState<Phase>("intro");
  const [reason, setReason] = useState<InvalidReason>("quiet");
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(BARS).fill(0.08));
  const [sentenceFp, setSentenceFp] = useState<VoiceFingerprint | null>(null);
  const [humFp, setHumFp] = useState<VoiceFingerprint | null>(null);
  const [stats, setStats] = useState<{ pitch: number; dur: number; stab: number } | null>(null);

  const sessionRef = useRef<VoiceSession | null>(null);
  const framesRef = useRef<FrameData[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  const stepsCount = (needSentence ? 1 : 0) + (needHum ? 1 : 0);

  useEffect(() => {
    if (!needSentence && needHum) setStepIdx(1);
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    void sessionRef.current?.stop();
    sessionRef.current = null;
  };

  const kind: "sentence" | "hum" = stepIdx === 0 ? "sentence" : "hum";

  const beginRecording = async () => {
    tapHaptic();
    const session = new VoiceSession();
    try {
      await session.start();
    } catch {
      setPhase("micfail");
      return;
    }
    sessionRef.current = session;
    framesRef.current = [];
    startRef.current = performance.now();
    setElapsed(0);
    setPhase("recording");

    timerRef.current = setInterval(() => {
      const f = session.sample();
      framesRef.current.push(f);
      const lvl = session.level();
      setBars((prev) => [...prev.slice(1), 0.08 + Math.min(0.92, lvl * 1.4)]);
      const el = (performance.now() - startRef.current) / 1000;
      setElapsed(el);
      if (el >= 14) void finishRecording();
    }, TICK);
  };

  const finishRecording = async () => {
    tapHaptic();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const session = sessionRef.current;
    sessionRef.current = null;
    await session?.stop();
    setPhase("analyzing");

    // thoughtful pause for the analysis feel
    await new Promise((r) => setTimeout(r, 900));

    const fp = buildFingerprint(framesRef.current, kind, TICK);
    const res = validateFingerprint(fp);
    if (!res.ok) {
      setReason(res.reason ?? "quiet");
      setPhase("fail");
      return;
    }
    setStats({ pitch: fp.pitchMedian, dur: fp.durationSec, stab: fp.stability });
    if (kind === "sentence") setSentenceFp(fp);
    else setHumFp(fp);
    setPhase("saved");
  };

  const next = () => {
    tapHaptic();
    setStats(null);
    setBars(Array(BARS).fill(0.08));
    setElapsed(0);
    if (stepIdx === 0 && needHum) {
      setStepIdx(1);
      setPhase("intro");
    } else {
      setPhase("done");
    }
  };

  const retry = () => {
    tapHaptic();
    setStats(null);
    setBars(Array(BARS).fill(0.08));
    setElapsed(0);
    setPhase("intro");
  };

  const complete = () => {
    tapHaptic();
    if (sentenceFp && humFp) onSave({ sentence: sentenceFp, hum: humFp });
    onClose();
  };

  const reasonText: Record<InvalidReason, string> = {
    short: t.retryTooShort,
    quiet: t.retryTooQuiet,
    pitch: t.retryPitch,
    unstable: t.retryUnstable,
  };

  const mm = Math.floor(elapsed / 60);
  const ss = Math.floor(elapsed % 60);
  const timeStr = digits(`${mm}:${String(ss).padStart(2, "0")}`, lang);

  const title = phase === "done" ? t.allDoneTitle : kind === "sentence" ? t.s1Title : t.s2Title;
  const desc = kind === "sentence" ? t.s1Desc : t.s2Desc;
  const line = kind === "sentence" ? t.s1Line : t.s2Line;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-30 flex flex-col bg-night-950/60 backdrop-blur-2xl"
    >
      {/* header */}
      <div className="flex items-center justify-between px-6 pt-6">
        <button
          onClick={() => {
            tapHaptic();
            onClose();
          }}
          className="glass grid size-10 place-items-center rounded-full text-white/70 active:scale-95"
          aria-label={t.backLabel}
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        {stepsCount === 2 && phase !== "done" && (
          <div className="flex items-center gap-2 text-xs font-bold text-white/60">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === stepIdx ? "w-8 bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,.7)]" : "w-3 bg-white/20",
                )}
              />
            ))}
            <span className="ms-1">{t.stepOf(stepIdx + 1)}</span>
          </div>
        )}
        <div className="size-10" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10">
        <AnimatePresence mode="wait">
          {/* ─── final success ─── */}
          {phase === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 -m-8 rounded-full bg-teal-400/20 blur-3xl" />
                <CheckCircle2 className="relative size-24 text-teal-300" strokeWidth={1.2} />
              </div>
              <h2 className="mt-6 text-2xl font-extrabold text-white">{t.allDoneTitle}</h2>
              <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-white/60">{t.allDoneDesc}</p>
              <div className="mt-9 w-full">
                <GradientButton tone="teal" onClick={complete}>
                  {t.finish}
                </GradientButton>
              </div>
            </motion.div>
          ) : phase === "micfail" ? (
            /* ─── mic error ─── */
            <motion.div
              key="micfail"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full flex-col items-center text-center"
            >
              <AlertTriangle className="size-20 text-amber-300" strokeWidth={1.3} />
              <h2 className="mt-5 text-xl font-extrabold text-white">{t.micFailTitle}</h2>
              <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-white/60">{t.micFailDesc}</p>
              <div className="mt-8 w-full">
                <GradientButton tone="gold" onClick={beginRecording}>
                  {t.tryAgain}
                </GradientButton>
              </div>
            </motion.div>
          ) : (
            /* ─── recording workspace ─── */
            <motion.div key="work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-full flex-col items-center">
              <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-widest text-teal-200/80">
                {kind === "sentence" ? <AudioLines className="size-4" /> : <Fingerprint className="size-4" />}
                {title}
              </div>
              <p className="text-sm text-white/55">{desc}</p>

              {/* the phrase to say */}
              <div className="glass mt-4 rounded-2xl px-7 py-3.5">
                <p
                  className={cn(
                    "text-xl font-extrabold text-white text-glow-gold",
                    lang === "en" && kind === "sentence" && "font-en",
                  )}
                >
                  {kind === "sentence" ? `«${line}»` : `«${t.s2Line}»`}
                </p>
              </div>

              {/* ─── the mic orb ─── */}
              <div className="relative mt-10">
                <button
                  onClick={phase === "recording" ? finishRecording : phase === "intro" ? beginRecording : undefined}
                  disabled={phase !== "recording" && phase !== "intro"}
                  className={cn(
                    "relative grid size-60 place-items-center outline-none",
                    (phase === "intro" || phase === "recording") && "cursor-pointer",
                  )}
                  aria-label="microphone"
                >
                  {/* pulse rings */}
                  {phase === "recording" &&
                    [0, 0.55, 1.1].map((d) => (
                      <span
                        key={d}
                        className="animate-ring-pulse absolute inset-0 rounded-full border border-teal-300/50"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  {/* rotating conic ring */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full transition-opacity duration-500",
                      phase === "recording" ? "opacity-100 animate-spin-slower" : "opacity-40",
                    )}
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 0%, rgba(94,234,212,.8) 12%, transparent 26%, transparent 50%, rgba(167,139,250,.8) 62%, transparent 76%)",
                      WebkitMaskImage:
                        "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                      maskImage: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px))",
                    }}
                  />
                  {/* orb */}
                  <motion.div
                    animate={{
                      scale:
                        phase === "recording"
                          ? 1 + Math.min(0.28, bars[bars.length - 1] * 0.34)
                          : phase === "analyzing"
                            ? [1, 1.06, 1]
                            : 1,
                    }}
                    transition={
                      phase === "analyzing" ? { repeat: Infinity, duration: 1.4 } : { type: "spring", stiffness: 280, damping: 18 }
                    }
                    className={cn(
                      "relative z-10 grid size-40 cursor-pointer place-items-center rounded-full border transition-shadow duration-500",
                      phase === "recording"
                        ? "border-teal-200/60 bg-gradient-to-br from-teal-300 via-cyan-400 to-violet-500 shadow-[0_0_70px_rgba(94,234,212,.5)]"
                        : phase === "analyzing"
                          ? "border-violet-200/60 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-teal-300 shadow-[0_0_70px_rgba(167,139,250,.5)]"
                          : "border-white/25 bg-gradient-to-br from-violet-500/80 to-teal-400/80 shadow-[0_0_46px_rgba(167,139,250,.35)]",
                    )}
                  >
                    <div className="absolute inset-0 rounded-full bg-white/10 blur-md" />
                    {phase === "recording" ? (
                      <Square className="relative size-12 fill-night-950 text-night-950" />
                    ) : phase === "analyzing" ? (
                      <Activity className="relative size-12 text-night-950" strokeWidth={2} />
                    ) : (
                      <Mic className="relative size-12 text-night-950" strokeWidth={2.2} />
                    )}
                  </motion.div>
                </button>
              </div>

              {/* waveform */}
              <div className="mt-9 flex h-14 items-center gap-[3px]">
                {bars.map((b, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-[5px] rounded-full transition-all duration-100",
                      phase === "recording"
                        ? "bg-gradient-to-t from-violet-400 to-teal-300"
                        : phase === "analyzing"
                          ? "animate-[eq-bar_1s_ease-in-out_infinite] bg-gradient-to-t from-fuchsia-400 to-violet-300"
                          : "bg-white/20",
                    )}
                    style={{
                      height: `${Math.max(8, b * 100)}%`,
                      animationDelay: phase === "analyzing" ? `${i * 0.045}s` : undefined,
                    }}
                  />
                ))}
              </div>

              {/* status / timer / actions */}
              <div className="mt-4 flex min-h-24 w-full flex-col items-center">
                {phase === "recording" && (
                  <>
                    <span className="font-en text-2xl font-bold tracking-widest text-teal-200 text-glow-teal" dir="ltr">
                      {timeStr}
                    </span>
                    <p className="mt-1 text-xs text-white/55">{t.tapStop}</p>
                  </>
                )}
                {phase === "intro" && <p className="text-sm font-semibold text-white/70">{t.tapStart}</p>}
                {phase === "analyzing" && <p className="text-sm font-semibold text-violet-200">{t.analyzing}</p>}
                {phase === "fail" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center">
                    <div className="flex items-center gap-2 text-rose-300">
                      <AlertTriangle className="size-4" />
                      <span className="text-sm font-bold">{t.retryTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/60">{reasonText[reason]}</p>
                    <button
                      onClick={retry}
                      className="mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2 text-sm font-bold text-white active:scale-95"
                    >
                      <RefreshCw className="size-4" /> {t.tryAgain}
                    </button>
                  </motion.div>
                )}
                {phase === "saved" && stats && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col items-center">
                    <div className="flex items-center gap-2 text-teal-300">
                      <Check className="size-4" />
                      <span className="text-sm font-extrabold">{t.savedTitle}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-white/55" dir="ltr">
                      <span>{digits(Math.round(stats.pitch), lang)} Hz</span>
                      <span>·</span>
                      <span>{digits(stats.dur.toFixed(1), lang)} s</span>
                      <span>·</span>
                      <span>{digits(Math.round(stats.stab * 100), lang)}%</span>
                    </div>
                    <button
                      onClick={next}
                      className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-300 to-violet-400 px-6 py-2.5 text-sm font-extrabold text-night-950 shadow-lg shadow-teal-400/25 active:scale-95"
                    >
                      {stepIdx === 0 && needHum ? t.nextStep : t.finish}
                      <ArrowRight className="size-4 rtl:rotate-180" />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
