// ─────────────────────────────────────────────────────────────────────────────
//  Dream Guardian · Audio Engine
//  Real voice-tone fingerprinting (pitch, spectral centroid, energy) with
//  Web Audio API + synthesized alarm tones + vibration helpers.
// ─────────────────────────────────────────────────────────────────────────────

import type { AlarmId } from "../i18n";

export interface FrameData {
  t: number; // performance.now()
  rms: number; // 0..1 energy
  pitch: number; // Hz, -1 when unclear
  centroid: number; // Hz spectral brightness
}

export interface VoiceFingerprint {
  kind: "sentence" | "hum";
  pitchMedian: number;
  pitchLow: number;
  pitchHigh: number;
  centroidMedian: number;
  rmsMedian: number;
  durationSec: number;
  voicedRatio: number;
  pitchCoverage: number;
  stability: number; // 0..1
  createdAt: number;
}

// ─── math helpers ────────────────────────────────────────────────────────────

export function median(a: number[]): number {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function percentile(a: number[], p: number): number {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.max(0, Math.round((p / 100) * (s.length - 1))))];
}

// ─── pitch detection (autocorrelation) ───────────────────────────────────────

function computeRms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

function autoCorrelate(buf: Float32Array, sampleRate: number, rms: number): number {
  if (rms < 0.012) return -1;
  let size = buf.length;
  let r1 = 0;
  let r2 = size - 1;
  const thres = 0.2;
  for (let i = 0; i < size / 2; i++) if (Math.abs(buf[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < size / 2; i++) if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }
  const sliced = buf.slice(r1, r2);
  size = sliced.length;
  if (size < 64) return -1;

  const c = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    let acc = 0;
    for (let j = 0; j < size - i; j++) acc += sliced[j] * sliced[j + i];
    c[i] = acc;
  }
  let d = 0;
  while (d < size - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < size; i++) {
    if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  }
  if (maxpos <= 0) return -1;
  // correlation strength check
  if (c[0] > 0 && maxval / c[0] < 0.35) return 0; // detected but weak/aperiodic
  let T0 = maxpos;
  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);
  const freq = sampleRate / T0;
  if (freq < 50 || freq > 600) return -1;
  return freq;
}

function computeCentroid(freqBuf: Uint8Array, sampleRate: number, fftSize: number): number {
  const binHz = sampleRate / fftSize;
  let num = 0;
  let den = 0;
  const start = Math.max(1, Math.floor(60 / binHz));
  const end = Math.min(freqBuf.length - 1, Math.ceil(5000 / binHz));
  for (let i = start; i <= end; i++) {
    const m = freqBuf[i] / 255;
    num += i * binHz * m;
    den += m;
  }
  return den > 0.001 ? num / den : 0;
}

// ─── live microphone session ─────────────────────────────────────────────────

export class VoiceSession {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private timeBuf: Float32Array<ArrayBuffer> = new Float32Array(0);
  private freqBuf: Uint8Array<ArrayBuffer> = new Uint8Array(0);
  private smoothLevel = 0;

  async start(): Promise<void> {
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: true },
    });
    this.ctx = new AC();
    await this.ctx.resume();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.4;
    src.connect(this.analyser);
    this.timeBuf = new Float32Array(this.analyser.fftSize);
    this.freqBuf = new Uint8Array(this.analyser.frequencyBinCount);
  }

  sample(): FrameData {
    const a = this.analyser;
    if (!a || !this.ctx) return { t: performance.now(), rms: 0, pitch: -1, centroid: 0 };
    a.getFloatTimeDomainData(this.timeBuf);
    a.getByteFrequencyData(this.freqBuf);
    const rms = computeRms(this.timeBuf);
    this.smoothLevel = this.smoothLevel * 0.6 + rms * 0.4;
    const pitch = autoCorrelate(this.timeBuf, this.ctx.sampleRate, rms);
    const centroid = computeCentroid(this.freqBuf, this.ctx.sampleRate, a.fftSize);
    return { t: performance.now(), rms, pitch, centroid };
  }

  level(): number {
    return Math.min(1, this.smoothLevel * 6);
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach((t) => t.stop());
    try {
      await this.ctx?.close();
    } catch {
      /* noop */
    }
    this.stream = null;
    this.ctx = null;
    this.analyser = null;
    this.smoothLevel = 0;
  }
}

// ─── fingerprint building & validation ───────────────────────────────────────

export function buildFingerprint(frames: FrameData[], kind: "sentence" | "hum", intervalMs: number): VoiceFingerprint {
  const allRms = frames.map((f) => f.rms);
  const floor = Math.max(0.012, median(allRms) * 0.45);
  const voiced = frames.filter((f) => f.rms >= floor);
  const pitched = voiced.filter((f) => f.pitch > 0);
  const pitches = pitched.map((f) => f.pitch);
  const pitchMedian = median(pitches) || 0;
  const mad = median(pitches.map((p) => Math.abs(p - pitchMedian)));
  const stability = pitchMedian > 0 ? Math.max(0, Math.min(1, 1 - mad / (pitchMedian * 0.22))) : 0;

  return {
    kind,
    pitchMedian,
    pitchLow: Math.max(50, Math.min(percentile(pitches, 10) || pitchMedian * 0.8, pitchMedian)) || 0,
    pitchHigh: Math.min(600, Math.max(percentile(pitches, 90) || pitchMedian * 1.2, pitchMedian)) || 0,
    centroidMedian: median(voiced.map((f) => f.centroid)) || 0,
    rmsMedian: median(voiced.map((f) => f.rms)) || 0,
    durationSec: (frames.length * intervalMs) / 1000,
    voicedRatio: frames.length ? voiced.length / frames.length : 0,
    pitchCoverage: voiced.length ? pitched.length / voiced.length : 0,
    stability,
    createdAt: Date.now(),
  };
}

export type InvalidReason = "short" | "quiet" | "pitch" | "unstable";

export function validateFingerprint(fp: VoiceFingerprint): { ok: boolean; reason?: InvalidReason } {
  const minDur = fp.kind === "sentence" ? 1.2 : 0.8;
  if (fp.durationSec < minDur) return { ok: false, reason: "short" };
  if (fp.rmsMedian < 0.012 || fp.voicedRatio < 0.22) return { ok: false, reason: "quiet" };
  if (fp.pitchCoverage < (fp.kind === "sentence" ? 0.18 : 0.35)) return { ok: false, reason: "pitch" };
  if (fp.kind === "hum" && fp.stability < 0.3) return { ok: false, reason: "unstable" };
  return { ok: true };
}

// ─── live matching (nightmare voice vs. saved tone) ──────────────────────────

export function frameMatchScore(f: FrameData, fps: VoiceFingerprint[], minRms: number): number {
  if (f.rms < minRms) return 0;
  let best = 0;
  for (const fp of fps) {
    if (!fp.pitchMedian) continue;
    let s = 0;
    if (f.pitch > 0) {
      const lo = fp.pitchMedian * 0.55;
      const hi = fp.pitchMedian * 1.85;
      if (f.pitch >= lo && f.pitch <= hi) s += 0.75;
      else if (f.pitch >= fp.pitchLow * 0.7 && f.pitch <= fp.pitchHigh * 1.5) s += 0.45;
    }
    if (fp.centroidMedian > 0 && f.centroid >= fp.centroidMedian * 0.35 && f.centroid <= fp.centroidMedian * 2.8) s += 0.25;
    best = Math.max(best, s);
  }
  return best;
}

// ─── synthesized alarm player ────────────────────────────────────────────────

interface AlarmNote {
  f: number; // Hz
  d: number; // seconds
  type?: OscillatorType;
  vol?: number; // 0..1
  f2?: number; // companion frequency (bell shimmer)
  sweep?: number; // glide target Hz
}

const PRESETS: Record<AlarmId, AlarmNote[]> = {
  dawn: [
    { f: 659, d: 0.15, type: "triangle", vol: 0.6 },
    { f: 880, d: 0.15, type: "triangle", vol: 0.6 },
    { f: 1046, d: 0.15, type: "triangle", vol: 0.65 },
    { f: 1318, d: 0.3, type: "triangle", vol: 0.7 },
    { f: 1046, d: 0.15, type: "triangle", vol: 0.6 },
    { f: 880, d: 0.3, type: "triangle", vol: 0.65 },
  ],
  bell: [
    { f: 988, f2: 2489, d: 0.4, type: "sine", vol: 0.9 },
    { f: 784, f2: 1976, d: 0.4, type: "sine", vol: 0.9 },
    { f: 988, f2: 2489, d: 0.4, type: "sine", vol: 0.9 },
    { f: 659, f2: 1661, d: 0.5, type: "sine", vol: 0.95 },
  ],
  pulse: [
    { f: 1175, d: 0.09, type: "square", vol: 0.28 },
    { f: 1175, d: 0.09, type: "square", vol: 0 },
    { f: 1175, d: 0.09, type: "square", vol: 0.28 },
    { f: 1175, d: 0.09, type: "square", vol: 0 },
    { f: 1175, d: 0.09, type: "square", vol: 0.28 },
    { f: 1175, d: 0.09, type: "square", vol: 0 },
    { f: 1175, d: 0.09, type: "square", vol: 0.28 },
    { f: 1175, d: 0.32, type: "square", vol: 0 },
  ],
  moon: [
    { f: 440, d: 0.22, type: "triangle", vol: 0.55 },
    { f: 523, d: 0.22, type: "triangle", vol: 0.55 },
    { f: 659, d: 0.22, type: "triangle", vol: 0.6 },
    { f: 880, d: 0.35, type: "triangle", vol: 0.65 },
    { f: 659, d: 0.22, type: "triangle", vol: 0.55 },
    { f: 587, d: 0.22, type: "triangle", vol: 0.55 },
    { f: 523, d: 0.4, type: "triangle", vol: 0.6 },
  ],
  meteor: [
    { f: 350, sweep: 1500, d: 0.4, type: "sawtooth", vol: 0.3 },
    { f: 1500, sweep: 600, d: 0.22, type: "sawtooth", vol: 0.3 },
    { f: 500, sweep: 1800, d: 0.36, type: "sawtooth", vol: 0.32 },
    { f: 1800, d: 0.2, type: "sawtooth", vol: 0 },
  ],
};

export interface AlarmPlayOptions {
  volume?: number; // final volume 0..1 (default 1)
  riseSec?: number; // seconds to climb from near-silence to final volume (0 = instant)
}

export class AlarmSynth {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTime = 0;
  private idx = 0;
  private activePreset: AlarmId = "dawn";

  start(preset: AlarmId, opts: AlarmPlayOptions = {}): void {
    this.stop();
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    void this.ctx.resume();
    this.out = this.ctx.createGain();
    const target = opts.volume ?? 1;
    const rise = opts.riseSec ?? 0;
    const now = this.ctx.currentTime;
    if (rise > 0) {
      this.out.gain.setValueAtTime(0.03, now);
      this.out.gain.linearRampToValueAtTime(target, now + rise);
    } else {
      this.out.gain.setValueAtTime(target, now);
    }
    this.out.connect(this.ctx.destination);
    this.activePreset = preset;
    this.idx = 0;
    this.nextTime = now + 0.05;
    this.timer = setInterval(() => this.tick(), 120);
    this.tick();
  }

  private tick(): void {
    if (!this.ctx) return;
    const seq = PRESETS[this.activePreset];
    while (this.nextTime < this.ctx.currentTime + 0.45) {
      const note = seq[this.idx % seq.length];
      this.playNote(note, this.nextTime);
      this.nextTime += note.d;
      this.idx++;
    }
  }

  private playNote(n: AlarmNote, t: number): void {
    if (!this.ctx || !this.out) return;
    const vol = n.vol ?? 0.5;
    if (vol <= 0) return; // rest
    const make = (freq: number, gainMul: number) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = n.type ?? "sine";
      o.frequency.setValueAtTime(freq, t);
      if (n.sweep) o.frequency.exponentialRampToValueAtTime(Math.max(40, n.sweep), t + n.d * 0.92);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol * gainMul, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n.d * (n.f2 ? 1 : 0.92));
      o.connect(g);
      g.connect(this.out!);
      o.start(t);
      o.stop(t + n.d + 0.08);
    };
    make(n.f, 1);
    if (n.f2) make(n.f2, 0.35);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    try {
      void this.ctx?.close();
    } catch {
      /* noop */
    }
    this.ctx = null;
    this.out = null;
  }
}

// ─── custom alarm file player ────────────────────────────────────────────────

export class FileAlarmPlayer {
  private el: HTMLAudioElement | null = null;
  private riseTimer: ReturnType<typeof setInterval> | null = null;

  start(src: string, opts: AlarmPlayOptions = {}): void {
    this.stop();
    const el = new Audio(src);
    this.el = el;
    el.loop = true;
    const target = opts.volume ?? 1;
    const rise = opts.riseSec ?? 0;
    if (rise > 0) {
      el.volume = 0.05;
      const steps = Math.ceil((rise * 1000) / 250);
      let i = 0;
      this.riseTimer = setInterval(() => {
        i++;
        el.volume = Math.min(target, 0.05 + ((target - 0.05) * i) / steps);
        if (i >= steps && this.riseTimer) {
          clearInterval(this.riseTimer);
          this.riseTimer = null;
        }
      }, 250);
    } else {
      el.volume = target;
    }
    void el.play().catch(() => undefined);
  }

  stop(): void {
    if (this.riseTimer) clearInterval(this.riseTimer);
    this.riseTimer = null;
    if (this.el) {
      this.el.pause();
      this.el.src = "";
    }
    this.el = null;
  }
}

// ─── unified alarm controller ────────────────────────────────────────────────

export class AlarmController {
  private synth = new AlarmSynth();
  private file = new FileAlarmPlayer();

  start(alarmId: string, customDataUrl?: string | null, opts: AlarmPlayOptions = {}): void {
    if (alarmId.startsWith("custom:") && customDataUrl) {
      this.synth.stop();
      this.file.start(customDataUrl, opts);
      return;
    }
    this.file.stop();
    const preset: AlarmId = ["dawn", "bell", "pulse", "moon", "meteor"].includes(alarmId)
      ? (alarmId as AlarmId)
      : "dawn";
    this.synth.start(preset, opts);
  }

  stop(): void {
    this.synth.stop();
    this.file.stop();
  }
}

// ─── vibration helpers ───────────────────────────────────────────────────────

export function vibrateSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function tapHaptic(): void {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* noop */
  }
}
