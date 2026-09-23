import { useMemo } from "react";

interface Star {
  x: number;
  y: number;
  s: number;
  d: number;
  dur: number;
}

export type DayTime = "day" | "night";

export function getDayTime(date = new Date()): DayTime {
  const h = date.getHours();
  return h >= 6 && h < 18 ? "day" : "night";
}

export default function Backdrop({
  intensity = 1,
  mode,
  theme = "dark",
}: {
  intensity?: number;
  mode: DayTime;
  theme?: "light" | "dark";
}) {
  const stars = useMemo<Star[]>(() => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    return Array.from({ length: 28 }, () => ({
      x: rnd() * 100,
      y: rnd() * 55,
      s: 1 + rnd() * 1.8,
      d: rnd() * 4,
      dur: 3 + rnd() * 4,
    }));
  }, []);

  if (mode === "day") {
    const background =
      theme === "light"
        ? "linear-gradient(180deg, #c8ddf2 0%, #d8e7fa 24%, #e7f0fb 44%, #f5f8fd 68%, #fbfdff 100%)"
        : "linear-gradient(180deg, #101024 0%, #16162e 40%, #1d1d38 75%, #232341 100%)";

    const sunGlow =
      theme === "light"
        ? "radial-gradient(circle, rgba(255,242,200,.22), transparent 72%)"
        : "radial-gradient(circle, rgba(190,170,130,.14), transparent 72%)";

    const vignette =
      theme === "light"
        ? "radial-gradient(100% 80% at 50% 100%, transparent 40%, rgba(255,255,255,.08) 100%)"
        : "radial-gradient(100% 80% at 50% 100%, transparent 40%, rgba(5,5,14,.5) 100%)";

    const cloudOpacity = theme === "light" ? 0.32 : 0.13;

    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0" style={{ background, opacity: intensity }} />

        <div
          className="absolute -top-16 start-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: sunGlow, opacity: intensity }}
        />

        <div
          className="absolute top-[12%] start-[-20%] h-16 w-64 rounded-full blur-2xl animate-cloud-slow"
          style={{ background: `rgba(255,255,255,${cloudOpacity})`, opacity: intensity }}
        />
        <div
          className="absolute top-[22%] start-[-15%] h-12 w-48 rounded-full blur-xl animate-cloud-medium"
          style={{ background: `rgba(255,255,255,${cloudOpacity * 0.86})`, opacity: intensity }}
        />
        <div
          className="absolute top-[32%] start-[-25%] h-14 w-56 rounded-full blur-2xl animate-cloud-fast"
          style={{ background: `rgba(255,255,255,${cloudOpacity * 0.78})`, opacity: intensity }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: vignette,
            opacity: intensity,
          }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #010106 0%, #030313 32%, #05051d 62%, #070727 84%, #08082c 100%)",
          opacity: intensity,
        }}
      />
      <div
        className="absolute -top-12 end-[18%] h-48 w-48 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(150,165,200,.12), transparent 75%)",
          opacity: intensity * 0.45,
        }}
      />

      <div className="absolute inset-0" style={{ opacity: intensity }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              opacity: 0.5,
              animation: `star-twinkle ${s.dur}s ease-in-out infinite`,
              animationDelay: `${s.d}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute top-[-10%] start-[-10%] h-[50%] w-[70%] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(ellipse, rgba(94,234,212,.035), transparent 75%)",
          opacity: intensity,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(100% 80% at 50% 100%, transparent 32%, rgba(1,1,6,.82) 100%)",
          opacity: intensity,
        }}
      />
    </div>
  );
}
