import { motion } from "framer-motion";
import {
  BellRing,
  CloudRainWind,
  Eraser,
  Minus,
  MoonStar,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { AMBIENT_IDS, dictionaries, digits, type Lang } from "../i18n";
import { AMBIENT_TRACKS, type AmbientTrackId } from "../lib/ambient";
import { tapHaptic } from "../lib/audioEngine";
import { cn } from "../utils/cn";
import { Chip, GlassCard, Toggle } from "./ui";

export interface GuardSettings {
  sensitivity: number;
  minHumCount: number;
  minHumDurMs: number;
  alarmVolume: number; // 0..1
  alarmRise: boolean;
  riseSec: number;
}

export interface AmbientSettings {
  on: boolean;
  track: AmbientTrackId;
  vol: number;
}

export default function SettingsScreen({
  lang,
  guard,
  ambient,
  onGuard,
  onAmbient,
  onToggleTheme,
  onReopenPerms,
  onResetLog,
}: {
  lang: Lang;
  guard: GuardSettings;
  ambient: AmbientSettings;
  onGuard: (g: Partial<GuardSettings>) => void;
  onAmbient: (a: Partial<AmbientSettings>) => void;
  onToggleTheme: () => void;
  onReopenPerms: () => void;
  onResetLog: () => void;
}) {
  const t = dictionaries[lang];

  const SectionHead = ({ icon: Icon, title, desc }: { icon: typeof BellRing; title: string; desc: string }) => (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/25 to-teal-400/15 text-white/85">
        <Icon className="size-5" strokeWidth={1.8} />
      </span>
      <div>
        <h3 className="text-[15px] font-extrabold text-white">{title}</h3>
        <p className="text-[10.5px] text-white/50">{desc}</p>
      </div>
    </div>
  );

  const RowTitle = ({ title, desc }: { title: string; desc: string }) => (
    <div className="mb-1.5">
      <div className="text-[13px] font-bold text-white/90">{title}</div>
      <div className="text-[10.5px] text-white/45">{desc}</div>
    </div>
  );

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto px-5 pb-32 pt-6">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
        <SlidersHorizontal className="size-6 text-teal-200" strokeWidth={1.7} />
        <h1 className="text-xl font-extrabold text-white">{t.navSettings}</h1>
      </motion.div>

      {/* ─── appearance theme ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <GlassCard className="mb-4">
          <SectionHead icon={MoonStar} title={lang === "fa" ? "ظاهر" : "Appearance"} desc={lang === "fa" ? "حافظ را بین حالت دارک و لایت انتخاب کنید" : "Choose between dark and light mode"} />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[13px] font-bold text-white/90">
                {lang === "fa" ? "تم رنگی" : "Color theme"}
              </div>
              <div className="text-[10.5px] text-white/45">
                {lang === "fa" ? "دارک برای شب‌ها، لایت برای خوانایی بالا در نور طبیعی" : "Dark for nights, light for better readability in daylight"}
              </div>
            </div>
            <button
              onClick={() => {
                tapHaptic();
                onToggleTheme();
              }}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-2 text-[11px] font-extrabold text-white/85 active:scale-95"
            >
              {lang === "fa" ? (typeof window !== "undefined" && document.documentElement.getAttribute("data-theme") === "light" ? "لایت" : "دارک") : (typeof window !== "undefined" && document.documentElement.getAttribute("data-theme") === "light" ? "Light" : "Dark")}
              {lang === "fa" ? null : <Sun className="size-4 text-amber-200" />}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── smart detection ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <GlassCard className="mb-4">
          <SectionHead icon={ShieldCheck} title={t.setGuardTitle} desc={t.setGuardDesc} />

          <RowTitle title={t.sensTitle} desc={t.sensDesc} />
          <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
            <span className="text-white/40">{t.sensLow}</span>
            <span className="text-teal-200">{digits(guard.sensitivity, lang)} / {digits(10, lang)}</span>
            <span className="text-white/40">{t.sensHigh}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={guard.sensitivity}
            onChange={(e) => onGuard({ sensitivity: Number(e.target.value) })}
          />

          <div className="mt-5">
            <RowTitle title={t.minHumCountTitle} desc={t.minHumCountDesc} />
            <div className="flex items-center gap-3">
              <StepBtn dir="down" disabled={guard.minHumCount <= 1} onClick={() => onGuard({ minHumCount: Math.max(1, guard.minHumCount - 1) })} />
              <div className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5">
                {Array.from({ length: guard.minHumCount }).map((_, i) => (
                  <span key={i} className="size-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,217,160,.8)]" />
                ))}
                <span className="ms-1 text-sm font-extrabold text-white">{digits(guard.minHumCount, lang)} {t.unitTimes}</span>
              </div>
              <StepBtn dir="up" disabled={guard.minHumCount >= 5} onClick={() => onGuard({ minHumCount: Math.min(5, guard.minHumCount + 1) })} />
            </div>
          </div>

          <div className="mt-5">
            <RowTitle title={t.minHumDurTitle} desc={t.minHumDurDesc} />
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={300}
                max={2000}
                step={100}
                value={guard.minHumDurMs}
                onChange={(e) => onGuard({ minHumDurMs: Number(e.target.value) })}
              />
              <Chip tone="teal" className="shrink-0 !py-1.5">
                {digits(guard.minHumDurMs, lang)}
              </Chip>
            </div>
            <div className="mt-1 text-end text-[10px] text-white/40">{t.unitMs}</div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── alarm behaviour ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <GlassCard className="mb-4">
          <SectionHead icon={BellRing} title={t.alarmSetTitle} desc={t.alarmDesc} />

          <RowTitle title={t.volTitle} desc={t.volDesc} />
          <div className="flex items-center gap-3">
            <Volume2 className="size-4.5 shrink-0 text-amber-200" />
            <input
              type="range"
              min={30}
              max={100}
              step={5}
              value={Math.round(guard.alarmVolume * 100)}
              onChange={(e) => onGuard({ alarmVolume: Number(e.target.value) / 100 })}
            />
            <Chip tone="teal" className="shrink-0 !py-1.5">٪{digits(Math.round(guard.alarmVolume * 100), lang)}</Chip>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1">
              <RowTitle title={t.riseTitle} desc={t.riseDesc} />
            </div>
            <Toggle
              on={guard.alarmRise}
              onChange={(v) => {
                tapHaptic();
                onGuard({ alarmRise: v });
              }}
              label={t.riseTitle}
            />
          </div>

          {guard.alarmRise && (
            <div className="mt-3 flex gap-2">
              {([30, 60, 90] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    tapHaptic();
                    onGuard({ riseSec: s });
                  }}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[11px] font-bold transition",
                    guard.riseSec === s
                      ? "border-teal-300/50 bg-teal-400/15 text-teal-100"
                      : "border-white/10 bg-white/4 text-white/50",
                  )}
                >
                  <TrendingUp className="size-3.5" />
                  {t.riseOpts[`s${s}`]}
                </button>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── ambient sound ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <GlassCard className="mb-4">
          <SectionHead icon={CloudRainWind} title={t.ambientTitle} desc={t.ambientDesc} />
          <div className="flex items-center gap-3">
            <div className="flex-1 text-[13px] font-bold text-white/90">{t.ambientOn}</div>
            <Toggle
              on={ambient.on}
              onChange={(v) => {
                tapHaptic();
                onAmbient({ on: v });
              }}
              label={t.ambientOn}
            />
          </div>
          {ambient.on && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {AMBIENT_IDS.map((id) => {
                  const active = ambient.track === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        tapHaptic();
                        onAmbient({ track: id });
                      }}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-[11.5px] font-bold transition",
                        active ? "border-teal-300/50 bg-teal-400/15 text-teal-100" : "border-white/10 bg-white/4 text-white/55",
                      )}
                    >
                      {t.ambientNames[id]}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[11px] font-bold text-white/60">{t.ambientVol}</span>
                <input
                  type="range"
                  min={3}
                  max={30}
                  step={1}
                  value={Math.round(ambient.vol * 100)}
                  onChange={(e) => onAmbient({ vol: Number(e.target.value) / 100 })}
                />
                <Chip tone="teal" className="shrink-0 !py-1.5">٪{digits(Math.round(ambient.vol * 100), lang)}</Chip>
              </div>
              <p className="mt-3 text-[9.5px] leading-relaxed text-white/30" dir="ltr">
                {AMBIENT_TRACKS.find((x) => x.id === ambient.track)?.credit}
              </p>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── permissions + data ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
        <GlassCard className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[13px] font-bold text-white/90">{t.permsManage}</div>
              <div className="text-[10.5px] text-white/45">{t.permsManageDesc}</div>
            </div>
            <button
              onClick={() => {
                tapHaptic();
                onReopenPerms();
              }}
              className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-[11px] font-bold text-white/80 active:scale-95"
            >
              {t.reopenPerms}
            </button>
          </div>
          <div className="mt-4 h-px bg-white/8" />
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[13px] font-bold text-rose-200">{t.resetTitle}</div>
              <div className="text-[10.5px] text-white/45">{t.resetDesc}</div>
            </div>
            <button
              onClick={() => {
                tapHaptic();
                onResetLog();
              }}
              className="flex items-center gap-1.5 rounded-full border border-rose-300/25 bg-rose-400/10 px-4 py-2 text-[11px] font-bold text-rose-200 active:scale-95"
            >
              <Eraser className="size-3.5" />
              {t.resetBtn}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function StepBtn({ dir, onClick, disabled }: { dir: "up" | "down"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => {
        tapHaptic();
        onClick();
      }}
      disabled={disabled}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl border text-white transition",
        disabled ? "border-white/8 bg-white/4 opacity-30" : "border-white/15 bg-white/8 active:scale-95",
      )}
    >
      {dir === "up" ? <Plus className="size-5" /> : <Minus className="size-5" />}
    </button>
  );
}
