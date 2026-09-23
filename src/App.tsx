import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, House, SlidersHorizontal } from "lucide-react";
import Backdrop, { getDayTime, type DayTime } from "./components/Backdrop";
import LanguageScreen from "./components/LanguageScreen";
import PermissionScreen from "./components/PermissionScreen";
import HomeScreen from "./components/HomeScreen";
import JournalScreen from "./components/JournalScreen";
import SettingsScreen, { type AmbientSettings, type GuardSettings } from "./components/SettingsScreen";
import RecordingModal from "./components/RecordingModal";
import AlarmSheet, { type CustomAlarm } from "./components/AlarmSheet";
import MonitorScreen from "./components/MonitorScreen";
import RingingScreen from "./components/RingingScreen";
import ExitScreen from "./components/ExitScreen";
import { ALARM_IDS, dictionaries, type Lang } from "./i18n";
import { AmbientPlayer } from "./lib/ambient";
import type { VoiceFingerprint } from "./lib/audioEngine";
import { cn } from "./utils/cn";
import {
  dateKey,
  exportEventsICS,
  type SleepLog,
} from "./lib/journalUtils";

const STORE_KEY = "dreamguardian-v2";

interface Persist {
  lang: Lang | null;
  permsDone: boolean;
  sentenceFp: VoiceFingerprint | null;
  humFp: VoiceFingerprint | null;
  alarmId: string; // preset id or "custom:<id>"
  customAlarms: CustomAlarm[];
  vibrate: boolean;
  exited: boolean;
  theme: "dark" | "light";
  guard: GuardSettings;
  ambient: AmbientSettings;
  sleepLog: SleepLog;
}

const DEFAULTS: Persist = {
  lang: null,
  permsDone: false,
  sentenceFp: null,
  humFp: null,
  alarmId: "dawn",
  customAlarms: [],
  vibrate: true,
  exited: false,
  theme: "dark",
  guard: {
    sensitivity: 6,
    minHumCount: 1,
    minHumDurMs: 700,
    alarmVolume: 1,
    alarmRise: false,
    riseSec: 60,
  },
  ambient: { on: true, track: "crickets", vol: 0.12 },
  sleepLog: {},
};

function loadPersist(): Persist {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Persist>;
    return {
      ...DEFAULTS,
      ...parsed,
      guard: { ...DEFAULTS.guard, ...(parsed.guard ?? {}) },
      ambient: { ...DEFAULTS.ambient, ...(parsed.ambient ?? {}) },
      sleepLog: parsed.sleepLog ?? {},
    };
  } catch {
    return DEFAULTS;
  }
}

type Overlay = null | "record" | "sheet" | "monitor" | "ringing";
type Page = "home" | "journal" | "settings";

export default function App() {
  const [state, setState] = useState<Persist>(loadPersist);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [page, setPage] = useState<Page>("home");
  const [toast, setToast] = useState<string | null>(null);
  const [dayTime, setDayTime] = useState<DayTime>(() => getDayTime());

  const ambientRef = useRef<AmbientPlayer | null>(null);
  const guardStartRef = useRef(0);

  const patch = useCallback((p: Partial<Persist>) => {
    setState((prev) => {
      const next = { ...prev, ...p };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        /* storage full / unavailable */
      }
      return next;
    });
  }, []);

  const lang: Lang = state.lang ?? "fa";
  const t = dictionaries[lang];

  // document direction & language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  // theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  // day/night sky refresh (hourly)
  useEffect(() => {
    const id = setInterval(() => setDayTime(getDayTime()), 60_000);
    return () => clearInterval(id);
  }, []);

  // toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  // ── ambient soundscape lifecycle ──
  if (!ambientRef.current) ambientRef.current = new AmbientPlayer();
  useEffect(() => {
    const player = ambientRef.current!;
    const a = state.ambient;
    const quiet = overlay === "monitor" || overlay === "ringing" || state.exited || !state.permsDone;
    if (a.on && !quiet) player.play(a.track, a.vol);
    else player.stop(500);
    return () => player.stop(300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ambient.on, state.ambient.track, state.ambient.vol, overlay, state.exited, state.permsDone]);

  // resume after browser autoplay block
  useEffect(() => {
    const resume = () => ambientRef.current?.resume();
    window.addEventListener("pointerdown", resume);
    return () => window.removeEventListener("pointerdown", resume);
  }, []);

  // ── sleep session logging ──
  const addSleep = useCallback(
    (key: string, minutes: number) => {
      const log = { ...state.sleepLog };
      const day = { ...(log[key] ?? { sleepMinutes: 0, events: [] }) };
      day.sleepMinutes = Math.min(16 * 60, Math.max(0, day.sleepMinutes + minutes));
      log[key] = day;
      patch({ sleepLog: log });
    },
    [patch, state.sleepLog],
  );

  const addEvent = useCallback(
    (key: string, tStamp: number) => {
      const log = { ...state.sleepLog };
      const day = { ...(log[key] ?? { sleepMinutes: 0, events: [] }) };
      day.events = [...day.events, { t: tStamp, note: "" }];
      log[key] = day;
      patch({ sleepLog: log });
    },
    [patch, state.sleepLog],
  );

  const alarmName = useMemo(() => {
    if (state.alarmId.startsWith("custom:")) {
      const c = state.customAlarms.find((x) => `custom:${x.id}` === state.alarmId);
      if (c) return c.name || t.myFile;
    }
    return t.alarmNames[(state.alarmId as (typeof ALARM_IDS)[number])] ?? t.alarmNames.dawn;
  }, [state.alarmId, state.customAlarms, t]);

  const customDataUrl = state.alarmId.startsWith("custom:")
    ? state.customAlarms.find((x) => `custom:${x.id}` === state.alarmId)?.dataUrl ?? null
    : null;

  const fpsList = [state.sentenceFp, state.humFp].filter(Boolean) as VoiceFingerprint[];

  const startGuard = () => {
    guardStartRef.current = Date.now();
    setOverlay("monitor");
  };

  const stopGuard = () => {
    if (guardStartRef.current) {
      const mins = Math.round((Date.now() - guardStartRef.current) / 60000);
      if (mins >= 1) addSleep(dateKey(new Date(guardStartRef.current)), mins);
      guardStartRef.current = 0;
    }
    setOverlay(null);
  };

  const onAlarm = () => {
    addEvent(dateKey(), Date.now());
    setOverlay("ringing");
  };

  // nav items
  const navItems: { id: Page; icon: typeof House; label: string }[] = [
    { id: "home", icon: House, label: t.navHome },
    { id: "journal", icon: CalendarDays, label: t.navJournal },
    { id: "settings", icon: SlidersHorizontal, label: t.navSettings },
  ];

  return (
    <div className="flex h-dvh items-center justify-center bg-[#030309] p-0 sm:p-4">
      <div
        className="pointer-events-none fixed inset-0 hidden sm:block"
        style={{
          background:
            "radial-gradient(60% 80% at 50% 110%, rgba(94,234,212,.07), transparent 60%), radial-gradient(50% 60% at 80% 0%, rgba(167,139,250,.08), transparent 60%)",
        }}
      />

      {/* ─── phone shell ─── */}
      <div
        dir={lang === "fa" ? "rtl" : "ltr"}
        lang={lang}
        className={`relative h-dvh w-full overflow-hidden sm:h-[min(92dvh,900px)] sm:w-[402px] sm:rounded-[46px] sm:border sm:border-white/10 sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,.9),0_0_90px_-30px_rgba(94,234,212,.25)] ${lang === "en" ? "font-en" : ""}`}
      >
        <Backdrop intensity={overlay === "monitor" || overlay === "ringing" ? 0.4 : 1} mode={dayTime} theme={state.theme} />

        <div className="relative z-10 h-full">
          <AnimatePresence mode="wait">
            {state.exited ? (
              <ExitScreen key="exit" lang={lang} onRelaunch={() => patch({ exited: false })} />
            ) : !state.lang ? (
              <LanguageScreen key="lang" onPick={(l) => patch({ lang: l })} />
            ) : !state.permsDone ? (
              <PermissionScreen key="perms" lang={lang} onDone={() => patch({ permsDone: true })} />
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <AnimatePresence mode="wait">
                  {page === "home" && (
                    <motion.div key="p-home" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="h-full">
                      <HomeScreen
                        lang={lang}
                        setLang={(l) => patch({ lang: l })}
                        sentenceFp={state.sentenceFp}
                        humFp={state.humFp}
                        alarmId={state.alarmId}
                        customAlarms={state.customAlarms}
                        vibrate={state.vibrate}
                        onOpenRecord={() => setOverlay("record")}
                        onOpenSheet={() => setOverlay("sheet")}
                        onToggleVibrate={(v) => patch({ vibrate: v })}
                        onStartGuard={startGuard}
                        onExit={() => patch({ exited: true })}
                      />
                    </motion.div>
                  )}
                  {page === "journal" && (
                    <motion.div key="p-journal" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="h-full">
                      <JournalScreen
                        lang={lang}
                        log={state.sleepLog}
                        onAdjustSleep={addSleep}
                        onAddEvent={(key) => addEvent(key, key === dateKey() ? Date.now() : new Date(key).setHours(23, 30, 0, 0))}
                        onNote={(key, idx, note) => {
                          const log = { ...state.sleepLog };
                          const day = log[key];
                          if (!day) return;
                          const events = [...day.events];
                          events[idx] = { ...events[idx], note };
                          log[key] = { ...day, events };
                          patch({ sleepLog: log });
                        }}
                        onDeleteEvent={(key, idx) => {
                          const log = { ...state.sleepLog };
                          const day = log[key];
                          if (!day) return;
                          log[key] = { ...day, events: day.events.filter((_, i) => i !== idx) };
                          patch({ sleepLog: log });
                        }}
                        onExport={() => {
                          exportEventsICS(state.sleepLog, t.brand);
                          setToast(t.jExported);
                        }}
                      />
                    </motion.div>
                  )}
                  {page === "settings" && (
                    <motion.div key="p-settings" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="h-full">
                      <SettingsScreen
                        lang={lang}
                        guard={state.guard}
                        ambient={state.ambient}
                        onGuard={(g) => patch({ guard: { ...state.guard, ...g } })}
                        onAmbient={(a) => patch({ ambient: { ...state.ambient, ...a } })}
                        onToggleTheme={() => patch({ theme: state.theme === "dark" ? "light" : "dark" })}
                        onReopenPerms={() => {
                          setPage("home");
                          patch({ permsDone: false });
                        }}
                        onResetLog={() => {
                          patch({ sleepLog: {} });
                          setToast(t.resetDone);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── bottom nav ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center"
                >
                  <div className="glass pointer-events-auto flex items-center gap-1.5 rounded-full p-1.5 shadow-2xl shadow-black/50">
                    {navItems.map((n) => {
                      const active = page === n.id;
                      return (
                        <button
                          key={n.id}
                          onClick={() => setPage(n.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[11px] font-extrabold transition-all duration-300",
                            active
                              ? "bg-gradient-to-r from-teal-300 to-violet-400 text-night-950 shadow-lg shadow-teal-400/25"
                              : "text-white/55 active:scale-95",
                          )}
                        >
                          <n.icon className="size-4" strokeWidth={2.2} />
                          {active && <span>{n.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── overlays ─── */}
          <AnimatePresence>
            {overlay === "record" && (
              <RecordingModal
                key="record"
                lang={lang}
                needSentence
                needHum
                onSave={(fps) => patch({ sentenceFp: fps.sentence, humFp: fps.hum })}
                onClose={() => setOverlay(null)}
              />
            )}

            {overlay === "sheet" && (
              <AlarmSheet
                key="sheet"
                lang={lang}
                alarmId={state.alarmId}
                customAlarms={state.customAlarms}
                alarmVolume={state.guard.alarmVolume}
                onSelect={(id) => patch({ alarmId: id })}
                onAdd={(f) => {
                  const id = Math.random().toString(36).slice(2, 9);
                  patch({
                    customAlarms: [...state.customAlarms, { ...f, id }],
                    alarmId: `custom:${id}`,
                  });
                  setToast(t.fileSaved);
                  return true;
                }}
                onRemove={(id) => {
                  const rest = state.customAlarms.filter((c) => c.id !== id);
                  patch({
                    customAlarms: rest,
                    alarmId: state.alarmId === `custom:${id}` ? "dawn" : state.alarmId,
                  });
                }}
                onClose={() => setOverlay(null)}
              />
            )}

            {overlay === "monitor" && fpsList.length > 0 && (
              <MonitorScreen
                key="monitor"
                lang={lang}
                fingerprints={fpsList}
                alarmName={alarmName}
                settings={{
                  sensitivity: state.guard.sensitivity,
                  minHumCount: state.guard.minHumCount,
                  minHumDurMs: state.guard.minHumDurMs,
                }}
                onAlarm={onAlarm}
                onStop={stopGuard}
              />
            )}

            {overlay === "ringing" && (
              <RingingScreen
                key="ringing"
                lang={lang}
                alarmId={state.alarmId}
                customDataUrl={customDataUrl}
                vibrate={state.vibrate}
                behavior={{
                  volume: state.guard.alarmVolume,
                  rise: state.guard.alarmRise,
                  riseSec: state.guard.riseSec,
                }}
                onDismiss={() => {
                  setToast(t.resumed);
                  setOverlay("monitor");
                }}
              />
            )}
          </AnimatePresence>

          {/* toast */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="absolute inset-x-0 top-5 z-[60] mx-auto flex w-fit items-center gap-2 rounded-full border border-teal-300/30 bg-night-900/90 px-4 py-2 text-xs font-bold text-teal-100 shadow-xl backdrop-blur-md"
              >
                <CheckCircle2 className="size-4 text-teal-300" />
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
