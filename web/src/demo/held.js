// What we hold about you (feature 7, docs/demo-features-plan.md): every part of one person's record, where it came from,
// who can see it and how long it's kept. Pure: the My data page, its download and the tests all read heldAbout().
// Named held.js, not my-data.js: the demo's Vite root would serve a module named like the /my-data route.
// Who can see each part comes from the CURRENT grants (store `grants`, DEFAULT_GRANTS before anyone edits them) and the
// same reach as inScope (data.js): GM, Security, IT and HR see everyone, a Site Manager their site, a supervisor their team.
import { APPROVALS, COMPANY, DEFAULT_GRANTS, DOORS, DOOR_EVENTS, GM, IT_LEAD, MACHINES, PEOPLE, ROLES, TASKS, TODAY, certName, dayOffset, fmtDay, person, qualified, siteName } from "./data.js";
import { ROSTER, SHIFT_TIMES, TODAY_INDEX, DAYS, dayLabel, shiftFor } from "./roster.js";
import { mergePermits, statusAt, typeName } from "./permits.js";
import { commuteMap, postcodeArea } from "./weather.js";
import * as rollcall from "./rollcall.js"; // namespace import: PAST_ROLLCALLS is optional there
import { getState } from "./store.js";

function rng(seed) { // mulberry32, as in data.js; this feature's seed plus the person's number, so nobody else's data moves
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const H = 3600e3, M = 60e3;
const time = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const when = (t) => `${fmtDay(new Date(t))}, ${time(t)}`;
const hours = (s) => { const [a, b] = SHIFT_TIMES[s]; const f = (h) => `${h % 24}:00`; return `${f(a)} to ${f(b)}`; };

// ── Who can see it ──
const WIDE = ["gm", "security", "it", "hr"];
const ancestors = (p) => { const out = []; for (let m = person(p.manager); m; m = person(m.manager)) out.push(m); return out; };
// Does someone in `role` see this person at all? Mirrors inScope; a one-per-scope role the person holds themselves is just "you".
function reaches(role, p) {
  if (role === "gm") return p.role !== "gm";
  if (WIDE.includes(role)) return true;
  if (role === "site_manager") return p.site !== "hq" && p.role !== "site_manager";
  if (role === "supervisor") return ancestors(p).some((a) => a.role === "supervisor");
  return false;
}
const LABEL = { gm: "GM Operations", site_manager: "your Site Manager", supervisor: "your supervisor", security: "Security", it: "IT", hr: "HR", manager: "your manager", auditor: "auditors (read-only, for a set time)" };
const ORDER = ["supervisor", "site_manager", "manager", "gm", "hr", "security", "it", "auditor"];
export const joinAnd = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
// "you, your supervisor, your Site Manager and HR"
export const whoText = (roles, you = true) => joinAnd([...(you ? ["you"] : []), ...roles.map((r) => LABEL[r] || r)]) || "nobody";

// Roles that see a part of the record: they hold one of `caps` (any role in reach when caps is null) and reach the person.
function rolesFor(p, grants, caps, only) {
  return ORDER.filter((r) => (!only || only.includes(r)) && reaches(r, p) && (!caps || caps.some((c) => (grants[r] || []).includes(c))));
}

// ── Door reads: the seeded ones on their card, plus their own badge-ins and outs on the days they worked ──
export function doorReads(p, now = Date.now()) {
  const r = rng(20261107 + Number(p.id.replace(/\D/g, "")));
  const door = DOORS[p.site]?.[0];
  const out = DOOR_EVENTS.filter((e) => e.card === p.card).map((e) => ({ at: +e.when, site: e.site, door: e.door, dir: null, result: e.result }));
  for (let d = 0; d < 30; d++) {
    const date = dayOffset(-d);
    const week = ROSTER[p.id]; // five on, two off, repeating weekly
    const shift = week ? week[(((TODAY_INDEX - d) % 7) + 7) % 7] : date.getDay() % 6 === 0 ? "Off" : "Office";
    const span = shift === "Office" ? [8, 17] : SHIFT_TIMES[shift];
    if (!span || !door) continue;
    const inAt = +date + span[0] * H - (5 + r() * 20) * M, outAt = +date + span[1] * H + (2 + r() * 18) * M;
    if (inAt < now) out.push({ at: Math.round(inAt), site: p.site, door, dir: "in", result: "Granted" });
    if (outAt < now) out.push({ at: Math.round(outAt), site: p.site, door, dir: "out", result: "Granted" });
  }
  return out.filter((e) => e.at >= now - 30 * 24 * H).sort((a, b) => b.at - a.at);
}

// ── Who looked at their record: views logged when someone else opens their PersonCard, plus two fictional earlier ones ──
export function lookedAt(personId, state = getState()) {
  const p = person(personId);
  const hr = PEOPLE.find((x) => x.role === "hr");
  const boss = person(p.manager) || (p.id !== GM.id ? GM : IT_LEAD);
  const seeded = [
    { at: +TODAY - 14 * H, viewer: boss.title, viewerPersonId: boss.id, personId, why: p.manager ? "You report to them" : "Quarterly access review", seeded: true },
    { at: +TODAY - 6 * 24 * H + 10.5 * H, viewer: hr.title, viewerPersonId: hr.id, personId, why: "HR sees everyone's people record", seeded: true },
  ].filter((v) => v.viewerPersonId !== personId);
  return [...(state.views || []).filter((v) => v.personId === personId), ...seeded].sort((a, b) => b.at - a.at);
}

// Why someone in this persona could open this person's record, said to the person (stored with each view).
export function viewReason(persona, viewer, p) {
  if (persona.id === "gm") return "GM Operations sees everyone at every Queensland site";
  if (persona.id === "hr") return "HR sees everyone's people record";
  if (persona.id === "security") return "Security sees everyone, the security side only";
  if (persona.id === "it") return "IT sees everyone, the systems and devices side only";
  if (persona.id === "site_manager") return `They manage ${siteName(viewer.site)}, where you work`;
  return p.manager === viewer.id ? "You're in their team" : "You're in a team under them";
}

// ── Every part of the record ──
// Each: { id, group, title, items: [{ label, value }], summary?, source (assumption id), roles, you, who, kept, fields }.
// fields: the PersonCard rows (bits.jsx) this part covers, so the test can check nothing on the card is left out here.
export function heldAbout(personId, state = getState()) {
  const p = person(personId);
  const grants = state.grants || DEFAULT_GRANTS;
  const approvals = state.approvals || {};
  const roleName = (state.roleOf || {})[p.id] || ROLES.find((r) => r.id === p.role)?.name || p.role;
  const reports = PEOPLE.filter((x) => x.manager === p.id).length;
  const tasks = [...TASKS, ...(state.newTasks || [])].map((t) => ({ ...t, ...(state.tasks || {})[t.id] })).filter((t) => t.assignee === p.id);
  const requests = [...APPROVALS, ...(state.requests || [])].filter((a) => a.from === p.id && ["Leave", "Roster"].includes(a.kind));
  const permits = mergePermits(state.permits, state.permitEdits).filter((x) => x.holders.includes(p.id) || x.issuer === p.id);
  const calls = [...(state.rollcalls || []), ...(rollcall.PAST_ROLLCALLS || [])].filter((r) => r.site === p.site || r.missing?.includes(p.id));
  const commute = commuteMap(state.commuteOptOut || {})[p.id] || { optIn: false, postcode: null };
  const reads = doorReads(p);
  const views = lookedAt(p.id, state);
  const rostered = Boolean(ROSTER[p.id]);
  const machines = MACHINES.filter((m) => m.site === p.site && qualified(p, m.needs)).map((m) => m.name);

  const cats = [
    { id: "profile", group: "profile", title: "Profile", source: "hr", caps: ["people"], fields: ["Reports to", "Direct reports"],
      kept: "While you work here, then 7 years after you leave, as the Fair Work Act asks.",
      items: [["Name", p.name], ["Job", p.title], ["Site", siteName(p.site)], ["Department", p.dept],
        ["Reports to", person(p.manager)?.name || "Group (outside Queensland operations)"], ["Direct reports", reports ? String(reports) : "None"],
        ["Employment", p.status === "left" ? `Left ${fmtDay(p.leftOn)}` : "Current"]] },
    { id: "pay", group: "profile", title: "Pay", source: "hr", caps: ["pay"], you: true, fields: ["Pay rate"],
      kept: "7 years, as the Fair Work Act asks. Payroll keeps your payslips.",
      items: [["Pay rate", "$41.20 an hour (fictional)"]], note: "Hidden from managers. You also see it on your payslip." },
    { id: "role", group: "profile", title: "Your Mycelium role", source: "sso", caps: ["people", "roles"], fields: ["Mycelium role"],
      kept: "While you have an account. Every change to it stays in the audit trail.",
      items: [["Role", roleName], ["What it shows you", (ROLES.find((r) => r.name === roleName) || ROLES.find((r) => r.id === p.role))?.scope || "Themselves"]] },
    { id: "card", group: "access", title: "Access card", source: "access_control", caps: ["people", "security"], fields: ["Access card"],
      kept: "While you work here. It should be cancelled on your last day.",
      items: [["Card", p.card], ["Status", p.status === "left" ? "Still active after you left" : "Active"]] },
    { id: "doors", group: "access", title: "Door reads, last 30 days", source: "access_control", caps: ["security"],
      kept: "30 days in Mycelium, then deleted. Card reads only: no video, no location between doors.",
      summary: `${reads.length} card reads in the last 30 days${reads.length ? `, at ${joinAnd([...new Set(reads.map((e) => `${e.door}, ${siteName(e.site)}`))])}` : ""}.`,
      items: reads.map((e) => [when(e.at), `${e.door}, ${siteName(e.site)}: ${e.dir ? `${e.dir}, ` : ""}${e.result.toLowerCase()}`]) },
    { id: "shift", group: "time", title: "Usual shift", source: "rostering", caps: ["people"], fields: ["Shift"],
      kept: "7 years, with your time records.",
      items: [["Shift", rostered || p.site !== "hq" ? `${p.shift}, ${hours(p.shift)}` : "Office hours"]] },
    { id: "roster", group: "time", title: "Roster, next 7 days", source: "rostering", caps: ["roster"],
      kept: "7 years, as the Fair Work Act asks for time records.",
      items: rostered ? Array.from({ length: Math.min(7, DAYS - TODAY_INDEX) }, (_, i) => TODAY_INDEX + i).map((d) => [dayLabel(d), shiftFor(p.id, d, state)])
        : [["Roster", "You're not on a shift roster"]] },
    { id: "leave", group: "time", title: "Leave", source: "hr", caps: ["approveLeave"],
      kept: "7 years, with your pay records.",
      items: [["Annual leave balance", "11.5 days (fictional)"], ...requests.map((a) => [`${a.kind}: ${a.title}`, approvals[a.id] || "Waiting for approval"])] },
    { id: "skills", group: "skills", title: "Skills and certificates", source: "training", caps: ["people"], fields: ["Can operate"],
      kept: "While you work here, then 7 years, as safety records.",
      items: [...(p.skills || []).map((s) => [certName(s.cert), s.status === "training" ? "In training" : s.expires ? `Certified, ${s.expires < TODAY ? "expired" : "expires"} ${fmtDay(s.expires)}` : "Certified"]),
        ...(MACHINES.some((m) => m.site === p.site) ? [["Can operate", machines.join(", ") || "No machine tickets"]] : [])] },
    { id: "tasks", group: "tasks", title: "Tasks", source: "tasks", caps: null, fields: ["Open tasks"],
      kept: "Done tasks drop off after 90 days. Your task tool keeps its own copy.",
      items: [["Open tasks on your record", String(p.tasks)], ...tasks.map((t) => [t.title, `${t.status === "done" ? "Done" : t.status === "doing" ? "In progress" : "To do"}, due ${fmtDay(new Date(t.due))}`])] },
    { id: "devices", group: "devices", title: "Devices signed in", source: "devices", caps: ["devices"],
      kept: "While you're signed in. Sign-in history 90 days.", summary: "2 devices signed in: a laptop and a phone.",
      items: [["Laptop", "Company laptop, signed in, meets policy"], ["Phone", "Mycelium app, signed in"]] },
    { id: "permits", group: "permits", title: "Permits to work", source: "permits", caps: ["permits", "security"],
      kept: "7 years after the permit closes, as safety records.",
      items: permits.map((x) => [`${x.id}, ${typeName(x.type).toLowerCase()}`, `${x.area}, ${siteName(x.site)}: ${statusAt(x)}${x.issuer === p.id ? ", issued by you" : ""}`]) },
    { id: "rollcalls", group: "rollcalls", title: "Roll calls", source: "evac", caps: ["emergency"],
      kept: "7 years, as safety records.",
      items: calls.map((r) => [`${r.mode === "drill" ? "Drill" : "Roll call"} at ${siteName(r.site)}, ${fmtDay(new Date(r.startedAt))}`,
        r.missing?.includes(p.id) ? "You were listed as not found when it ended" : "You're not named (reports name only people not found)"]) },
    { id: "commute", group: "commute", title: "Route alerts", source: "s_commute", caps: ["roster"], only: ["supervisor"],
      kept: "Your choice stays until you change it. Your postcode stays in HR; Mycelium reads it only while alerts are on.",
      items: [["Route alerts", commute.optIn ? "On" : "Off"], ["Home postcode", commute.optIn ? `${commute.postcode}${postcodeArea(commute.postcode) ? `, ${postcodeArea(commute.postcode)}` : ""} (never your address)` : "Not shared with Mycelium"]],
      note: "Your supervisor sees your name only if your way in may be cut. Nobody sees your postcode." },
    { id: "views", group: "views", title: "Who looked at your record", source: "privacy", caps: ["audit"],
      kept: "2 years, so you can always ask who looked.",
      items: views.map((v) => [when(v.at), `${person(v.viewerPersonId)?.name || "Someone"}, ${v.viewer}: ${v.why}`]) },
  ];
  return cats.map(({ caps, only, items, ...c }) => {
    const roles = rolesFor(p, grants, caps, only);
    const you = c.you ?? true;
    return { fields: [], ...c, items: items.map(([label, value]) => ({ label, value })), roles, you, who: whoText(roles, you) };
  });
}

// The person's own record as a file: what "Download my data" saves. Fictional throughout.
export function myDataFile(personId, state = getState()) {
  const p = person(personId);
  return {
    about: `What Mycelium holds about ${p.name} at ${COMPANY.name} (a fictional company; every value here is made up).`,
    made: new Date().toISOString(),
    record: heldAbout(personId, state).map(({ id, title, items, source, who, kept }) => ({ id, title, items, source, whoCanSee: who, kept })),
    correctionRequests: (state.dataRequests || []).filter((r) => r.personId === personId),
    neverCollected: NEVER,
  };
}
export const fileName = (p) => `brolga-my-data-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.json`;

export const NEVER = [
  "Keystrokes, or what's on your screen",
  "Screen time or how long you're active",
  "Video of you (door reads come from your card, never from cameras)",
  "Your private calendar events (Mycelium sees only busy or free)",
  "Your home address (only your postcode, and only if you turn on route alerts)",
];
