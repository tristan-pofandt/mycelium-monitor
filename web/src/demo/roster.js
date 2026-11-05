// Rosters and skills (docs/demo-features-plan.md, features 1 and 2): a two-week roster per shift team, the rules a draft is
// checked against, and the machine-ticket gaps. Generated from its own seed (20261102) so data.js's sequence never moves.
// Day index 0 is this week's Monday (WEEK_START); 0..6 is this week, 7..13 next week.
import { useMemo } from "react";
import { APPROVALS, MACHINES, PEOPLE, SITES, TODAY, WEEK_START, certName, fmtDay, qualified, reportsOf, siteName } from "./data.js";
import { getState, useDemo } from "./store.js";

function rng(seed) { // mulberry32, as in data.js
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261102);

export const DAYS = 14;
export const dayDate = (i) => new Date(WEEK_START.getFullYear(), WEEK_START.getMonth(), WEEK_START.getDate() + i);
export const dayLabel = (i) => fmtDay(dayDate(i));
export const TODAY_INDEX = Math.round((TODAY - WEEK_START) / 864e5);
// Shift start and end in hours from midnight of the shift's day (a night shift ends at 6:00 the next morning).
export const SHIFT_TIMES = { Day: [6, 14], Afternoon: [14, 22], Night: [22, 30] };
export const isWork = (s) => Object.hasOwn(SHIFT_TIMES, s || "");
export const RULES = { rest: 10, weekCap: 48, hours: 8, from: TODAY_INDEX };
export const cellKey = (id, day) => `${id}|${day}`;

const BY_ID = new Map(PEOPLE.map((p) => [p.id, p]));

// Shift teams: each supervisor at a site with their active reports. need = people the team needs on shift each day.
export const TEAMS = PEOPLE.filter((p) => p.role === "supervisor" && p.status === "active" && p.site !== "hq").map((lead) => {
  const members = [lead, ...reportsOf(lead.id).filter((p) => p.status === "active")];
  return { id: lead.id, site: lead.site, shift: lead.shift, lead, members, need: Math.floor((members.length * 5) / 7) };
});
const TEAM_OF = new Map(TEAMS.flatMap((t) => t.members.map((m) => [m.id, t])));
export const teamOf = (id) => TEAM_OF.get(id);
export const teamName = (t) => `${t.shift} shift, ${t.lead.name}'s team`;
export const siteShifts = (site) => Object.keys(SHIFT_TIMES).filter((s) => TEAMS.some((t) => t.site === site && t.shift === s));

// The base roster: five on, two off, the days off staggered through each team so every day is staffed.
const BASE = {};
TEAMS.forEach((t) => t.members.forEach((p, i) => { BASE[p.id] = Array.from({ length: DAYS }, (_, d) => ([5, 6].includes((d + i) % 7) ? "Off" : t.shift)); }));
// Toowoomba's coming week isn't finished: shifts nobody has been put on yet, until the next 7 days are 86% covered (the figure
// Sites and Home show). Days run from tomorrow, so the gap is always ahead of the viewer.
{
  const teams = TEAMS.filter((t) => t.site === "twb");
  const twb = teams.flatMap((t) => t.members.slice(1).map((p) => p.id));
  const last = Math.min(TODAY_INDEX + 7, DAYS - 1);
  while (coveragePercent(BASE, teams, TODAY_INDEX, Math.min(TODAY_INDEX + 6, DAYS - 1)) > 86) {
    const id = twb[Math.floor(rand() * twb.length)], d = TODAY_INDEX + 1 + Math.floor(rand() * (last - TODAY_INDEX));
    if (BASE[id][d] !== "Off") BASE[id][d] = "Off";
  }
}
export const ROSTER = BASE;

// Approved leave, as day indexes per person. The seeded requests say when in words; requests made in the demo say "next Friday".
const LEAVE_DAYS = { a2: [7, 8, 9, 10, 11, 12, 13], a3: [3] };
export function leaveFrom(approvals = {}, requests = []) {
  const out = {};
  for (const a of [...APPROVALS, ...requests]) {
    if (a.kind !== "Leave" || approvals[a.id] !== "Approved") continue;
    (out[a.from] ||= []).push(...(a.days || LEAVE_DAYS[a.id] || (/next Friday/i.test(a.title) ? [11] : [])));
  }
  return out;
}

// The roster as planned: base, then approved leave, then the planner's edits ({ "personId|day": shift }).
export function rosterWith(edits = {}, leave = {}) {
  const out = {};
  for (const [id, days] of Object.entries(BASE)) out[id] = days.map((s, d) => edits[cellKey(id, d)] || ((leave[id] || []).includes(d) ? "Leave" : s));
  return out;
}
export const baseShift = (id, day, leave = {}) => ((leave[id] || []).includes(day) ? "Leave" : BASE[id]?.[day]);

// Who works when, for other features (roll call, permits): "Day" | "Afternoon" | "Night" | "Off" | "Leave", or null if not rostered.
export function shiftFor(personId, day, s = getState()) {
  if (!BASE[personId]) return null;
  return s.roster?.[cellKey(personId, day)] || baseShift(personId, day, leaveFrom(s.approvals, s.requests));
}

const rest = (a, b) => 24 + SHIFT_TIMES[b][0] - SHIFT_TIMES[a][1]; // hours off between shift a on one day and shift b the next

// Machines short of certified operators on one day. `crew` is a list of people (each counted on their usual shift) or a
// roster ({ personId: [shift per day] }). Returns [{ site, shift, machine, name, cert, have, need, day }].
export function skillGaps(crew, machines, day) {
  const at = dayDate(day);
  const working = Array.isArray(crew) ? crew.filter((p) => p.status !== "left").map((p) => [p, p.shift]) : Object.entries(crew).map(([id, days]) => [BY_ID.get(id), days[day]]);
  const out = [];
  for (const m of machines) {
    for (const shift of m.shifts || siteShifts(m.site)) {
      const have = working.filter(([p, s]) => p && s === shift && p.site === m.site && qualified(p, m.needs, at)).length;
      if (have < m.perShift) out.push({ site: m.site, shift, machine: m.id, name: m.name, cert: m.needs, have, need: m.perShift, day });
    }
  }
  return out;
}

const ORDER = { skill: 0, leave: 1, coverage: 2, rest: 3, hours: 4 };
// Every broken rule in a draft, for the people being planned, from rules.from to the end of next week:
// rest between shifts, the weekly hours cap, approved leave, each team's headcount, and a certified operator on every machine
// (counted across the whole site, since other teams on the same shift count too).
// Each problem: { kind, text, day, cell?, person?, team?, site, shift? }.
export function rosterProblems(roster, { people, machines = MACHINES, leave = {}, rules = {} }) {
  const r = { ...RULES, ...rules };
  const out = [];
  const ids = new Set(people.map((p) => p.id));
  for (const p of people) {
    const days = roster[p.id];
    if (!days) continue;
    for (let d = Math.max(r.from, 1); d < DAYS; d++) {
      const a = days[d - 1], b = days[d];
      if (isWork(a) && isWork(b) && rest(a, b) < r.rest) {
        out.push({ kind: "rest", person: p.id, site: p.site, day: d, cell: cellKey(p.id, d), text: `${p.name}: ${rest(a, b)} hours' rest between the ${a.toLowerCase()} shift on ${dayLabel(d - 1)} and the ${b.toLowerCase()} shift on ${dayLabel(d)}. The rule is ${r.rest}.` });
      }
    }
    for (const w of [0, 7]) {
      if (w + 6 < r.from) continue;
      const worked = Array.from({ length: 7 }, (_, i) => w + i).filter((d) => isWork(days[d]));
      const hours = worked.length * r.hours;
      if (hours > r.weekCap) out.push({ kind: "hours", person: p.id, site: p.site, day: worked.at(-1), cell: cellKey(p.id, worked.at(-1)), text: `${p.name}: ${hours} hours in the week of ${dayLabel(w)}. The cap is ${r.weekCap}.` });
    }
    for (const d of leave[p.id] || []) {
      if (d >= r.from && d < DAYS && isWork(days[d])) out.push({ kind: "leave", person: p.id, site: p.site, day: d, cell: cellKey(p.id, d), text: `${p.name} is on approved leave on ${dayLabel(d)} but rostered for the ${days[d].toLowerCase()} shift.` });
    }
  }
  for (const t of TEAMS.filter((x) => x.members.some((m) => ids.has(m.id)))) {
    for (let d = r.from; d < DAYS; d++) {
      const have = t.members.filter((m) => roster[m.id]?.[d] === t.shift).length;
      if (have < t.need) out.push({ kind: "coverage", team: t.id, site: t.site, shift: t.shift, day: d, have, need: t.need, text: `${dayLabel(d)}, ${t.lead.name.split(" ")[0]}'s ${t.shift.toLowerCase()} shift team: ${have} of ${t.need} rostered.` });
    }
  }
  const sites = new Set(people.map((p) => p.site));
  const crew = Object.fromEntries(Object.entries(roster).filter(([id]) => sites.has(BY_ID.get(id)?.site)));
  const ms = machines.filter((m) => sites.has(m.site));
  for (let d = r.from; d < DAYS; d++) {
    for (const g of skillGaps(crew, ms, d)) out.push({ kind: "skill", ...g, text: `${dayLabel(d)}, ${g.shift.toLowerCase()} shift at ${siteName(g.site)}: ${g.name} has ${g.have} of ${g.need} certified ${g.need === 1 ? "operator" : "operators"} rostered.` });
  }
  return out.sort((a, b) => a.day - b.day || ORDER[a.kind] - ORDER[b.kind]);
}

// Suggestions for the planner to accept one by one (never applied here): certified people for machine gaps first, then team
// members on a day off for headcount, each only if they stay rested, under the hours cap and off leave. Candidates come from
// `people` (who the planner may roster). Returns { suggestions: [{ person, day, shift, key, why }], left: problems still open }.
export function fillGaps(roster, opts) {
  const r = { ...RULES, ...opts.rules };
  const leave = opts.leave || {};
  const work = Object.fromEntries(Object.entries(roster).map(([k, v]) => [k, [...v]]));
  const suggestions = [];
  const fits = (p, d, shift) => {
    const days = work[p.id];
    if (!days || days[d] !== "Off" || (leave[p.id] || []).includes(d)) return false;
    if (isWork(days[d - 1]) && rest(days[d - 1], shift) < r.rest) return false;
    if (isWork(days[d + 1]) && rest(shift, days[d + 1]) < r.rest) return false;
    const w = d < 7 ? 0 : 7;
    return (days.slice(w, w + 7).filter(isWork).length + 1) * r.hours <= r.weekCap;
  };
  const take = (p, d, shift, why) => { work[p.id][d] = shift; suggestions.push({ person: p.id, day: d, shift, key: cellKey(p.id, d), why }); };
  const first = rosterProblems(work, opts);
  for (const g of first.filter((x) => x.kind === "skill")) {
    const m = MACHINES.find((x) => x.id === g.machine);
    const at = dayDate(g.day);
    const now = skillGaps(work, [m], g.day).find((x) => x.shift === g.shift); // an earlier pick may already have closed it
    let short = now ? now.need - now.have : 0;
    const cands = opts.people.filter((p) => p.site === g.site && qualified(p, m.needs, at)).sort((a, b) => (b.shift === g.shift) - (a.shift === g.shift));
    for (const p of cands) { if (short <= 0) break; if (fits(p, g.day, g.shift)) { take(p, g.day, g.shift, `Certified for ${certName(m.needs).toLowerCase()}, on a day off, rested and under ${r.weekCap} hours that week.`); short--; } }
  }
  for (const g of first.filter((x) => x.kind === "coverage")) {
    const t = TEAMS.find((x) => x.id === g.team);
    let short = t.need - t.members.filter((m) => work[m.id]?.[g.day] === t.shift).length;
    for (const p of t.members) { if (short <= 0) break; if (opts.people.includes(p) && fits(p, g.day, t.shift)) { take(p, g.day, t.shift, `In the team, on a day off, rested and under ${r.weekCap} hours that week.`); short--; } }
  }
  return { suggestions, left: rosterProblems(work, opts).filter((x) => x.kind === "skill" || x.kind === "coverage") };
}

// Headcount on shift for a set of teams, per shift, on one day: [{ shift, have, need }].
export function coverageOn(roster, teams, day) {
  return Object.keys(SHIFT_TIMES).map((shift) => {
    const ts = teams.filter((t) => t.shift === shift);
    return { shift, have: ts.reduce((n, t) => n + t.members.filter((m) => roster[m.id]?.[day] === shift).length, 0), need: ts.reduce((n, t) => n + t.need, 0) };
  }).filter((c) => c.need > 0);
}
// Percent of needed shifts filled from day `from` to `to` (inclusive), each day's shortfall counted, overstaffing not.
export function coveragePercent(roster, teams, from, to) {
  let have = 0, need = 0;
  for (let d = from; d <= to; d++) for (const c of coverageOn(roster, teams, d)) { have += Math.min(c.have, c.need); need += c.need; }
  return need ? Math.round((100 * have) / need) : 100;
}

// What changed since the last hand-off, for the people given: { changes: [{ key, person, day, from, to }], people }.
export function rosterDiff(edits, sentEdits, ids, leave = {}) {
  const changes = [];
  for (const key of new Set([...Object.keys(edits), ...Object.keys(sentEdits)])) {
    const [id, d] = key.split("|");
    if (!ids.has(id)) continue;
    const day = Number(d), base = baseShift(id, day, leave);
    const from = sentEdits[key] || base, to = edits[key] || base;
    if (from !== to) changes.push({ key, person: id, day, from, to });
  }
  changes.sort((a, b) => a.day - b.day);
  return { changes, people: new Set(changes.map((c) => c.person)).size };
}

// ── Hooks: the live roster from the demo store ──
export function useRoster() {
  const edits = useDemo((s) => s.roster), approvals = useDemo((s) => s.approvals), requests = useDemo((s) => s.requests);
  return useMemo(() => { const leave = leaveFrom(approvals, requests); return { roster: rosterWith(edits, leave), leave, edits }; }, [edits, approvals, requests]);
}
// Live coverage for a site (for Sites and Home): { percent, short: [{ day, shift, have, need }] } over the next 7 days by default.
export function useRosterCoverage(site, from = TODAY_INDEX, to = Math.min(from + 6, DAYS - 1)) {
  const { roster } = useRoster();
  return useMemo(() => {
    const teams = TEAMS.filter((t) => t.site === site);
    const short = [];
    for (let d = from; d <= to; d++) for (const c of coverageOn(roster, teams, d)) if (c.have < c.need) short.push({ day: d, ...c });
    return { percent: coveragePercent(roster, teams, from, to), short };
  }, [roster, site, from, to]);
}

// SITES with roster coverage worked out live from the roster (approving leave or editing shifts moves it). Sites and Home use it.
export function useLiveSites() {
  const { roster } = useRoster();
  return useMemo(() => SITES.map((s) => ({ ...s, kpi: { ...s.kpi, coverage: coveragePercent(roster, TEAMS.filter((t) => t.site === s.id), TODAY_INDEX, Math.min(TODAY_INDEX + 6, DAYS - 1)) } })), [roster]);
}
