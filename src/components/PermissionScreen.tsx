import { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Check, Mic, ShieldAlert, Vibrate } from "lucide-react";
import { dictionaries, type Lang } from "../i18n";
import { tapHaptic, vibrateSupported } from "../lib/audioEngine";
import { GlassCard, GradientButton, IconBadge } from "./ui";

type PermState = "idle" | "granted" | "denied";

export default function PermissionScreen({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: () => void;
}) {
  const t = dictionaries[lang];
  const [mic, setMic] = useState<PermState>("idle");
  const [notify, setNotify] = useState<PermState>("idle");
  const [busy, setBusy] = useState(false);

  const requestAll = async () => {
    tapHaptic();
    setBusy(true);

    // microphone (required)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
      setMic("granted");
    } catch {
      setMic("denied");
    }

    // notifications (optional)
    try {
      if (typeof Notification !== "undefined" && Notification.requestPermission) {
        const res = await Notification.requestPermission();
        setNotify(res === "granted" ? "granted" : "denied");
      } else {
        setNotify("granted");
      }
    } catch {
      setNotify("denied");
    }

    setBusy(false);
  };

  const rows: {
    key: string;
    icon: typeof Mic;
    title: string;
    desc: string;
    state: PermState | "auto";
  }[] = [
    { key: "mic", icon: Mic, title: t.permMic, desc: t.permMicDesc, state: mic },
    { key: "notify", icon: BellRing, title: t.permNotify, desc: t.permNotifyDesc, state: notify },
    { key: "vib", icon: Vibrate, title: t.vibrateTitle, desc: t.vibrateDesc, state: "auto" },
  ];

  return (
    <div className="relative flex h-full flex-col justify-center px-7 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mb-3 flex items-center gap-2 text-teal-200/80">
          <span className="text-xs font-bold tracking-widest">{t.brand}</span>
        </div>
        <h1 className="text-[26px] font-extrabold leading-snug text-white">{t.permTitle}</h1>
        <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-white/55">{t.permDesc}</p>
      </motion.div>

      <div className="mt-7 flex flex-col gap-3">
        {rows.map((r, i) => (
          <motion.div
            key={r.key}
            initial={{ opacity: 0, x: lang === "fa" ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard className="flex items-center gap-4 !p-4">
              <IconBadge icon={r.icon} tone={r.key === "mic" ? "teal" : r.key === "notify" ? "gold" : "violet"} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-white">{r.title}</div>
                <div className="mt-0.5 text-[11px] leading-relaxed text-white/50">{r.desc}</div>
              </div>
              {r.state === "granted" && (
                <span className="flex items-center gap-1 rounded-full border border-teal-300/30 bg-teal-400/15 px-2.5 py-1 text-[10px] font-bold text-teal-200">
                  <Check className="size-3" /> {t.grantedBadge}
                </span>
              )}
              {r.state === "denied" && (
                <span className="rounded-full border border-rose-300/30 bg-rose-400/15 px-2.5 py-1 text-[10px] font-bold text-rose-200">
                  {t.grantFail}
                </span>
              )}
              {r.state === "auto" && (
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/50">
                  {t.permAuto}
                  {!vibrateSupported() && "·"}
                </span>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {mic === "denied" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-rose-200/90"
        >
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {t.permDenied}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="mt-7 flex flex-col gap-3"
      >
        <GradientButton onClick={requestAll} tone="teal" className={busy ? "opacity-70" : ""}>
          {t.grantBtn}
        </GradientButton>
        <GradientButton
          onClick={() => {
            tapHaptic();
            onDone();
          }}
          tone="violet"
          className="!bg-none !border !border-white/12 !bg-white/8 !text-white/80"
        >
          {t.continueBtn}
        </GradientButton>
      </motion.div>
    </div>
  );
}
