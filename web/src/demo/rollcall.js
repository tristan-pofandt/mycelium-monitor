// Emergency roll call (feature 5, docs/demo-features-plan.md): who to account for at a site, reconciled from the door stream
// (plans.js EVENTS, the same reads the site map counts), visitor sign-ins, live permits to work and today's roster.
// Named rollcall.js, not emergency.js: the demo's Vite root would serve a module named like the /emergency route.
//
// The door stream carries counts, never names (plans.js). Here each counted card read is given to someone expected on site
// at that moment (office staff in office hours first, then the rostered shift, in a fixed seeded order), so the roll call's
// headcount matches the map's. Expected people left over are "rostered, no badge-in": probably absent, listed, not counted.
//
// Store keys (store.js): rollcall = { site, mode: "drill", startedAt, ticks: { id: "safe" | "missing" }, by } while one runs,
// null otherwise; rollcalls = [report], newest first, report = { site, mode, startedAt, endedAt, total, missing: [ids], by }.
// TV mode (feature 11) reads store `rollcall` to take over a site's floor screens: show rollCall(...).counts only, no names.
import { PEOPLE, PLACES, TODAY, VISITORS, person } from "./data.js";
import { EVENTS, PLANS, zoneCounts } from "./plans.js";
import { SHIFT_TIMES, TODAY_INDEX, shiftFor } from "./roster.js";
import { activePermits, mergePermits, typeName } from "./permits.js";
import { getState } from "./store.js";

function rng(seed) { // mulberry32, as in data.js; seeded per person so the order never depends on who else exists
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rank = (id) => rng(20261105 + Number(id.replace(/\D/g, "")))();
const H = 3600e3, M = 60e3;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const visitorId = (v) => `v-${slug(v.name)}`;
const OFFICE_ZONES = ["office", "lobby", "level3"];

// Sites a persona may run (and warden) a roll call at: their own site for site staff, any site for the all-sites roles.
export const rollCallSites = (persona) => (["gm", "security", "it", "hr"].includes(persona.id) ? PLACES.map((p) => p.id) : [person(persona.person)?.site].filter(Boolean));

// The shift on at `at` and the roster day it belongs to (a night shift before 6:00 started the day before).
export function shiftAt(at) {
  const h = (at - TODAY.getTime()) / H;
  if (h < SHIFT_TIMES.Day[0]) return { shift: "Night", day: TODAY_INDEX - 1, start: TODAY.getTime() + (SHIFT_TIMES.Night[0] - 24) * H };
  const shift = Object.keys(SHIFT_TIMES).find((s) => h >= SHIFT_TIMES[s][0] && h < SHIFT_TIMES[s][1]) || "Night";
  return { shift, day: TODAY_INDEX, start: TODAY.getTime() + SHIFT_TIMES[shift][0] * H };
}
const officeHours = (at) => { const d = new Date(at); const h = d.getHours() + d.getMinutes() / 60; return d.getDay() % 6 !== 0 && h >= 8 && h < 17; };

// Who to account for at `site` at time `at`. ticks: the roll call's marks; state: the demo store (roster edits, leave, permits).
// Returns { site, at, onSite, visitors, contractors, everyone, rosteredNoBadge, counts }:
//   onSite           staff badged in: { id, kind: "person", name, detail, zone, zoneName, since, permit?, tick? }
//   visitors         signed in and not out: same shape, kind "visitor"
//   contractors      permit holders on site: a subset of onSite (their last zone is the permit's area), never counted again
//   everyone         onSite then visitors: the list wardens tick
//   rosteredNoBadge  { id, name, shift }: expected on shift, no card read; probably absent, not in the counts
//   counts           { onSite (people + visitors), people, visitors, contractors, safe, missing (marked not found), notYet, noBadge }
export function rollCall(site, at = Date.now(), { ticks = {}, state = getState() } = {}) {
  const plan = PLANS[site];
  const zoneName = (id) => plan.zones.find((z) => z.id === id)?.name || "Unknown area";
  const now = shiftAt(at);
  const office = officeHours(at);
  const staff = PEOPLE.filter((p) => p.site === site && p.status === "active");
  const expected = [];
  for (const p of staff) {
    const s = shiftFor(p.id, now.day, state);
    if (s === null) { if (office) expected.push({ p, shift: "Office", start: new Date(at).setHours(8, 0, 0, 0), first: 0 }); }
    else if (s === now.shift) expected.push({ p, shift: s, start: now.start, first: 1 });
  }
  expected.sort((a, b) => a.first - b.first || rank(a.p.id) - rank(b.p.id));

  // Card reads: one seat per person counted in each zone at `at`, office zones first so office staff sit there.
  const seats = Object.entries(zoneCounts(EVENTS[site] || [], plan, at))
    .sort(([a], [b]) => OFFICE_ZONES.includes(b) - OFFICE_ZONES.includes(a))
    .flatMap(([z, n]) => Array(Math.max(0, n)).fill(z));
  const badged = expected.slice(0, seats.length);
  const onSite = badged.map(({ p, start }, i) => ({
    id: p.id, kind: "person", name: p.name, detail: p.title, zone: seats[i], zoneName: zoneName(seats[i]), since: start - Math.round((5 + rank(p.id) * 25) * M),
  }));

  // Permit holders work in the permit's area; one not matched to a card read is still on site under the permit.
  const permits = mergePermits(state.permits, state.permitEdits);
  const contractors = [];
  for (const pt of activePermits(site, at, permits)) {
    const zone = plan.doors.find((d) => pt.doors.includes(d.name))?.to || null;
    for (const id of pt.holders) {
      let e = onSite.find((x) => x.id === id);
      const p = person(id);
      if (!p || p.status !== "active" || contractors.includes(e)) continue;
      if (!e) { e = { id, kind: "person", name: p.name, detail: p.title, zone: null, since: pt.from }; onSite.push(e); }
      // an area with no reader of its own (a welding cell) has no zone on the plan: listed under the area, not on the map
      [e.zone, e.zoneName] = zone ? [zone, zoneName(zone)] : [null, `${pt.area} (permit area, no door reader)`];
      e.permit = pt.id; e.detail = `${p.title}, on ${typeName(pt.type).toLowerCase()} permit ${pt.id}`;
      contractors.push(e);
    }
  }
  const here = new Set(onSite.map((e) => e.id));
  const rosteredNoBadge = expected.filter(({ p }) => !here.has(p.id)).map(({ p, shift }) => ({ id: p.id, name: p.name, shift }));

  const reception = plan.zones.find((z) => OFFICE_ZONES.includes(z.id))?.id || plan.zones[0].id;
  const visitors = VISITORS.filter((v) => v.site === site && +v.since <= at).map((v) => ({
    id: visitorId(v), kind: "visitor", name: v.name, detail: `Visitor, ${v.company}, host ${person(v.host)?.name || "unknown"}`, zone: reception, zoneName: zoneName(reception), since: +v.since,
  }));
  const everyone = [...onSite, ...visitors];
  everyone.forEach((e) => { if (ticks[e.id]) e.tick = ticks[e.id]; });
  const safe = everyone.filter((e) => e.tick === "safe").length;
  return {
    site, at, onSite, visitors, contractors, everyone, rosteredNoBadge,
    counts: { onSite: everyone.length, people: onSite.length, visitors: visitors.length, contractors: contractors.length, safe,
      missing: everyone.filter((e) => e.tick === "missing").length, notYet: everyone.length - safe, noBadge: rosteredNoBadge.length },
  };
}

// People not yet found per zone, at their last door read, for <SiteMap mode="rollcall" counts>. Every counted zone is present.
export function zoneTally(result) {
  const out = Object.fromEntries(PLANS[result.site].zones.filter((z) => z.counted).map((z) => [z.id, 0]));
  for (const e of result.everyone) if (e.tick !== "safe" && e.zone) out[e.zone] = (out[e.zone] || 0) + 1;
  return out;
}

// A person's or visitor's name from a report id.
export const nameOf = (id) => person(id)?.name || VISITORS.find((v) => visitorId(v) === id)?.name || "Someone";

// The finished report for the running roll call.
export const reportOf = (rc, endedAt = Date.now(), result = rollCall(rc.site, rc.startedAt, { ticks: rc.ticks })) => ({
  site: rc.site, mode: rc.mode, startedAt: rc.startedAt, endedAt, total: result.counts.onSite, missing: result.everyone.filter((e) => e.tick !== "safe").map((e) => e.id), by: rc.by,
});

// Two earlier drills so the page and Home have a history before anyone runs one. Fixed, fictional.
const drill = (site, daysAgo, hour, mins, total, missingIdx) => {
  const startedAt = TODAY.getTime() - daysAgo * 24 * H + hour * H;
  const pool = PEOPLE.filter((p) => p.site === site && p.role === "employee" && p.status === "active");
  return { site, mode: "drill", startedAt, endedAt: startedAt + mins * M, total, missing: missingIdx.map((i) => pool[i].id), by: "Site Manager", seeded: true };
};
export const PAST_ROLLCALLS = [drill("ips", 41, 10.5, 11, 68, [7]), drill("acr", 68, 14.25, 14, 91, [])];
