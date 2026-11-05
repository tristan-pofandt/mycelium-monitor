// Weather and road alerts (docs/demo-features-plan.md, feature 9): a 3-day outlook and Bureau of Meteorology style warnings
// per place, QLDTraffic style road closures, and who may not make it in. All fictional: nothing here calls out.
// Commute risk uses home postcode (from HR) and consent only, never addresses. Mycelium only ever receives the postcode of
// someone who opted in; everyone else's is null by the time it leaves this module.
import { PEOPLE, PERSONAS, TODAY, dayOffset, fmtAgo } from "./data.js";
import { getState } from "./store.js";

function rng(seed) { // mulberry32, as in data.js; its own seed so data.js's sequence is untouched
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261109);

const HOUR = 3600e3;
const at = (day, h) => new Date(+dayOffset(day) + h * HOUR);
const ago = (h) => new Date(Date.now() - h * HOUR);

// ── 3-day outlook (today, tomorrow, the day after) ──
const o = (summary, min, max, rain) => ({ summary, min, max, rain, icon: rain > 30 ? "weather" : "sun" });
export const WEATHER = {
  ips: [o("Showers, heavy at times", 21, 29, 80), o("Heavy rain, possible storm", 20, 26, 90), o("Rain easing", 19, 27, 60)],
  twb: [o("Partly cloudy", 15, 27, 20), o("Severe storms likely in the afternoon", 16, 28, 70), o("A shower or two", 14, 24, 40)],
  acr: [o("Showers", 20, 29, 60), o("Rain, possible storm", 20, 27, 80), o("Clearing", 19, 28, 30)],
  tsv: [o("Sunny", 23, 31, 0), o("Mostly sunny", 23, 31, 5), o("Sunny", 22, 32, 0)],
  hq: [o("Showers", 21, 29, 60), o("Rain, possible storm", 21, 27, 80), o("Clearing", 20, 28, 30)],
};
export const dayLabel = (day) => (day === 0 ? "Today" : day === 1 ? "Tomorrow" : dayOffset(day).toLocaleDateString([], { weekday: "long" }));

// ── Warnings, Bureau of Meteorology style. postcodes: home areas where the warning itself makes the trip in risky. ──
export const LEVEL = { warning: { word: "Warning", icon: "down", badge: "badge-bad" }, watch: { word: "Watch", icon: "errors", badge: "badge-warn" } };
export const WARNINGS = [
  { id: "w-bremer", sites: ["ips"], level: "watch", kind: "Flood Watch", area: "Bremer River and Warrill Creek, Ipswich",
    detail: "Rain from tonight may cause minor flooding along the Bremer River from tomorrow morning. Low-lying roads may close.",
    issued: ago(3), from: ago(3), until: at(2, 18), postcodes: [] },
  { id: "w-storm", sites: ["twb"], level: "warning", kind: "Severe Thunderstorm Warning", area: "Toowoomba and the Lockyer Valley",
    detail: "Severe thunderstorms are likely tomorrow afternoon, with large hail, damaging winds and heavy rain that may cause flash flooding on the range.",
    issued: ago(1), from: at(1, 13), until: at(1, 19), postcodes: ["4343", "4344", "4352"] },
];

// ── Road closures, QLDTraffic style. postcodes and sites: people living there are cut off on the way to those sites. ──
export const ROAD_STATUS = {
  closed: { word: "Closed", icon: "stop", badge: "badge-bad" },
  likely: { word: "Closure likely", icon: "errors", badge: "badge-warn" },
  lane: { word: "Lane closed", icon: "down", badge: "badge-none" }, // delays only: never counts as cut off
};
export const ROADS = [
  { id: "r-warrego", road: "Warrego Hwy", at: "Gatton", cause: "Flooding", status: "closed", detail: "Closed in both directions at Lockyer Creek. No detour for heavy vehicles.",
    from: ago(5), until: null, postcodes: ["4341", "4343", "4344"], sites: ["ips", "twb"] },
  { id: "r-cunningham", road: "Cunningham Hwy", at: "Yamanto, Ipswich", cause: "Flooding", status: "likely", detail: "Expected to close at Warrill Creek if the Bremer River rises as forecast.",
    from: at(1, 5), until: at(2, 12), postcodes: ["4306"], sites: ["ips"] },
  { id: "r-karrabin", road: "Karrabin Rosewood Rd", at: "Walloon", cause: "Flooding", status: "closed", detail: "Water over the road at the creek crossing.",
    from: ago(2), until: at(1, 18), postcodes: ["4340"], sites: ["ips"] },
  { id: "r-logan", road: "Logan Mwy", at: "Kingston", cause: "Crash", status: "lane", detail: "One lane closed westbound. Expect delays.",
    from: ago(0.7), until: new Date(Date.now() + 3 * HOUR), postcodes: [], sites: ["acr"] },
];
export const roadName = (r) => `${r.road} at ${r.at}`;

// Is a warning or closure in force at any time on this day (0 = today)?
export const activeOn = (x, day) => x.from < dayOffset(day + 1) && (!x.until || x.until > dayOffset(day));
// Still relevant to show: not over, and starting within the 3-day outlook.
export const current = (x) => (!x.until || x.until > new Date()) && x.from < dayOffset(3);
export const forSites = (list, sites) => list.filter((x) => current(x) && x.sites.some((s) => sites.includes(s)));

// "5 h ago", "today 1:00 pm", "tomorrow 5:00 am", "Saturday 6:00 pm"
export function whenText(d) {
  if (d <= new Date()) return fmtAgo(d);
  const day = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - TODAY) / 864e5);
  return `${day <= 1 ? dayLabel(day).toLowerCase() : dayLabel(day)} ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}
export const spanText = (x) => `${x.from <= new Date() ? "Started" : "Starts"} ${whenText(x.from)}. ${x.until ? `Ends ${whenText(x.until)}` : "No end time given"}`;

// ── Home postcodes, as HR would hold them (fictional people; the postcodes are real Queensland areas) ──
const AREAS = {
  ips: [["4305", "Ipswich, Brassall, Yamanto", 4], ["4304", "Booval, Bundamba", 3], ["4300", "Springfield, Goodna", 3], ["4301", "Redbank Plains", 2],
    ["4306", "Karalee, Amberley, Walloon", 2], ["4340", "Rosewood", 1], ["4341", "Laidley", 1], ["4343", "Gatton", 1]],
  twb: [["4350", "Toowoomba", 8], ["4352", "Highfields, Hampton", 2], ["4343", "Gatton", 1], ["4344", "Helidon", 1]],
  acr: [["4110", "Acacia Ridge, Archerfield", 3], ["4109", "Sunnybank, Robertson", 2], ["4113", "Runcorn, Eight Mile Plains", 2], ["4114", "Woodridge, Kingston", 2],
    ["4300", "Springfield, Goodna", 1], ["4075", "Oxley, Corinda", 1]],
  tsv: [["4814", "Aitkenvale, Cranbrook", 3], ["4815", "Kirwan, Condon", 3], ["4810", "Townsville city", 1], ["4818", "Deeragun, Bohle Plains", 2]],
  hq: [["4000", "Brisbane city", 1], ["4101", "South Brisbane, West End", 2], ["4051", "Alderley, Newmarket", 1], ["4169", "Kangaroo Point", 1], ["4064", "Paddington, Milton", 1]],
};
export const postcodeArea = (pc) => Object.values(AREAS).flat().find(([code]) => code === pc)?.[1] || "";
const draw = (list) => {
  let r = rand() * list.reduce((n, a) => n + a[2], 0);
  return list.find((a) => (r -= a[2]) < 0)[0];
};
const HR = Object.fromEntries(PEOPLE.map((p) => [p.id, { postcode: draw(AREAS[p.site]), optIn: rand() < 0.7 }]));
// The seeded story: the Ipswich employee persona opted in and lives beyond the Cunningham Hwy at Warrill Creek.
HR[PERSONAS.find((p) => p.id === "employee").person] = { postcode: "4306", optIn: true };

// What Mycelium receives: consent from HR, overridden by each person's own switch (store `commuteOptOut`), and a postcode
// only where consent is given.
export function commuteMap(optOut = {}) {
  return Object.fromEntries(Object.entries(HR).map(([id, c]) => {
    const optIn = id in optOut ? !optOut[id] : c.optIn;
    return [id, { optIn, postcode: optIn ? c.postcode : null }];
  }));
}
export const COMMUTE = commuteMap();

// Who may not make it in on this day: opted-in people whose home postcode is cut off on the way to their site by a closure
// in force, or sits under a warning. Uses postcode and consent only. Returns one entry per person at risk.
export function commuteRisk(people, closures, warnings, day, commute = COMMUTE) {
  return people.flatMap((p) => {
    const c = commute[p.id];
    if (!c?.optIn || !c.postcode) return [];
    const roads = closures.filter((r) => r.status !== "lane" && r.postcodes.includes(c.postcode) && r.sites.includes(p.site) && activeOn(r, day));
    const warns = warnings.filter((w) => w.postcodes.includes(c.postcode) && activeOn(w, day));
    if (!roads.length && !warns.length) return [];
    return [{ id: p.id, site: p.site, shift: p.shift, postcode: c.postcode, roads, warnings: warns, severity: roads.some((r) => r.status === "closed") ? "high" : "medium" }];
  });
}
// "the Warrego Hwy closure", "the Severe Thunderstorm Warning"
export const causes = (risks) => [...new Set(risks.flatMap((r) => [...r.roads.map((x) => `the ${x.road} ${x.status === "likely" ? "closure (likely)" : "closure"}`), ...r.warnings.map((w) => `the ${w.kind}`)]))];
export const joinAnd = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

// For the roster planner's Problems list. day: days from today (0 today, 1 tomorrow); shift: "Day" | "Afternoon" | "Night",
// or omitted for all shifts. Reads each person's shift from data.js (shortcut: not the roster grid's edits; feed those in when
// roster.js exists).
export function rosterWeatherRisks(site, day, shift, optOut = getState().commuteOptOut || {}) {
  const people = PEOPLE.filter((p) => p.site === site && p.status === "active" && (!shift || p.shift === shift));
  const risk = commuteRisk(people, ROADS, WARNINGS, day, commuteMap(optOut));
  if (!risk.length) return [];
  const when = day === 0 ? "today" : day === 1 ? "tomorrow" : dayLabel(day);
  return [{
    text: `${risk.length} at risk on ${when}'s ${shift ? `${shift.toLowerCase()} ` : ""}shift: ${joinAnd(causes(risk))} may stop them getting in. Add backups.`,
    people: risk.map((r) => r.id),
    severity: risk.some((r) => r.severity === "high") ? "high" : "medium",
  }];
}
