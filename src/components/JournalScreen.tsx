import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Ghost,
  MoonStar,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import { dictionaries, digits, type Lang } from "../i18n";
import { tapHaptic } from "../lib/audioEngine";
import {
  computeStats,
  dateKey,
  keyToDate,
  type SleepLog,
} from "../lib/journalUtils";
import { cn } from "../utils/cn";
import { GlassCard } from "./ui";

export default function JournalScreen({
  lang,
  log,
  onAdjustSleep,
  onAddEvent,
  onNote,
  onDeleteEvent,
  onExport,
}: {
  lang: Lang;
  log: SleepLog;
  onAdjustSleep: (key: string, deltaMin: number) => void;
  onAddEvent: (key: string) => void;
  onNote: (key: string, idx: number, note: string) => void;
  onDeleteEvent: (key: string, idx: number) => void;
  onExport: () => void;
}) {
  const t = dictionaries[lang];
  const todayJ = useMemo(() => toJalaali(new Date()), []);
  const [cursor, setCursor] = useState({ jy: todayJ.jy, jm: todayJ.jm });
  const [selectedKey, setSelectedKey] = useState(dateKey());

  const stats = useMemo(() => computeStats(log), [log]);

  const monthLen = jalaaliMonthLength(cursor.jy, cursor.jm);
  const firstG = toGregorian(cursor.jy, cursor.jm, 1);
  const firstWeekday = (new Date(firstG.gy, firstG.gm - 1, firstG.gd).getDay() + 1) % 7; // Sat = 0
  const titleJ = t.jTodayInMonth(t.months[cursor.jm - 1], cursor.jy);

  const shiftMonth = (dir: 1 | -1) => {
    tapHaptic();
    setCursor((c) => {
      let { jy, jm } = c;
      jm += dir;
      if (jm > 12) {
        jm = 1;
        jy++;
      }
      if (jm < 1) {
        jm = 12;
        jy--;
      }
      return { jy, jm };
    });
  };

  const dayOf = (d: number) => {
    const g = toGregorian(cursor.jy, cursor.jm, d);
    return dateKey(new Date(g.gy, g.gm - 1, g.gd));
  };

  const selectedDay = log[selectedKey];
  const maxMonthly = Math.max(1, ...stats.monthlyEvents);
  const maxWeekly = Math.max(1, ...stats.weeklyEvents);
  const topWeekday = stats.weeklyEvents.indexOf(Math.max(...stats.weeklyEvents));
  const topMonth = stats.monthlyEvents.indexOf(Math.max(...stats.monthlyEvents));

  const sleepH = Math.floor((selectedDay?.sleepMinutes ?? 0) / 60);
  const sleepM = (selectedDay?.sleepMinutes ?? 0) % 60;

  const selDateObj = keyToDate(selectedKey);
  const selLabel =
    lang === "fa"
      ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(selDateObj)
      : new Intl.DateTimeFormat("en-US-u-ca-persian", { weekday: "long", day: "numeric", month: "long" }).format(selDateObj);

  const fmtTime = (ts: number) =>
    digits(
      new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(ts)),
      lang,
    );

  return (
    <div className="no-scrollbar relative h-full overflow-y-auto px-5 pb-32 pt-6">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
        <CalendarDays className="size-6 text-teal-200" strokeWidth={1.7} />
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-white">{t.jTitle}</h1>
          <p className="text-[10px] text-white/45">
            {lang === "fa"
              ? new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "long" }).format(new Date())
              : new Intl.DateTimeFormat("en-US-u-ca-persian", { dateStyle: "long" }).format(new Date())}
          </p>
        </div>
      </motion.div>

      {/* ─── calendar card ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <GlassCard>
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => shiftMonth(-1)} className="glass grid size-9 place-items-center rounded-full text-white/70 active:scale-95">
              {lang === "fa" ? <ChevronRight className="size-4.5" /> : <ChevronLeft className="size-4.5" />}
            </button>
            <div className="text-[15px] font-extrabold text-white">{titleJ}</div>
            <button onClick={() => shiftMonth(1)} className="glass grid size-9 place-items-center rounded-full text-white/70 active:scale-95">
              {lang === "fa" ? <ChevronLeft className="size-4.5" /> : <ChevronRight className="size-4.5" />}
            </button>
          </div>

          {/* weekday names */}
          <div className="mb-1.5 grid grid-cols-7 text-center text-[9.5px] font-bold text-white/40">
            {t.weekdaysShort.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          {/* day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`b${i}`} />
            ))}
            {Array.from({ length: monthLen }).map((_, i) => {
              const d = i + 1;
              const key = dayOf(d);
              const day = log[key];
              const evCount = day?.events.length ?? 0;
              const hasSleep = (day?.sleepMinutes ?? 0) > 0;
              const isToday = d === todayJ.jd && cursor.jm === todayJ.jm && cursor.jy === todayJ.jy;
              const isSelected = key === selectedKey;
              return (
                <button
                  key={d}
                  onClick={() => {
                    tapHaptic();
                    setSelectedKey(key);
                  }}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl text-[12px] font-bold transition",
                    isSelected
                      ? "bg-teal-300 text-night-950 shadow-[0_0_18px_rgba(94,234,212,.5)]"
                      : evCount > 0
                        ? "bg-rose-400/15 text-rose-100"
                        : hasSleep
                          ? "bg-white/8 text-white/90"
                          : "text-white/55",
                    isToday && !isSelected && "ring-1 ring-teal-300/70",
                  )}
                >
                  {digits(d, lang)}
                  <span className="mt-0.5 flex h-1.5 gap-0.5">
                    {evCount > 0 ? (
                      Array.from({ length: Math.min(3, evCount) }).map((_, j) => (
                        <span key={j} className={cn("size-1 rounded-full", isSelected ? "bg-night-950" : "bg-rose-300")} />
                      ))
                    ) : hasSleep ? (
                      <span className={cn("size-1 rounded-full", isSelected ? "bg-night-950/60" : "bg-teal-300/80")} />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          {/* legend */}
          <div className="mt-3 flex items-center justify-center gap-5 text-[9.5px] text-white/45">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-teal-300/80" /> {t.jLegendOk}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-300" /> {t.jLegendBad}
            </span>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── day detail ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <GlassCard className="mt-4">
          <div className="mb-3 text-[13px] font-extrabold text-white">{selLabel}</div>

          {/* sleep row */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <BedDouble className="size-5 shrink-0 text-violet-200" strokeWidth={1.7} />
            <div className="flex-1">
              <div className="text-[11px] text-white/50">{t.jSleep}</div>
              <div className="text-[13.5px] font-extrabold text-white">
                {(selectedDay?.sleepMinutes ?? 0) > 0 ? t.jHoursFmt(sleepH, sleepM) : t.jNoData}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  tapHaptic();
                  onAdjustSleep(selectedKey, -30);
                }}
                className="grid size-8 place-items-center rounded-full border border-white/15 bg-white/6 text-[10px] font-extrabold text-white/75 active:scale-90"
              >
                {t.jSub30}
              </button>
              <button
                onClick={() => {
                  tapHaptic();
                  onAdjustSleep(selectedKey, 30);
                }}
                className="grid size-8 place-items-center rounded-full border border-teal-300/30 bg-teal-400/15 text-[10px] font-extrabold text-teal-100 active:scale-90"
              >
                {t.jAdd30}
              </button>
            </div>
          </div>

          {/* events */}
          <div className="mt-4 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] font-bold text-white/80">
              <Ghost className="size-4 text-rose-300" />
              {t.jEvents}
            </div>
            <button
              onClick={() => {
                tapHaptic();
                onAddEvent(selectedKey);
              }}
              className="flex items-center gap-1 rounded-full border border-white/15 bg-white/6 px-3 py-1.5 text-[10.5px] font-bold text-white/80 active:scale-95"
            >
              <Plus className="size-3.5" /> {t.jAddEvent}
            </button>
          </div>

          {(selectedDay?.events.length ?? 0) === 0 ? (
            <p className="rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[11px] text-white/40">{t.jNoEvents}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedDay!.events.map((ev, i) => (
                <EventRow
                  key={`${selectedKey}-${i}-${ev.t}`}
                  time={fmtTime(ev.t)}
                  note={ev.note}
                  causePlaceholder={t.jCause}
                  saveLabel={t.jSaveCause}
                  onSave={(note) => onNote(selectedKey, i, note)}
                  onDelete={() => onDeleteEvent(selectedKey, i)}
                />
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── one-year stats ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <GlassCard className="mt-4">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-white">
            <Sparkles className="size-4 text-amber-200" />
            {t.jYearStats}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat icon={MoonStar} label={t.jNightsLogged} value={digits(stats.nightsLogged, lang)} tone="violet" />
            <Stat icon={Ghost} label={t.jTotalEvents} value={digits(stats.totalEvents, lang)} tone="rose" />
            <Stat
              icon={BedDouble}
              label={t.jAvgSleep}
              value={stats.avgSleepMinutes > 0 ? t.jHoursFmt(Math.floor(stats.avgSleepMinutes / 60), stats.avgSleepMinutes % 60) : "—"}
              tone="teal"
            />
            <Stat icon={Flame} label={t.jCalmStreak} value={digits(stats.calmStreak, lang)} tone="gold" />
          </div>

          {/* monthly bars */}
          <div className="mt-5">
            <div className="mb-2 text-[11px] font-bold text-white/60">{t.jMonthly}</div>
            <div className="flex h-20 items-end gap-1">
              {stats.monthlyEvents.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all",
                      v > 0 ? "bg-gradient-to-t from-rose-400/70 to-amber-300/80" : "bg-white/8",
                    )}
                    style={{ height: `${Math.max(8, (v / maxMonthly) * 100)}%` }}
                    title={t.months[i]}
                  />
                  <span className="text-[8px] text-white/35">{digits(i + 1, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* weekly bars */}
          <div className="mt-4">
            <div className="mb-2 text-[11px] font-bold text-white/60">{t.jWeekly}</div>
            <div className="flex h-16 items-end gap-1.5">
              {stats.weeklyEvents.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn("w-full rounded-t-md", v > 0 ? "bg-gradient-to-t from-violet-400/70 to-teal-300/80" : "bg-white/8")}
                    style={{ height: `${Math.max(10, (v / maxWeekly) * 100)}%` }}
                    title={t.weekdaysFull[i]}
                  />
                  <span className="text-[8.5px] text-white/35">{t.weekdaysShort[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ─── pattern insight ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <GlassCard className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-white">
            <Sparkles className="size-4 text-teal-200" />
            {t.jPattern}
          </div>
          {stats.totalEvents < 3 ? (
            <p className="text-[11px] leading-relaxed text-white/45">{t.jPatternNone}</p>
          ) : (
            <div className="flex flex-col gap-2 text-[11.5px] leading-relaxed text-white/70">
              {stats.weeklyEvents[topWeekday] > 0 && <p>• {t.jPatternWeekday(t.weekdaysFull[topWeekday])}</p>}
              {stats.monthlyEvents[topMonth] > 0 && <p>• {t.jPatternMonth(t.months[topMonth])}</p>}
              {stats.topCauses.length > 0 && (
                <div>
                  <p>• {t.jPatternCauses}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {stats.topCauses.map((c) => (
                      <span key={c} className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold text-amber-100">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* ─── export ─── */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button
          onClick={() => {
            tapHaptic();
            onExport();
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-300/90 to-violet-400/90 py-3.5 text-sm font-extrabold text-night-950 shadow-lg shadow-teal-400/15 active:scale-[0.98]"
        >
          <Download className="size-4.5" />
          {t.jExport}
        </button>
        <p className="mt-2 text-center text-[10px] text-white/35">{t.jExportDesc}</p>
      </motion.div>
    </div>
  );
}

// ─── bits ────────────────────────────────────────────────────────────────────

function Stat({ icon: Icon, label, value, tone }: { icon: typeof MoonStar; label: string; value: string; tone: "violet" | "teal" | "rose" | "gold" }) {
  const tones = {
    violet: "from-violet-500/25 to-fuchsia-500/10 text-violet-200",
    teal: "from-teal-400/25 to-cyan-500/10 text-teal-200",
    rose: "from-rose-400/25 to-pink-500/10 text-rose-200",
    gold: "from-amber-300/25 to-orange-400/10 text-amber-200",
  };
  return (
    <div className={cn("rounded-2xl border border-white/8 bg-gradient-to-br px-4 py-3", tones[tone])}>
      <Icon className="mb-1.5 size-4" strokeWidth={1.8} />
      <div className="text-[15px] font-extrabold text-white">{value}</div>
      <div className="mt-0.5 text-[9.5px] text-white/50">{label}</div>
    </div>
  );
}

function EventRow({
  time,
  note,
  causePlaceholder,
  saveLabel,
  onSave,
  onDelete,
}: {
  time: string;
  note: string;
  causePlaceholder: string;
  saveLabel: string;
  onSave: (note: string) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(note);
  const dirty = draft !== note;
  return (
    <div className="rounded-2xl border border-rose-300/15 bg-rose-400/6 px-4 py-3">
      <div className="flex items-center gap-2">
        <Ghost className="size-4 shrink-0 text-rose-300/80" />
        <span className="flex-1 text-[12px] font-extrabold text-white/85" dir="ltr">
          {time}
        </span>
        <button onClick={onDelete} className="grid size-7 place-items-center rounded-full text-rose-300/70 active:scale-90">
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={causePlaceholder}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-night-950/40 px-3 py-2 text-[11px] text-white placeholder:text-white/30 focus:border-teal-300/40 focus:outline-none"
        />
        <button
          onClick={() => onSave(draft)}
          disabled={!dirty}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-extrabold transition",
            dirty ? "bg-teal-300 text-night-950" : "border border-white/10 bg-white/5 text-white/40",
          )}
        >
          <Save className="size-3" />
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
