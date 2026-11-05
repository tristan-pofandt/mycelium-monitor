// Permits to work (feature 3, docs/demo-features-plan.md): hot-work, confined-space and isolation permits, each tied to its
// holders, a task and the restricted doors of its area. Seeded from their own rng so data.js's people and door events stay put.
// Times are milliseconds, so permits issued in the demo survive the trip through localStorage unchanged.
import { DOOR_EVENTS, PEOPLE, TODAY, fmtDay, qualified } from "./data.js";

function rng(seed) { // mulberry32, as in data.js
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261103);
const H = 3600e3;
const now = Date.now();

// A permit type's id is also the ticket (cert in data.js) a holder needs.
export const PERMIT_TYPES = [
  { id: "hotwork", name: "Hot work", ticket: "hot-work" },
  { id: "confined", name: "Confined space", ticket: "confined-space" },
  { id: "isolation", name: "Isolation", ticket: "isolation" },
];
export const typeName = (id) => PERMIT_TYPES.find((t) => t.id === id)?.name || id;

// Areas that take permits, per site. `door` is the restricted door into the area, if it has one.
export const AREAS = [ // type: the permit the area usually needs, the issue form's first guess
  { site: "ips", name: "Press line 2", door: "Press line 2 isolation cage", type: "isolation" }, { site: "ips", name: "Welding cell", type: "hotwork" },
  { site: "twb", name: "Foundry hot-work bay", door: "Foundry hot-work bay", type: "hotwork" }, { site: "twb", name: "Crane CR-04", type: "isolation" },
  { site: "acr", name: "Pre-treatment tank 2", door: "Tank 2 confined space", type: "confined" }, { site: "acr", name: "Brake test rig", type: "isolation" },
  { site: "tsv", name: "Overhaul bay 1", type: "isolation" },
];
export const restricted = (site, door) => AREAS.find((a) => a.site === site && a.door === door) || null;

// Tasks that need a permit: by words in the title, so tasks handed out in the demo get one too.
const NEEDS = [[/hydraulic|lockout|isolat|service crane/i, "isolation"], [/weld|hot work|grind|cutting/i, "hotwork"], [/tank|confined|\bpit\b/i, "confined"]];
export const needsPermit = (task) => NEEDS.find(([re]) => re.test(task.title))?.[1] || null;

// Why can't this person hold this permit until `until`? null when they can.
export function whyNot(p, type, until = TODAY) {
  const t = PERMIT_TYPES.find((x) => x.id === type);
  const s = (p.skills || []).find((x) => x.cert === type);
  if (qualified(p, type, new Date(until))) return null;
  if (!s) return `needs the ${t.ticket} ticket`;
  if (s.status === "training") return `still training for the ${t.ticket} ticket`;
  return `${t.ticket} ticket ${s.expires < TODAY ? "expired" : "expires"} ${fmtDay(s.expires)}`;
}
export const canHold = (p, type, until) => !whyNot(p, type, until);

// ── Seeded permits ──
const byCard = (id) => { const e = DOOR_EVENTS.find((d) => d.id === id); return PEOPLE.find((p) => p.card === e.card); };
const pool = (site, type, not = []) => PEOPLE.filter((p) => p.site === site && p.role === "employee" && p.status === "active" && canHold(p, type) && !not.includes(p.id));
const pickN = (list, k) => { const out = []; while (out.length < k && out.length < list.length) { const p = list[Math.floor(rand() * list.length)]; if (!out.includes(p.id)) out.push(p.id); } return out; };
const supOf = (site, i = 0) => PEOPLE.filter((p) => p.site === site && p.role === "supervisor")[i];
const maintSup = (site) => PEOPLE.find((p) => p.site === site && p.title === "Maintenance Supervisor");
const ipsSup = supOf("ips"); // the supervisor persona
const permit = (id, type, site, area, holders, issuer, from, hours, extra = {}) => {
  const a = AREAS.find((x) => x.site === site && x.name === area);
  return { id, type, site, area, doors: a.door ? [a.door] : [], holders, issuer: issuer.id, from: now + from * H, to: now + (from + hours) * H, task: null, status: "open", ...extra };
};

const press = byCard("dp1"), late = byCard("dp3");
export const PERMITS = [
  permit("PTW-1041", "isolation", "ips", "Press line 2", [press.id, ...pickN(pool("ips", "isolation", [press.id]), 1)], maintSup("ips"), -3, 9, { task: "t1" }),
  permit("PTW-1044", "hotwork", "ips", "Welding cell", pickN(pool("ips", "hotwork").filter((p) => p.manager === ipsSup.id), 2), ipsSup, -1, 4),
  permit("PTW-1036", "isolation", "ips", "Press line 2", pickN(pool("ips", "isolation", [press.id]), 2), maintSup("ips"), -27, 10,
    { task: "t1", status: "closed", closedAt: now - 18 * H }),
  permit("PTW-1038", "hotwork", "twb", "Foundry hot-work bay", [late.id, ...pickN(pool("twb", "hotwork", [late.id]), 1)], supOf("twb"), -30, 10), // expired yesterday
  permit("PTW-1042", "hotwork", "twb", "Foundry hot-work bay", pickN(pool("twb", "hotwork", [late.id]), 2), supOf("twb", 1), -2, 8),
  permit("PTW-1043", "confined", "acr", "Pre-treatment tank 2", pickN(pool("acr", "confined"), 2), supOf("acr"), -1.5, 6),
  permit("PTW-1040", "isolation", "tsv", "Overhaul bay 1", pickN(pool("tsv", "isolation"), 2), maintSup("tsv"), -4, 8),
];

// ── Rules ──
// When a permit stops counting: the end of its window, or when it was closed or revoked.
const endOf = (p) => Math.min(p.to, p.closedAt ?? Infinity);
// The status at a moment: open (live or starting later), closed, revoked, or expired once the window has passed.
export const statusAt = (p, at = Date.now()) => (p.status !== "open" ? p.status : p.to < +at ? "expired" : "open");
export const liveAt = (p, at = Date.now()) => p.from <= +at && +at <= endOf(p);

// Does this card hold a permit for this door at this moment? "valid", "expired" (they held one that has ended), "none",
// or null when the door isn't restricted. `door` is { site, door } (a door event will do).
export function permitFor(door, card, at = Date.now(), permits = PERMITS) {
  if (!restricted(door.site, door.door)) return null;
  const who = PEOPLE.find((p) => p.card === card);
  const theirs = permits.filter((p) => p.site === door.site && p.doors.includes(door.door) && who && p.holders.includes(who.id));
  if (theirs.some((p) => liveAt(p, at))) return "valid";
  return theirs.some((p) => endOf(p) < +at) ? "expired" : "none";
}

// Permits live at a site at a moment (site "all" or null for every site), for the roll call and the floor screens.
export const activePermits = (site, at = Date.now(), permits = PERMITS) => permits.filter((p) => (!site || site === "all" || p.site === site) && liveAt(p, at));

// The seeded permits plus the ones issued in the demo, with the demo's closes and revokes applied (store keys permits, permitEdits).
export const mergePermits = (issued = [], edits = {}) => [...PERMITS, ...issued].map((p) => ({ ...p, ...edits[p.id] }));
