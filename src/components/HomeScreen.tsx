import { motion } from "framer-motion";
import {
  AudioLines,
  BellRing,
  Check,
  ChevronDown,
  Fingerprint,
  FolderOpen,
  Heart,
  Languages,
  MoonStar,
  Play,
  Power,
  Vibrate,
} from "lucide-react";
import { ALARM_IDS, dictionaries, type Lang } from "../i18n";
import type { CustomAlarm } from "./AlarmSheet";
import type { VoiceFingerprint } from "../lib/audioEngine";
import { tapHaptic } from "../lib/audioEngine";
import { Chip, GlassCard, GradientButton, SectionTitle, Toggle } from "./ui";

export default function HomeScreen({
  lang,
  setLang,
  sentenceFp,
  humFp,
  alarmId,
  customAlarms,
  vibrate,
  onOpenRecord,
  onOpenSheet,
  onToggleVibrate,
  onStartGuard,
  onExit,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  sentenceFp: VoiceFingerprint | null;
  humFp: VoiceFingerprint | null;
  alarmId: string;
  customAlarms: CustomAlarm[];
  vibrate: boolean;
  onOpenRecord: () => void;
  onOpenSheet: () => void;
  onToggleVibrate: (v: boolean) => void;
  onStartGuard: () => void;
  onExit: () => void;
}) {
  const t = dictionaries[lang];
  const hasVoice = !!sentenceFp && !!humFp;
  const custom = alarmId.startsWith("custom:") ? customAlarms.find((c) => `custom:${c.id}` === alarmId) : null;
  const alarmName = custom ? custom.name || t.myFile : t.alarmNames[(alarmId as (typeof ALARM_IDS)[number])] ?? t.alarmNames.dawn;

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto px-5 pb-32 pt-6">
      {/* ─── header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <MoonStar className="size-8 shrink-0 text-teal-200 drop-shadow-[0_0_14px_rgba(94,234,212,.6)]" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-extrabold leading-tight text-white">{t.brand}</div>
          <div className="text-[10px] text-white/45">{t.tagline}</div>
        </div>
        <button
          onClick={() => {
            tapHaptic();
            setLang(lang === "fa" ? "en" : "fa");
          }}
          className="glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-extrabold text-white/80 active:scale-95"
          aria-label={t.langLabel}
        >
          <Languages className="size-3.5 text-violet-200" />
          {lang === "fa" ? "English" : "فارسی"}
        </button>
      </motion.div>

      {/* ─── dedication (bilingual) ─── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.8 }}
        className="mt-5 rounded-2xl border border-amber-200/15 bg-amber-100/5 px-5 py-3.5 text-center text-[11px] font-medium leading-relaxed tracking-wide text-amber-100/85"
        dir={lang === "fa" ? "rtl" : "ltr"}
      >
        <Heart className="inline size-3.5 text-rose-300" fill="currentColor" />
        <br />
        <span className="gold-gradient-text">{t.dedication}</span>
      </motion.p>

      {/* ─── status ─── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="mt-5"
      >
        <div className="glass relative flex items-center gap-4 overflow-hidden rounded-3xl p-5">
          <img
            src="/images/moon.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -top-10 end-[-30px] h-28 w-28 opacity-75 [mask-image:radial-gradient(circle,black_45%,transparent_72%)]"
          />
          <span className="relative flex size-3 shrink-0">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${
                hasVoice ? "bg-teal-300" : "bg-amber-300"
              }`}
            />
            <span className={`relative inline-flex size-3 rounded-full ${hasVoice ? "bg-teal-300" : "bg-amber-300"}`} />
          </span>
          <span className={`text-sm font-extrabold ${hasVoice ? "text-teal-100" : "text-amber-100"}`}>
            {hasVoice ? t.statusReady : t.statusSetup}
          </span>
        </div>
      </motion.div>

      {/* ─── voice tone card ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }}>
        <GlassCard className="mt-4">
          <SectionTitle icon={AudioLines} tone="teal" title={t.voiceTitle} desc={t.voiceDesc} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone={sentenceFp ? "teal" : "neutral"}>
              {sentenceFp ? <Check className="size-3" /> : <Fingerprint className="size-3" />}
              {t.sentenceChip} · {sentenceFp ? t.doneBadge : t.pendingBadge}
            </Chip>
            <Chip tone={humFp ? "teal" : "neutral"}>
              {humFp ? <Check className="size-3" /> : <Fingerprint className="size-3" />}
              {t.humChip} · {humFp ? t.doneBadge : t.pendingBadge}
            </Chip>
          </div>
          <button
            onClick={() => {
              tapHaptic();
              onOpenRecord();
            }}
            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-teal-300/90 to-violet-400/90 py-3 text-sm font-extrabold text-night-950 shadow-lg shadow-teal-400/15 active:scale-[0.98]"
          >
            {hasVoice ? t.reRecordBtn : t.recordBtn}
          </button>
        </GlassCard>
      </motion.div>

      {/* ─── alarm card ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <GlassCard className="mt-4">
          <SectionTitle icon={BellRing} tone="gold" title={t.alarmTitle} desc={t.alarmDesc} />
          <button
            onClick={() => {
              tapHaptic();
              onOpenSheet();
            }}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-start active:scale-[0.98]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-200/15 text-amber-200">
              <Play className="size-4" />
            </span>
            <span className="flex-1 truncate text-sm font-bold text-white/90">{alarmName}</span>
            <ChevronDown className="size-4.5 text-white/40" />
          </button>
          <button
            onClick={() => {
              tapHaptic();
              onOpenSheet();
            }}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/15 px-4 py-3 text-start active:scale-[0.98]"
          >
            <FolderOpen className="size-4.5 shrink-0 text-teal-200" />
            <span className="flex-1 text-xs font-semibold text-white/65">
              {t.customFromPhone} · {t.pickAudioHint}
            </span>
          </button>
        </GlassCard>
      </motion.div>

      {/* ─── vibration card ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.6 }}>
        <GlassCard className="mt-4 flex items-center gap-4">
          <SectionTitle icon={Vibrate} tone="violet" title={t.vibrateTitle} desc={t.vibrateDesc} />
          <Toggle
            on={vibrate}
            onChange={(v) => {
              tapHaptic();
              onToggleVibrate(v);
            }}
            label={t.vibrateTitle}
          />
        </GlassCard>
      </motion.div>

      {/* ─── guard cta ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.6 }} className="mt-6">
        <GradientButton tone="gold" disabled={!hasVoice} onClick={onStartGuard} className="shadow-amber-300/20">
          {t.guardBtn}
        </GradientButton>
        {!hasVoice && <p className="mt-2 text-center text-[11px] text-amber-200/80">{t.guardNeedVoice}</p>}
        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">{t.bgHint}</p>
      </motion.div>

      {/* ─── exit ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="mt-6 flex flex-col items-center"
      >
        <button
          onClick={() => {
            tapHaptic();
            onExit();
          }}
          className="flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/8 px-5 py-2.5 text-xs font-bold text-rose-200/90 active:scale-95"
        >
          <Power className="size-4" />
          {t.exitLabel}
          <span className="text-[9px] font-medium text-white/35">· {t.exitHint}</span>
        </button>
      </motion.div>
    </div>
  );
}
