// ─────────────────────────────────────────────────────────────────────────────
//  Sleep journal: types, helpers, pattern mining, and calendar (ICS) export.
// ─────────────────────────────────────────────────────────────────────────────

export interface DreamEvent {
  t: number; // epoch ms
  note: string; // possible cause written by the user
}

export interface SleepDay {
  sleepMinutes: number;
  events: DreamEvent[];
}

export type SleepLog = Record<string, SleepDay>; // key: YYYY-MM-DD (local)

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export interface JournalStats {
  nightsLogged: number;
  totalEvents: number;
  totalSleepMinutes: number;
  avgSleepMinutes: number;
  calmStreak: number;
  monthlyEvents: number[]; // 12 Persian months
  weeklyEvents: number[]; // 7 (Sat..Fri)
  topCauses: string[];
}

const STOP_WORDS = new Set([
  "و", "یا", "که", "در", "از", "به", "با", "برای", "این", "آن", "من", "او", "یک",
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "my", "i", "was", "too", "very",
]);

export function computeStats(log: SleepLog): JournalStats {
  const keys = Object.keys(log).sort();
  let totalEvents = 0;
  let totalSleep = 0;
  let sleepNights = 0;
  const monthly = new Array(12).fill(0);
  const weekly = new Array(7).fill(0);
  const causeCount = new Map<string, number>();

  for (const k of keys) {
    const day = log[k];
    const evCount = day.events.length;
    totalEvents += evCount;
    if (day.sleepMinutes > 0) {
      totalSleep += day.sleepMinutes;
      sleepNights++;
    }
    const d = keyToDate(k);
    // persian month 0..11
    try {
      const fmt = new Intl.DateTimeFormat("en-US-u-ca-persian", { month: "numeric" });
      const pm = Math.min(11, Math.max(0, parseInt(fmt.format(d), 10) - 1));
      monthly[pm] += evCount;
    } catch {
      /* noop */
    }
    const jsDay = d.getDay(); // 0 Sun .. 6 Sat → persian index: Sat=0
    weekly[(jsDay + 1) % 7] += evCount;
    for (const ev of day.events) {
      for (const raw of ev.note.split(/[\s،,؛;.؟?!]+/)) {
        const w = raw.trim().toLowerCase();
        if (w.length > 2 && !STOP_WORDS.has(w)) causeCount.set(w, (causeCount.get(w) ?? 0) + 1);
      }
    }
  }

  // calm streak: consecutive days without events ending today
  let streak = 0;
  const cursor = new Date();
  // only count once the first recorded day exists
  for (let i = 0; i < 370; i++) {
    const k = dateKey(cursor);
    const day = log[k];
    if (!day) {
      if (i === 0) {
        // today not logged yet — keep looking backwards without breaking
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    if (day.events.length > 0) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const topCauses = [...causeCount.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);

  return {
    nightsLogged: keys.filter((k) => log[k].sleepMinutes > 0 || log[k].events.length > 0).length,
    totalEvents,
    totalSleepMinutes: totalSleep,
    avgSleepMinutes: sleepNights ? Math.round(totalSleep / sleepNights) : 0,
    calmStreak: streak,
    monthlyEvents: monthly,
    weeklyEvents: weekly,
    topCauses,
  };
}

// ─── ICS export (moves nightmare events into the device calendar) ────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function icsStamp(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export function exportEventsICS(log: SleepLog, title: string): void {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//DreamGuardian//SleepJournal//FA",
    "CALSCALE:GREGORIAN",
  ];
  for (const k of Object.keys(log).sort()) {
    log[k].events.forEach((ev, i) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${k}-${i}@dreamguardian`,
        `DTSTAMP:${icsStamp(ev.t)}`,
        `DTSTART:${icsStamp(ev.t)}`,
        `DURATION:PT5M`,
        `SUMMARY:${title}`,
        ev.note ? `DESCRIPTION:${ev.note.replace(/\n/g, " ")}` : "DESCRIPTION:",
        "END:VEVENT",
      );
    });
  }
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dream-guardian-events.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
