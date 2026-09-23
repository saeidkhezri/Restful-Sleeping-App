// ─────────────────────────────────────────────────────────────────────────────
//  Ambient soundscape engine.
//  Streams gentle nature loops from the internet; if a track can't load
//  (offline / blocked), an equivalent signature is synthesized with Web Audio
//  so the calm atmosphere never breaks.
// ─────────────────────────────────────────────────────────────────────────────

export type AmbientTrackId = "waves" | "crickets" | "rain" | "breeze";

export interface AmbientTrack {
  id: AmbientTrackId;
  url: string;
  credit: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: "waves",
    // Wikimedia Commons — «Seasound» by Orion tw, CC BY-SA 3.0
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Seasound.ogg",
    credit: "Seasound · Orion tw (CC BY-SA 3.0) · Wikimedia Commons",
  },
  {
    id: "crickets",
    // OpenGameArt — «Crickets Ambient Noise» by Wolfgang_, CC0
    url: "https://opengameart.org/sites/default/files/crickets%5F1.mp3",
    credit: "Crickets Ambient Noise · Wolfgang_ (CC0) · OpenGameArt",
  },
  {
    id: "rain",
    // Wikimedia Commons — «Rain against the window», via pdsounds.org (public domain)
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rain_against_the_window.ogg",
    credit: "Rain against the window · cori · pdsounds / Wikimedia Commons",
  },
  {
    id: "breeze",
    // Wikimedia Commons — lake-shore «Waves» by Dsw4, released into the public domain
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/Waves.ogg",
    credit: "Lakeshore breeze waves · Dsw4 (Public domain) · Wikimedia Commons",
  },
];

// ─── synthesized backups (Web Audio) ─────────────────────────────────────────

function makeNoiseBuffer(ctx: AudioContext, seconds: number, brown = false): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      data[i] = white;
    }
  }
  return buf;
}

function noiseSource(ctx: AudioContext, brown = false): AudioBufferSourceNode {
  const src = ctx.createBufferSource();
  src.buffer = makeNoiseBuffer(ctx, 3.1, brown);
  src.loop = true;
  return src;
}

type SynthHandle = { stop: () => void };

function synthWaves(ctx: AudioContext, out: GainNode): SynthHandle {
  const src = noiseSource(ctx, true);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 640;
  const g = ctx.createGain();
  g.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.32;
  lfo.connect(lfoG);
  lfoG.connect(g.gain);
  src.connect(lp);
  lp.connect(g);
  g.connect(out);
  src.start();
  lfo.start();
  return { stop: () => { try { src.stop(); lfo.stop(); } catch { /* noop */ } } };
}

function synthRain(ctx: AudioContext, out: GainNode): SynthHandle {
  const src = noiseSource(ctx, false);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2600;
  bp.Q.value = 0.35;
  const g = ctx.createGain();
  g.gain.value = 0.5;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 0.14;
  lfo.connect(lfoG);
  lfoG.connect(bp.frequency);
  src.connect(bp);
  bp.connect(g);
  g.connect(out);
  src.start();
  lfo.start();
  return { stop: () => { try { src.stop(); lfo.stop(); } catch { /* noop */ } } };
}

function synthWind(ctx: AudioContext, out: GainNode): SynthHandle {
  const src = noiseSource(ctx, true);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 300;
  const g = ctx.createGain();
  g.gain.value = 0.45;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoG = ctx.createGain();
  lfoG.gain.value = 120;
  lfo.connect(lfoG);
  lfoG.connect(lp.frequency);
  src.connect(lp);
  lp.connect(g);
  g.connect(out);
  src.start();
  lfo.start();
  return { stop: () => { try { src.stop(); lfo.stop(); } catch { /* noop */ } } };
}

function synthCrickets(ctx: AudioContext, out: GainNode): SynthHandle {
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(out);
  // distant room-tone
  const bed = noiseSource(ctx, true);
  const bedLp = ctx.createBiquadFilter();
  bedLp.type = "lowpass";
  bedLp.frequency.value = 220;
  const bedG = ctx.createGain();
  bedG.gain.value = 0.16;
  bed.connect(bedLp);
  bedLp.connect(bedG);
  bedG.connect(master);
  bed.start();

  const timer = setInterval(() => {
    // chirp burst: rapid pulses around 4.2kHz
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = 4100 + Math.random() * 600;
    const g = ctx.createGain();
    g.gain.value = 0;
    const pulse = ctx.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = 24 + Math.random() * 8;
    const pulseG = ctx.createGain();
    pulseG.gain.value = 0.5;
    const dc = ctx.createConstantSource();
    dc.offset.value = 0.5;
    pulse.connect(pulseG);
    dc.connect(pulseG);
    pulseG.connect(g.gain);
    const vca = ctx.createGain();
    vca.gain.setValueAtTime(0.0, t0);
    vca.gain.linearRampToValueAtTime(0.09 + Math.random() * 0.05, t0 + 0.04);
    vca.gain.setValueAtTime(0.16, t0 + 0.75 + Math.random() * 0.3);
    vca.gain.linearRampToValueAtTime(0, t0 + 1.4);
    o.connect(g);
    g.connect(vca);
    vca.connect(master);
    o.start(t0);
    o.stop(t0 + 1.5);
    pulse.start(t0);
    pulse.stop(t0 + 1.5);
    dc.start(t0);
    dc.stop(t0 + 1.5);
  }, 1400 + Math.random() * 1200);

  return { stop: () => { clearInterval(timer); try { bed.stop(); } catch { /* noop */ } } };
}

const SYNTHS: Record<AmbientTrackId, (ctx: AudioContext, out: GainNode) => SynthHandle> = {
  waves: synthWaves,
  crickets: synthCrickets,
  rain: synthRain,
  breeze: synthWind,
};

// ─── the player ──────────────────────────────────────────────────────────────

export class AmbientPlayer {
  private el: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private synthHandle: SynthHandle | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private currentId: AmbientTrackId | null = null;
  private targetVol = 0.1;
  private errorCount = 0;

  private clearFade() {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }

  private fadeTo(node: { set: (v: number) => void; get: () => number }, target: number, ms: number, onDone?: () => void) {
    this.clearFade();
    const steps = Math.max(1, Math.floor(ms / 60));
    const from = node.get();
    const delta = (target - from) / steps;
    let i = 0;
    this.fadeTimer = setInterval(() => {
      i++;
      node.set(i >= steps ? target : from + delta * i);
      if (i >= steps) {
        this.clearFade();
        onDone?.();
      }
    }, 60);
  }

  private killEl() {
    if (this.el) {
      this.el.pause();
      this.el.src = "";
    }
    this.el = null;
  }

  /** start or switch to a track; id of null → stop everything */
  play(id: AmbientTrackId, targetVol: number): void {
    this.targetVol = targetVol;
    if (this.currentId === id) {
      // just update volume
      if (this.el) this.fadeTo({ set: (v) => { if (this.el) this.el.volume = v; }, get: () => this.el?.volume ?? 0 }, targetVol, 500);
      if (this.out && this.ctx) this.out.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.5);
      return;
    }
    this.stop(400);
    this.currentId = id;
    this.errorCount = 0;
    const track = AMBIENT_TRACKS.find((t) => t.id === id);
    if (!track) return;

    const el = new Audio();
    el.crossOrigin = "anonymous";
    el.loop = true;
    el.volume = 0;
    el.src = track.url;
    el.preload = "auto";
    this.el = el;

    let started = false;
    const markStarted = () => {
      started = true;
      this.errorCount = 0;
      this.fadeTo({ set: (v) => { if (this.el) this.el.volume = v; }, get: () => this.el?.volume ?? 0 }, this.targetVol, 1600);
    };
    el.addEventListener("playing", markStarted, { once: true });
    el.addEventListener(
      "error",
      () => {
        this.errorCount++;
        if (this.el !== el) return;
        this.killEl();
        this.startSynth(id);
      },
      { once: true },
    );

    el.play().then(
      () => { if (!started) markStarted(); },
      () => {
        /* autoplay blocked — wait for next user gesture, handled by resume() */
      },
    );

    // safety net: nothing heard after a while → synth
    setTimeout(() => {
      if (this.el === el && !started && el.readyState === 0) {
        this.killEl();
        this.startSynth(id);
      }
    }, 6000);
  }

  private startSynth(id: AmbientTrackId) {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    void this.ctx.resume();
    this.out = this.ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(this.ctx.destination);
    this.synthHandle = SYNTHS[id](this.ctx, this.out);
    this.out.gain.linearRampToValueAtTime(this.targetVol, this.ctx.currentTime + 1.6);
  }

  /** call on any user gesture to resume after autoplay block */
  resume(): void {
    if (this.el) {
      const el = this.el;
      const vol = el.volume;
      el.play().catch(() => undefined);
      if (vol === 0) {
        this.fadeTo({ set: (v) => { if (this.el) this.el.volume = v; }, get: () => this.el?.volume ?? 0 }, this.targetVol, 1200);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
  }

  stop(ms = 600): void {
    const el = this.el;
    this.clearFade();
    if (el) {
      this.fadeTo({ set: (v) => { el.volume = v; }, get: () => el.volume }, 0, ms, () => {
        if (this.el === el) this.killEl();
        else { el.pause(); el.src = ""; }
      });
    }
    if (this.ctx && this.out) {
      const ctx = this.ctx;
      const handle = this.synthHandle;
      this.out.gain.linearRampToValueAtTime(0, this.ctx.currentTime + ms / 1000);
      setTimeout(() => {
        handle?.stop();
        try { void ctx.close(); } catch { /* noop */ }
      }, ms + 80);
      this.synthHandle = null;
      this.ctx = null;
      this.out = null;
    }
    this.currentId = null;
  }
}
