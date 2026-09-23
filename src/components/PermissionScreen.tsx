import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BellRing,
  CalendarDays,
  Check,
  FolderOpen,
  Mic,
  MonitorSmartphone,
  MoonStar,
  ShieldAlert,
} from "lucide-react";
import { dictionaries, type Lang } from "../i18n";
import { tapHaptic } from "../lib/audioEngine";
import { GradientButton, IconBadge } from "./ui";

type RowState = "idle" | "busy" | "granted" | "denied" | "auto";

export default function PermissionScreen({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const t = dictionaries[lang];
  const [mic, setMic] = useState<RowState>("idle");
  const [notify, setNotify] = useState<RowState>("idle");
  const [files, setFiles] = useState<RowState>("idle");
  const [cal, setCal] = useState<RowState>("idle");
  const [wake, setWake] = useState<RowState>("idle");
  const [calHint, setCalHint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── real microphone request ──
  const allowMic = async () => {
    tapHaptic();
    setMic("busy");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
      setMic("granted");
    } catch {
      setMic("denied");
    }
  };

  // ── real notification request ──
  const allowNotify = async () => {
    tapHaptic();
    setNotify("busy");
    try {
      if (typeof Notification !== "undefined" && Notification.requestPermission) {
        const res = await Notification.requestPermission();
        setNotify(res === "granted" ? "granted" : "denied");
      } else {
        setNotify("auto");
      }
    } catch {
      setNotify("denied");
    }
  };

  // ── real storage verification (opens the device file picker) ──
  const allowFiles = () => {
    tapHaptic();
    setFiles("busy");
    fileInputRef.current?.click();
  };
  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setFiles("granted");
      reader.onerror = () => setFiles("denied");
      reader.readAsArrayBuffer(f.slice(0, 16));
    } else {
      setFiles("idle");
    }
    e.target.value = "";
  };

  // ── real calendar bridge: creates an actual ICS file on the device ──
  const allowCalendar = () => {
    tapHaptic();
    setCal("busy");
    try {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}00`;
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DreamGuardian//PermissionCheck//FA",
        "BEGIN:VEVENT",
        `UID:perm-check-${now.getTime()}@dreamguardian`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${stamp}`,
        "DURATION:PT1M",
        `SUMMARY:${t.brand}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dream-guardian-calendar.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      setCal("granted");
      setCalHint(true);
    } catch {
      setCal("denied");
    }
  };

  // ── real screen wake-lock request ──
  const allowWake = async () => {
    tapHaptic();
    setWake("busy");
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
      if (nav.wakeLock?.request) {
        const sentinel = await nav.wakeLock.request("screen");
        await sentinel.release();
        setWake("granted");
      } else {
        setWake("auto");
      }
    } catch {
      setWake("denied");
    }
  };

  const actions: Record<string, () => void> = {
    mic: () => void allowMic(),
    notify: () => void allowNotify(),
    files: allowFiles,
    cal: allowCalendar,
    wake: () => void allowWake(),
  };

  const allowAll = async () => {
    tapHaptic();
    await allowMic();
    await allowNotify();
    allowFiles();
    allowCalendar();
    await allowWake();
  };

  const rows: {
    key: keyof typeof actions;
    icon: typeof Mic;
    title: string;
    desc: string;
    state: RowState;
  }[] = [
    { key: "mic", icon: Mic, title: t.permMic, desc: t.permMicDesc, state: mic },
    { key: "notify", icon: BellRing, title: t.permNotify, desc: t.permNotifyDesc, state: notify },
    { key: "files", icon: FolderOpen, title: t.permFiles, desc: t.permFilesDesc, state: files },
    { key: "cal", icon: CalendarDays, title: t.permCal, desc: t.permCalDesc, state: cal },
    { key: "wake", icon: MonitorSmartphone, title: t.permWake, desc: t.permWakeDesc, state: wake },
  ];

  const statusNode = (s: RowState) => {
    if (s === "granted")
      return (
        <span className="flex items-center gap-1 rounded-full border border-teal-300/30 bg-teal-400/15 px-2.5 py-1 text-[10px] font-bold text-teal-200">
          <Check className="size-3" /> {t.grantedBadge}
        </span>
      );
    if (s === "denied")
      return (
        <span className="rounded-full border border-rose-300/30 bg-rose-400/15 px-2.5 py-1 text-[10px] font-bold text-rose-200">
          {t.grantFail}
        </span>
      );
    if (s === "auto")
      return (
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/50">
          {t.permAuto}
        </span>
      );
    if (s === "busy")
      return (
        <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-teal-300" />
      );
    return null;
  };

  return (
    <div className="no-scrollbar relative flex h-full flex-col justify-center overflow-y-auto px-6 py-8">
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={onFilePicked} />

      {/* dialog header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl border border-violet-300/25 bg-violet-400/12 shadow-[0_0_30px_rgba(167,139,250,.3)]">
          <MoonStar className="size-7 text-violet-200" strokeWidth={1.6} />
        </div>
        <h1 className="text-[22px] font-extrabold leading-snug text-white">{t.permTitle}</h1>
        <p className="mx-auto mt-1.5 max-w-[40ch] text-[11.5px] leading-relaxed text-white/55">{t.permDesc}</p>
      </motion.div>

      {/* rows */}
      <div className="mt-6 flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="glass flex items-center gap-3 rounded-2xl p-3.5"
          >
            <IconBadge
              icon={r.icon}
              tone={r.key === "mic" ? "teal" : r.key === "notify" ? "gold" : r.key === "files" ? "violet" : r.key === "cal" ? "rose" : "teal"}
              className="!size-10 !rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-white">{r.title}</div>
              <div className="mt-0.5 text-[10px] leading-relaxed text-white/50">{r.desc}</div>
            </div>
            {r.state === "idle" || r.state === "denied" ? (
              <button
                onClick={actions[r.key]}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10.5px] font-extrabold active:scale-95 ${
                  r.state === "denied"
                    ? "border border-rose-300/40 bg-rose-400/15 text-rose-100"
                    : "bg-gradient-to-r from-teal-300 to-violet-400 text-night-950 shadow-md shadow-teal-400/20"
                }`}
              >
                {t.allowBtn}
              </button>
            ) : (
              statusNode(r.state)
            )}
          </motion.div>
        ))}
      </div>

      {mic === "denied" && (
        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-rose-200/90">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {t.permDenied}
        </p>
      )}
      {calHint && <p className="mt-2 text-center text-[10px] text-teal-200/80">{t.calHint}</p>}

      {/* group allow + continue */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.55 }}
        className="mt-5 flex flex-col gap-2.5"
      >
        <GradientButton tone="teal" onClick={() => void allowAll()}>
          {t.allowAllBtn}
        </GradientButton>
        <button
          onClick={() => {
            tapHaptic();
            onDone();
          }}
          className="w-full rounded-2xl border border-white/12 bg-white/6 py-3.5 text-sm font-bold text-white/75 active:scale-[0.98]"
        >
          {t.continueBtn}
        </button>
      </motion.div>
    </div>
  );
}
