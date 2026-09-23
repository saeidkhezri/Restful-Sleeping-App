import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Backdrop from "./components/Backdrop";
import LanguageScreen from "./components/LanguageScreen";
import PermissionScreen from "./components/PermissionScreen";
import HomeScreen from "./components/HomeScreen";
import RecordingModal from "./components/RecordingModal";
import AlarmSheet, { type CustomAlarm } from "./components/AlarmSheet";
import MonitorScreen from "./components/MonitorScreen";
import RingingScreen from "./components/RingingScreen";
import ExitScreen from "./components/ExitScreen";
import { ALARM_IDS, dictionaries, type Lang } from "./i18n";
import type { VoiceFingerprint } from "./lib/audioEngine";

const STORE_KEY = "dreamguardian-v1";

interface Persist {
  lang: Lang | null;
  permsDone: boolean;
  sentenceFp: VoiceFingerprint | null;
  humFp: VoiceFingerprint | null;
  alarmId: string;
  customAlarm: CustomAlarm | null;
  vibrate: boolean;
  exited: boolean;
}

const DEFAULTS: Persist = {
  lang: null,
  permsDone: false,
  sentenceFp: null,
  humFp: null,
  alarmId: "dawn",
  customAlarm: null,
  vibrate: true,
  exited: false,
};

function loadPersist(): Persist {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

type Overlay = null | "record" | "sheet" | "monitor" | "ringing";

export default function App() {
  const [state, setState] = useState<Persist>(loadPersist);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  // toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const alarmName =
    state.alarmId === "custom"
      ? state.customAlarm?.name || t.myFile
      : t.alarmNames[(state.alarmId as (typeof ALARM_IDS)[number])] ?? t.alarmNames.dawn;

  const fpsList = [state.sentenceFp, state.humFp].filter(Boolean) as VoiceFingerprint[];

  return (
    <div className="flex h-dvh items-center justify-center bg-[#030309] p-0 sm:p-4">
      {/* ambient glow outside the phone */}
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
        <Backdrop intensity={overlay === "monitor" || overlay === "ringing" ? 0.4 : 1} />

        <div className="relative z-10 h-full">
          <AnimatePresence mode="wait">
            {state.exited ? (
              <ExitScreen
                key="exit"
                lang={lang}
                onRelaunch={() => patch({ exited: false })}
              />
            ) : !state.lang ? (
              <LanguageScreen key="lang" onPick={(l) => patch({ lang: l })} />
            ) : !state.permsDone ? (
              <PermissionScreen key="perms" lang={lang} onDone={() => patch({ permsDone: true })} />
            ) : (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <HomeScreen
                  lang={lang}
                  setLang={(l) => patch({ lang: l })}
                  sentenceFp={state.sentenceFp}
                  humFp={state.humFp}
                  alarmId={state.alarmId}
                  customAlarm={state.customAlarm}
                  vibrate={state.vibrate}
                  onOpenRecord={() => setOverlay("record")}
                  onOpenSheet={() => setOverlay("sheet")}
                  onToggleVibrate={(v) => patch({ vibrate: v })}
                  onStartGuard={() => setOverlay("monitor")}
                  onExit={() => patch({ exited: true })}
                />
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
                customAlarm={state.customAlarm}
                onSelect={(id) => patch({ alarmId: id })}
                onCustomFile={(f) => patch({ customAlarm: f })}
                onClose={() => setOverlay(null)}
              />
            )}

            {overlay === "monitor" && fpsList.length > 0 && (
              <MonitorScreen
                key="monitor"
                lang={lang}
                fingerprints={fpsList}
                alarmName={alarmName}
                onAlarm={() => setOverlay("ringing")}
                onStop={() => setOverlay(null)}
              />
            )}

            {overlay === "ringing" && (
              <RingingScreen
                key="ringing"
                lang={lang}
                alarmId={state.alarmId}
                customDataUrl={state.customAlarm?.dataUrl || null}
                vibrate={state.vibrate}
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
