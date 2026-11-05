// Floor screens (feature 11, docs/demo-features-plan.md): the screens TV mode rotates through and the pure rules behind them.
// Named screens.js, not tv.js: the demo's Vite root would serve a module named like the /tv route.
// Everything here is safe for a screen anyone walking past can read: counts, states and dates, never names, cards or doors.
import { SITES, TODAY } from "./data.js";

function rng(seed) { // mulberry32, as in data.js; its own seed so data.js's sequence stays put
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261111);
const D = 864e5, H = 3600e3;

export const ROTATE_MS = 15000; // each screen shows for 15 s
export const SCREENS = [
  { id: "safety", label: "Days since the last recordable incident" },
  { id: "output", label: "Today's output against target" },
  { id: "coverage", label: "This shift's coverage" },
  { id: "machines", label: "Machine states" },
  { id: "weather", label: "Weather and roads" },
  { id: "permits", label: "Permits active now, by area" },
  { id: "announcement", label: "Announcement", hint: "Shows only when there's one to show." },
];

// Where each site gathers in an evacuation (fictional).
export const ASSEMBLY = { acr: ["A", "the Gate 1 car park"], ips: ["B", "the front car park"], twb: ["A", "the staff car park"], tsv: ["A", "the yard gate"] };

// The last recordable incident per site: inside the last 30 days when SITES counts one there, otherwise 31 to 180 days ago.
export const LAST_INCIDENT = Object.fromEntries(SITES.map((s) => {
  const r = rand();
  return [s.id, TODAY.getTime() - (s.kpi.incidents ? 1 + Math.floor(r * 28) : 31 + Math.floor(r * 150)) * D];
}));
export const daysSinceIncident = (site, today = TODAY) => Math.round((+today - LAST_INCIDENT[site]) / D);

// The plan each site works to (units a day), and today's pace against it.
export const TARGET = { acr: 410, ips: 520, twb: 300, tsv: 60 };
const PACE = Object.fromEntries(SITES.map((s) => [s.id, 0.86 + rand() * 0.18]));

// Output so far today: { units, due (the target pro rata by now), target (the full day) }. The production day runs from 6:00.
// shortcut: before 6:00 it reads 0 rather than the night shift's share of yesterday; fine for a demo screen.
export function outputToday(site, at = Date.now()) {
  const f = Math.min(1, Math.max(0, (at - TODAY.getTime() - 6 * H) / (24 * H)));
  const due = Math.round(TARGET[site] * f);
  return { units: Math.round(due * PACE[site]), due, target: TARGET[site] };
}

// The screens to rotate through, in order, from store `tv` ({ announcement, screens }). No ticks means all of them; the
// announcement only shows when there is one.
export function screenOrder(settings = {}) {
  const on = settings?.screens?.length ? settings.screens : SCREENS.map((s) => s.id);
  return SCREENS.map((s) => s.id).filter((id) => on.includes(id) && (id !== "announcement" || !!settings?.announcement?.trim()));
}

// The next screen, wrapping both ways: step 1 forward, -1 back.
export const nextIndex = (i, n, step = 1) => (n ? (((i + step) % n) + n) % n : 0);

// Live permits as counts per area and type: [{ area, type, n }], sorted by area. Holders are never listed.
export function permitCounts(permits) {
  const out = new Map();
  for (const p of permits) {
    const key = `${p.area}|${p.type}`;
    out.set(key, { area: p.area, type: p.type, n: (out.get(key)?.n || 0) + 1 });
  }
  return [...out.values()].sort((a, b) => a.area.localeCompare(b.area) || a.type.localeCompare(b.type));
}
