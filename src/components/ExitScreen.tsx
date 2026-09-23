import { motion } from "framer-motion";
import { MoonStar, RotateCcw } from "lucide-react";
import { dictionaries, type Lang } from "../i18n";
import { tapHaptic } from "../lib/audioEngine";

export default function ExitScreen({ lang, onRelaunch }: { lang: Lang; onRelaunch: () => void }) {
  const t = dictionaries[lang];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex h-full flex-col items-center justify-center bg-[#04040a] px-10"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="absolute inset-0 -m-10 rounded-full bg-violet-500/10 blur-3xl" />
        <img
          src="/images/moon.png"
          alt=""
          className="relative h-32 w-32 rounded-full object-cover opacity-70 [mask-image:radial-gradient(circle,black_52%,transparent_72%)]"
        />
        <MoonStar className="absolute -bottom-1 -end-1 size-6 text-teal-200/50" strokeWidth={1.4} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mt-8 text-2xl font-extrabold text-white/90"
      >
        {t.exitTitle}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="mt-2 text-xs text-white/40"
      >
        {t.exitDesc}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.6 }}
        onClick={() => {
          tapHaptic();
          onRelaunch();
        }}
        className="glass mt-10 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white/85 active:scale-95"
      >
        <RotateCcw className="size-4 text-teal-200" />
        {t.relaunch}
      </motion.button>
    </motion.div>
  );
}
