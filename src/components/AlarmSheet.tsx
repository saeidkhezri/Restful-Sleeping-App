import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, FileAudio, FolderOpen, Music4, Pause, Play, X } from "lucide-react";
import { ALARM_IDS, dictionaries, type Lang } from "../i18n";
import { AlarmController, tapHaptic } from "../lib/audioEngine";

export interface CustomAlarm {
  name: string;
  dataUrl: string;
}

export default function AlarmSheet({
  lang,
  alarmId,
  customAlarm,
  onSelect,
  onCustomFile,
  onClose,
}: {
  lang: Lang;
  alarmId: string;
  customAlarm: CustomAlarm | null;
  onSelect: (id: string) => void;
  onCustomFile: (f: CustomAlarm | null) => void;
  onClose: () => void;
}) {
  const t = dictionaries[lang];
  const [previewing, setPreviewing] = useState<string | null>(null);
  const playerRef = useRef(new AlarmController());
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      player.stop();
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  const preview = (id: string, dataUrl?: string) => {
    tapHaptic();
    const player = playerRef.current;
    if (previewing === id) {
      player.stop();
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      setPreviewing(null);
      return;
    }
    player.stop();
    player.start(id, dataUrl);
    setPreviewing(id);
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      player.stop();
      setPreviewing(null);
    }, 2600);
  };

  const pick = (id: string) => {
    tapHaptic();
    onSelect(id);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      // keep localStorage safe — accept up to ~3.5MB
      if (dataUrl.length > 4_700_000) {
        onCustomFile({ name: file.name, dataUrl: "" });
        return;
      }
      onCustomFile({ name: file.name, dataUrl });
      onSelect("custom");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const rows = ALARM_IDS.map((id, i) => ({
    id,
    name: t.alarmNames[id],
    icon: Music4,
    tone: ["teal", "gold", "rose", "violet", "teal"][i],
  }));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 z-40 bg-night-950/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="absolute inset-x-0 bottom-0 z-50 rounded-t-[32px] border-t border-white/12 bg-night-900/95 p-6 pb-9 backdrop-blur-2xl"
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white">{t.sheetTitle}</h3>
            <p className="mt-0.5 text-xs text-white/50">{t.sheetDesc}</p>
          </div>
          <button
            onClick={() => {
              tapHaptic();
              onClose();
            }}
            className="glass grid size-9 place-items-center rounded-full text-white/70 active:scale-95"
            aria-label={t.closeLabel}
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* custom file */}
        <button
          onClick={() => fileRef.current?.click()}
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-dashed border-teal-300/30 bg-teal-400/8 px-4 py-3.5 text-start active:scale-[0.98]"
        >
          <FolderOpen className="size-5 text-teal-200" strokeWidth={1.8} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-teal-100">{t.customFromPhone}</div>
            <div className="text-[10px] text-white/45">{t.pickAudioHint}</div>
          </div>
          {customAlarm && alarmId === "custom" && <Check className="size-4 text-teal-300" />}
        </button>
        <input ref={fileRef} type="file" accept="audio/*" onChange={onFile} />

        {customAlarm && (
          <RowButton
            selected={alarmId === "custom"}
            name={customAlarm.name || t.myFile}
            icon={<FileAudio className="size-5 text-teal-200" strokeWidth={1.8} />}
            previewing={previewing === "custom"}
            onPick={() => customAlarm.dataUrl && pick("custom")}
            onPreview={() => customAlarm.dataUrl && preview("custom", customAlarm.dataUrl)}
            disabled={!customAlarm.dataUrl}
          />
        )}

        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pe-1 no-scrollbar">
          {rows.map((r) => (
            <RowButton
              key={r.id}
              selected={alarmId === r.id}
              name={r.name}
              icon={<r.icon className="size-5 text-white/70" strokeWidth={1.8} />}
              previewing={previewing === r.id}
              onPick={() => pick(r.id)}
              onPreview={() => preview(r.id)}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

function RowButton({
  selected,
  name,
  icon,
  previewing,
  onPick,
  onPreview,
  disabled,
}: {
  selected: boolean;
  name: string;
  icon: React.ReactNode;
  previewing: boolean;
  onPick: () => void;
  onPreview: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
        selected ? "border-teal-300/40 bg-teal-400/12" : "border-white/8 bg-white/4"
      } ${disabled ? "opacity-40" : ""}`}
    >
      <button
        onClick={onPreview}
        disabled={disabled}
        className={`grid size-10 shrink-0 place-items-center rounded-full border transition ${
          previewing
            ? "border-teal-300/60 bg-teal-300 text-night-950 shadow-[0_0_18px_rgba(94,234,212,.55)]"
            : "border-white/15 bg-white/6 text-white/75 active:scale-95"
        }`}
        aria-label="preview"
      >
        {previewing ? <Pause className="size-4.5" /> : <Play className="size-4.5 -me-0.5" />}
      </button>
      <button onClick={onPick} disabled={disabled} className="flex min-w-0 flex-1 items-center gap-3 text-start">
        {icon}
        <span className="flex-1 truncate text-sm font-bold text-white/90">{name}</span>
        <span
          className={`grid size-5.5 shrink-0 place-items-center rounded-full border transition ${
            selected ? "border-teal-300 bg-teal-300 text-night-950" : "border-white/25"
          }`}
        >
          {selected && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </button>
    </div>
  );
}
