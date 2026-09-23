import { useMemo } from "react";

interface Star {
  x: number;
  y: number;
  s: number;
  d: number;
  dur: number;
}

export default function Backdrop({ intensity = 1 }: { intensity?: number }) {
  const stars = useMemo<Star[]>(() => {
    let seed = 7;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    return Array.from({ length: 42 }, () => ({
      x: rnd() * 100,
      y: rnd() * 62,
      s: 1 + rnd() * 2.2,
      d: rnd() * 4,
      dur: 2.2 + rnd() * 3.5,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* base night gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #191944 0%, #0d0d24 42%, #06060f 100%)",
          opacity: intensity,
        }}
      />
      {/* aurora artwork */}
      <img
        src="/images/aurora.jpg"
        alt=""
        className="animate-drift absolute -inset-x-8 top-[-6%] h-[62%] w-[116%] object-cover"
        style={{ opacity: 0.55 * intensity, mixBlendMode: "screen" }}
      />
      {/* stars */}
      <div className="absolute inset-0" style={{ opacity: intensity }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="animate-twinkle absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.s,
              height: s.s,
              animationDelay: `${s.d}s`,
              animationDuration: `${s.dur}s`,
              boxShadow: "0 0 6px rgba(255,255,255,.8)",
            }}
          />
        ))}
      </div>
      {/* glow accents */}
      <div
        className="absolute -top-24 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,.22), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-8rem] start-[-4rem] h-80 w-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(94,234,212,.12), transparent 70%)" }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(3,3,9,.75) 100%)" }}
      />
    </div>
  );
}
