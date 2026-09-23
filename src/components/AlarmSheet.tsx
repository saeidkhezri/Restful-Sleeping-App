import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, FileAudio, FolderOpen, Music4, Pause, Play, Trash2, X } from "lucide-react";
import { ALARM_IDS, dictionaries, type Lang } from "../i18n";
import { AlarmController, tapHaptic } from "../lib/audioEngine";

export interface CustomAlarm {
  id: string;
  name: string;
  dataUrl: string;
}

export default function AlarmSheet({
  lang,
  alarmId,
  customAlarms,
  alarmVolume,
  onSelect,
  onAdd,
  onRemove,
  onClose,
}: {
  lang: Lang;
  alarmId: string; // preset id or "custom:<id>"
  customAlarms: CustomAlarm[];
  alarmVolume: number;
  onSelect: (id: string) => void;
  onAdd: (f: Omit<CustomAlarm, "id">) => boolean; // returns false when too big
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const t = dictionaries[lang];
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [fileError, setFileError] = useState(false);
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

  const preview = (key: string, dataUrl?: string) => {
    tapHaptic();
    const player = playerRef.current;
    if (previewing === key) {
      player.stop();
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      setPreviewing(null);
      return;
    }
    player.stop();
    player.start(key, dataUrl, { volume: alarmVolume, riseSec: 0 });
    setPreviewing(key);
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
      if (dataUrl.length > 4_700_000) {
        setFileError(true);
        return;
      }
      setFileError(false);
      const ok = onAdd({ name: file.name, dataUrl });
      if (!ok) setFileError(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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
        className="absolute inset-x-0 bottom-0 z-50 max-h-[86%] overflow-y-auto rounded-t-[32px] border-t border-white/12 bg-night-900/95 p-6 pb-9 backdrop-blur-2xl no-scrollbar"
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

        {/* add from storage */}
        <button
          onClick={() => fileRef.current?.click()}
          className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-dashed border-teal-300/30 bg-teal-400/8 px-4 py-3.5 text-start active:scale-[0.98]"
        >
          <FolderOpen className="size-5 text-teal-200" strokeWidth={1.8} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-teal-100">{t.customFromPhone}</div>
            <div className="text-[10px] text-white/45">{t.pickAudioHint}</div>
          </div>
        </button>
        <input ref={fileRef} type="file" accept="audio/*" onChange={onFile} />
        {fileError && <p className="mb-2 text-[10px] font-semibold text-rose-300">{t.fileTooBig}</p>}

        {/* my library */}
        <div className="mb-1.5 mt-3 flex items-center gap-2 text-[11px] font-bold text-white/45">
          <FileAudio className="size-3.5" />
          {t.myLibrary}
        </div>
        {customAlarms.length === 0 ? (
          <p className="mb-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-[11px] text-white/40">
            {t.libraryEmpty}
          </p>
        ) : (
          <div className="mb-3 flex flex-col gap-2">
            {customAlarms.map((c) => (
              <RowButton
                key={c.id}
                selected={alarmId === `custom:${c.id}`}
                name={c.name || t.myFile}
                previewing={previewing === `custom:${c.id}`}
                onPick={() => pick(`custom:${c.id}`)}
                onPreview={() => preview(`custom:${c.id}`, c.dataUrl)}
                onDelete={() => {
                  tapHaptic();
                  onRemove(c.id);
                }}
              />
            ))}
          </div>
        )}

        {/* built-in presets */}
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pe-1 no-scrollbar">
          {ALARM_IDS.map((id) => (
            <RowButton
              key={id}
              selected={alarmId === id}
              name={t.alarmNames[id]}
              previewing={previewing === id}
              onPick={() => pick(id)}
              onPreview={() => preview(id)}
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
  previewing,
  onPick,
  onPreview,
  onDelete,
}: {
  selected: boolean;
  name: string;
  previewing: boolean;
  onPick: () => void;
  onPreview: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
        selected ? "border-teal-300/40 bg-teal-400/12" : "border-white/8 bg-white/4"
      }`}
    >
      <button
        onClick={onPreview}
        className={`grid size-10 shrink-0 place-items-center rounded-full border transition ${
          previewing
            ? "border-teal-300/60 bg-teal-300 text-night-950 shadow-[0_0_18px_rgba(94,234,212,.55)]"
            : "border-white/15 bg-white/6 text-white/75 active:scale-95"
        }`}
        aria-label="preview"
      >
        {previewing ? <Pause className="size-4.5" /> : <Play className="size-4.5 -me-0.5" />}
      </button>
      <button onClick={onPick} className="flex min-w-0 flex-1 items-center gap-3 text-start">
        <Music4 className="size-5 shrink-0 text-white/60" strokeWidth={1.8} />
        <span className="flex-1 truncate text-sm font-bold text-white/90">{name}</span>
        <span
          className={`grid size-5.5 shrink-0 place-items-center rounded-full border transition ${
            selected ? "border-teal-300 bg-teal-300 text-night-950" : "border-white/25"
          }`}
        >
          {selected && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="grid size-8 shrink-0 place-items-center rounded-full text-rose-300/70 active:scale-90"
          aria-label="delete"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
