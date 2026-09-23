import { motion } from "framer-motion";
import { ChevronLeft, MoonStar, Sparkles } from "lucide-react";
import { dictionaries, type Lang } from "../i18n";
import { tapHaptic } from "../lib/audioEngine";

export default function LanguageScreen({ onPick }: { onPick: (l: Lang) => void }) {
  const t = dictionaries.fa;

  const pick = (l: Lang) => {
    tapHaptic();
    onPick(l);
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-8">
      {/* floating moon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        <div className="animate-floaty relative">
          <div className="absolute inset-0 -m-6 rounded-full bg-violet-500/25 blur-3xl" />
          <img
            src="/images/moon.png"
            alt=""
            className="relative h-40 w-40 rounded-full object-cover [mask-image:radial-gradient(circle,black_55%,transparent_72%)]"
          />
          <Sparkles className="absolute -top-1 -end-2 size-6 text-teal-200/90 animate-breathe" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="text-center"
      >
        <div className="mb-2 flex items-center justify-center gap-2 text-teal-200/80">
          <MoonStar className="size-4" strokeWidth={1.6} />
          <span className="text-xs font-semibold tracking-widest text-teal-100/80">{t.brand}</span>
        </div>
        <h1 className="text-2xl font-extrabold leading-snug text-white">
          زبان خود را انتخاب کنید
        </h1>
        <p className="font-en mt-1 text-lg font-semibold text-white/85">Choose your language</p>
        <p className="mt-3 text-xs text-white/50">{dictionaries.fa.langDesc}</p>
      </motion.div>

      <div className="mt-9 flex w-full flex-col gap-4">
        {(
          [
            { id: "fa" as Lang, title: t.faName, sub: t.faSub, en: false },
            { id: "en" as Lang, title: t.enName, sub: t.enSub, en: true },
          ]
        ).map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.14, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.97 }}
            onClick={() => pick(c.id)}
            className="glass group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl p-5 text-start transition-colors hover:border-white/25"
          >
            <div
              className={`grid size-14 shrink-0 place-items-center rounded-2xl border text-xl font-extrabold ${
                c.id === "fa"
                  ? "border-teal-300/30 bg-teal-400/15 text-teal-100 shadow-[0_0_28px_rgba(94,234,212,.25)]"
                  : "border-violet-300/30 bg-violet-400/15 text-violet-100 shadow-[0_0_28px_rgba(167,139,250,.25)] font-en"
              }`}
            >
              {c.id === "fa" ? "فا" : "En"}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-lg font-extrabold text-white ${c.en ? "font-en" : ""}`}>{c.title}</div>
              <div className="mt-0.5 text-xs text-white/50">{c.sub}</div>
            </div>
            <ChevronLeft className="size-5 text-white/35 transition-transform group-hover:-translate-x-1 rtl:rotate-0 ltr:rotate-180" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
