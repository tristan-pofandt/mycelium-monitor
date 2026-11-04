// The demo's fictional company, Brolga Industries: sites, entities, people, work, schedules, security and devices.
// Everything is generated from a fixed seed, so every visitor sees the same company; dates are relative to this week.
// Nothing here describes a real company. Guesses about real systems live in assumptions.js, not here.

function rng(seed) { // mulberry32
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261104);
const pick = (list) => list[Math.floor(rand() * list.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

const now = new Date();
export const TODAY = new Date(now.getFullYear(), now.getMonth(), now.getDate());
export const WEEK_START = new Date(TODAY); WEEK_START.setDate(TODAY.getDate() - ((TODAY.getDay() + 6) % 7)); // Monday
export const dayOffset = (d) => new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + d);
export const fmtDay = (d) => d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
const hoursAgo = (h) => new Date(now.getTime() - h * 3600e3);
export const fmtAgo = (d) => { const m = Math.round((now - d) / 60e3); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

export const COMPANY = { name: "Brolga Industries", what: "a fictional maker of rail and commercial-vehicle components", region: "Queensland" };

export const ENTITIES = [
  { id: "rail", name: "Brolga Rail Systems Pty Ltd" },
  { id: "cv", name: "Brolga Commercial Vehicle Pty Ltd" },
  { id: "svc", name: "Brolga Services Pty Ltd" },
];

// kpi: OEE %, unplanned downtime h (7 days), recordable incidents (30 days), near misses (30 days), overdue work orders,
// open quality issues, on-time in-full deliveries %, roster coverage next 7 days %
export const SITES = [
  { id: "acr", name: "Acacia Ridge", city: "Brisbane", entity: "rail", kind: "Rail brake assembly", staff: 205, supervisors: 6,
    kpi: { oee: 78, downtime: 6.5, incidents: 1, nearMiss: 7, overdue: 9, quality: 4, otif: 96, coverage: 97 } },
  { id: "ips", name: "Ipswich", city: "Ipswich", entity: "cv", kind: "Commercial vehicle components", staff: 165, supervisors: 5,
    kpi: { oee: 71, downtime: 14.2, incidents: 2, nearMiss: 4, overdue: 23, quality: 7, otif: 89, coverage: 94 } },
  { id: "twb", name: "Toowoomba", city: "Toowoomba", entity: "cv", kind: "Machining and castings", staff: 120, supervisors: 4,
    kpi: { oee: 74, downtime: 9.1, incidents: 0, nearMiss: 3, overdue: 11, quality: 3, otif: 93, coverage: 86 } },
  { id: "tsv", name: "Townsville", city: "Townsville", entity: "svc", kind: "Service and overhaul depot", staff: 70, supervisors: 2,
    kpi: { oee: 82, downtime: 3.0, incidents: 0, nearMiss: 2, overdue: 4, quality: 1, otif: 98, coverage: 99 } },
];
export const OFFICE = { id: "hq", name: "Brisbane office", city: "Brisbane", entity: "rail", kind: "Regional office", staff: 40 };
export const PLACES = [...SITES, OFFICE];
export const siteName = (id) => PLACES.find((s) => s.id === id)?.name || id;

// Output per day for the last 14 days, per site (units built or serviced)
export const OUTPUT = SITES.map((s) => {
  const base = { acr: 410, ips: 520, twb: 300, tsv: 60 }[s.id];
  return { site: s.id, days: Array.from({ length: 14 }, (_, i) => ({ date: dayOffset(i - 14), units: Math.round(base * (0.82 + rand() * 0.3)) })) };
});

// ── People ──
const FIRST = ["Aisha", "Ben", "Chloe", "Daniel", "Emily", "Farid", "Grace", "Hamish", "Isla", "Jack", "Kiara", "Liam", "Mia", "Noah", "Olivia", "Priya", "Quinn", "Ruby", "Sam", "Tahlia",
  "Usman", "Vikram", "Willow", "Xavier", "Yasmin", "Zac", "Ava", "Blake", "Cooper", "Dara", "Ethan", "Frankie", "Georgia", "Harvey", "Ivy", "Jordan", "Kai", "Lena", "Mason", "Nina"];
const LAST = ["Anderson", "Brooks", "Chen", "Dawson", "Evans", "Fraser", "Gupta", "Harris", "Ito", "Jensen", "Kowalski", "Lee", "Murray", "Nguyen", "O'Brien", "Patel", "Quinlan", "Reid",
  "Singh", "Taylor", "Ueda", "Vu", "Walsh", "Xu", "Young", "Zhang", "Bianchi", "Costa", "Doyle", "Ellis", "Fitzgerald", "Hughes", "Kaur", "Mendes", "Novak", "Russo", "Silva", "Tran", "Wright", "Hill"];
const usedNames = new Set(["Morgan Reid"]);
const personName = () => { let n; do n = `${pick(FIRST)} ${pick(LAST)}`; while (usedNames.has(n)); usedNames.add(n); return n; };
const SHIFTS = ["Day", "Afternoon", "Night"];
const ROLE_TITLES = { acr: ["Assembly operator", "Brake fitter", "Test technician"], ips: ["Machine operator", "Welder", "Assembly operator"],
  twb: ["CNC machinist", "Foundry operator", "Fettler"], tsv: ["Service technician", "Overhaul fitter"] };

export const PEOPLE = [];
let n = 0;
const add = (p) => { const person = { id: `p${++n}`, tasks: 0, shift: "Day", card: `C-${10400 + n}`, status: "active", certs: [], ...p }; PEOPLE.push(person); return person; };

export const GM = add({ name: "Morgan Reid", title: "General Manager Operations QLD", site: "hq", dept: "Operations", manager: null, role: "gm", tasks: 6, you: true });
const SECURITY = add({ name: personName(), title: "Security Coordinator QLD", site: "hq", dept: "Security", manager: GM.id, role: "security", tasks: 5 });
add({ name: personName(), title: "HR Business Partner", site: "hq", dept: "HR", manager: GM.id, role: "hr", tasks: 4 });
add({ name: personName(), title: "Operations Finance Controller", site: "hq", dept: "Finance", manager: GM.id, role: "manager", tasks: 3 });
add({ name: personName(), title: "WHS Manager QLD", site: "hq", dept: "Safety", manager: GM.id, role: "manager", tasks: 7 });
export const IT_LEAD = add({ name: personName(), title: "IT Site Lead QLD (reports to Group IT)", site: "hq", dept: "IT", manager: null, role: "it", tasks: 8 });
for (let i = 0; i < 8; i++) add({ name: personName(), title: pick(["Planner", "Buyer", "Payroll officer", "Admin officer", "Engineer"]), site: "hq", dept: "Office", manager: GM.id, role: "employee", tasks: int(0, 4) });

for (const s of SITES) {
  const sm = add({ name: personName(), title: `Site Manager, ${s.name}`, site: s.id, dept: "Management", manager: GM.id, role: "site_manager", tasks: int(5, 9) });
  const prod = add({ name: personName(), title: "Production Manager", site: s.id, dept: "Production", manager: sm.id, role: "manager", tasks: int(4, 8) });
  const maint = add({ name: personName(), title: "Maintenance Manager", site: s.id, dept: "Maintenance", manager: sm.id, role: "manager", tasks: int(4, 10) });
  add({ name: personName(), title: "Quality Lead", site: s.id, dept: "Quality", manager: sm.id, role: "manager", tasks: int(3, 6) });
  add({ name: personName(), title: "WHS Advisor", site: s.id, dept: "Safety", manager: sm.id, role: "employee", tasks: int(2, 6) });
  const leaders = [];
  for (let i = 0; i < s.supervisors; i++) {
    leaders.push(add({ name: personName(), title: `Shift Supervisor, ${SHIFTS[i % (s.id === "acr" ? 3 : 2)]}`, site: s.id, dept: "Production", manager: prod.id, role: "supervisor",
      shift: SHIFTS[i % (s.id === "acr" ? 3 : 2)], tasks: int(3, 12) }));
  }
  const mSup = add({ name: personName(), title: "Maintenance Supervisor", site: s.id, dept: "Maintenance", manager: maint.id, role: "supervisor", tasks: int(6, 14) });
  leaders.push(mSup);
  const left = s.staff - 5 - leaders.length;
  for (let i = 0; i < left; i++) {
    const lead = leaders[i % leaders.length];
    add({ name: personName(), title: lead === mSup ? pick(["Maintenance fitter", "Electrician"]) : pick(ROLE_TITLES[s.id]), site: s.id, dept: lead.dept, manager: lead.id,
      role: "employee", shift: lead.shift, tasks: int(0, 3), certs: rand() < 0.08 ? [{ name: pick(["Forklift licence", "First aid", "Confined space"]), expires: dayOffset(int(3, 28)) }] : [] });
  }
}
// Two people who have left but whose access cards are still active: the cross-system problem the demo points at.
const leavers = PEOPLE.filter((p) => p.role === "employee" && p.site === "ips").slice(3, 5);
leavers.forEach((p, i) => { p.status = "left"; p.leftOn = dayOffset(-9 - i * 6); p.cardActive = true; });
export const LEAVERS = leavers;

export const person = (id) => PEOPLE.find((p) => p.id === id);
export const reportsOf = (id) => PEOPLE.filter((p) => p.manager === id);
export const under = (id) => { const out = []; const walk = (m) => reportsOf(m).forEach((p) => { out.push(p); walk(p.id); }); walk(id); return out; };

// ── Roles, capabilities and the demo personas ──
export const ROLES = [
  { id: "gm", name: "GM Operations", scope: "All Queensland sites" },
  { id: "site_manager", name: "Site Manager", scope: "Their site" },
  { id: "manager", name: "Department Manager", scope: "Their department" },
  { id: "supervisor", name: "Shift Supervisor", scope: "Their team" },
  { id: "employee", name: "Employee", scope: "Themselves" },
  { id: "security", name: "Security Officer", scope: "All sites, security only" },
  { id: "hr", name: "HR", scope: "All sites, people only" },
  { id: "it", name: "IT Administrator", scope: "All sites, systems and devices" },
];
export const CAPS = [
  { id: "sites", label: "See site comparison and KPIs", group: "Operations" },
  { id: "people", label: "See people in scope", group: "People" },
  { id: "pay", label: "See pay rates", group: "People" },
  { id: "approveLeave", label: "Approve leave and roster changes", group: "People" },
  { id: "assign", label: "Assign tasks", group: "Work" },
  { id: "events", label: "Create calendar events for others", group: "Calendar" },
  { id: "lock", label: "Lock events", group: "Calendar" },
  { id: "approveEvents", label: "Approve large events", group: "Calendar" },
  { id: "security", label: "See door, camera and visitor events", group: "Security" },
  { id: "revoke", label: "Revoke access cards", group: "Security" },
  { id: "devices", label: "See device compliance and sign-in risks", group: "Security" },
  { id: "roles", label: "Manage roles and permissions", group: "Admin" },
  { id: "assistant", label: "Use the AI assistant", group: "AI" },
  { id: "export", label: "Export data", group: "Admin" },
];
export const DEFAULT_GRANTS = {
  gm: CAPS.map((c) => c.id).filter((c) => c !== "pay"),
  site_manager: ["sites", "people", "approveLeave", "assign", "events", "lock", "approveEvents", "security", "devices", "assistant", "export"],
  manager: ["people", "approveLeave", "assign", "events", "assistant"],
  supervisor: ["people", "approveLeave", "assign", "events", "assistant"],
  employee: ["assistant"],
  security: ["people", "security", "revoke", "assistant", "export"],
  hr: ["people", "pay", "approveLeave", "export"],
  it: ["people", "devices", "roles", "export", "assistant"],
};

const ipsSm = PEOPLE.find((p) => p.site === "ips" && p.role === "site_manager");
const ipsSup = PEOPLE.find((p) => p.site === "ips" && p.role === "supervisor");
const ipsOp = reportsOf(ipsSup.id).find((p) => p.status === "active");
// "Viewing as": the same app seen by six people at different places in the hierarchy.
export const PERSONAS = [
  { id: "gm", person: GM.id, label: "GM Operations (you)" },
  { id: "site_manager", person: ipsSm.id, label: "Site Manager, Ipswich" },
  { id: "supervisor", person: ipsSup.id, label: "Shift Supervisor, Ipswich" },
  { id: "employee", person: ipsOp.id, label: "Employee, Ipswich" },
  { id: "security", person: SECURITY.id, label: "Security Coordinator" },
  { id: "it", person: IT_LEAD.id, label: "IT Administrator" },
];

// People a persona can see: the GM, HR, IT and security see everyone; a site manager their site; a supervisor their team.
export function inScope(persona) {
  const me = person(persona.person);
  if (["gm", "security", "it", "hr"].includes(persona.id)) return PEOPLE;
  if (persona.id === "site_manager") return PEOPLE.filter((p) => p.site === me.site);
  if (persona.id === "supervisor") return [me, ...under(me.id)];
  return [me];
}

// ── Work: tasks, tickets and approvals ──
const TASKS_RAW = [
  ["Replace hydraulic seals on press line 2", "ips", "maintenance", 1, "doing"], ["Close out NCR-2231 (bore tolerance)", "ips", "quality", -2, "todo"],
  ["Toolbox talk: manual handling", "ips", "tasks", 2, "todo"], ["Update night shift roster for week 46", "twb", "rostering", 1, "todo"],
  ["Quarterly fire door inspection", "acr", "tasks", 4, "todo"], ["Calibrate torque tools, cell B", "acr", "maintenance", -1, "todo"],
  ["Prepare ISO 9001 surveillance audit pack", "acr", "tasks", 3, "doing"], ["Service crane CR-04", "twb", "maintenance", -4, "todo"],
  ["Investigate near miss at loading dock", "ips", "whs", 0, "doing"], ["Order spare spindle motor", "twb", "erp", 5, "todo"],
  ["Review overtime for October", "hq", "tasks", 2, "todo"], ["Induct 3 new starters", "tsv", "tasks", 1, "todo"],
  ["Replace camera at Dock 3", "acr", "itsm", 0, "todo"], ["Check comms room door sensor", "twb", "itsm", -1, "todo"],
  ["Site leadership review slides", "hq", "tasks", 1, "doing"], ["Clear backlog of 23 overdue work orders", "ips", "maintenance", 6, "todo"],
];
export const TASKS = TASKS_RAW.map(([title, site, source, due, status], i) => {
  const pool = PEOPLE.filter((p) => p.site === site && p.role !== "employee" && p.role !== "gm");
  return { id: `t${i + 1}`, title, site, source, due: dayOffset(due), status, assignee: (pool[i % pool.length] || GM).id };
});
export const TICKETS = [
  { id: "INC0041872", title: "Access card not opening Gate 2", status: "In progress", opened: dayOffset(-2), source: "itsm" },
  { id: "INC0041915", title: "Shared terminal on line 3 not locking", status: "New", opened: dayOffset(-1), source: "itsm" },
  { id: "REQ0019920", title: "Safety glasses with prescription lenses", status: "Approved", opened: dayOffset(-6), source: "itsm" },
];

const sup = (site) => PEOPLE.find((p) => p.site === site && p.role === "supervisor");
const sm = (site) => PEOPLE.find((p) => p.site === site && p.role === "site_manager");
const emp = (site, k = 0) => PEOPLE.filter((p) => p.site === site && p.role === "employee" && p.status === "active")[k];
// approver: the role that decides; the GM sees their own items plus anything escalated.
export const APPROVALS = [
  { id: "a1", kind: "Event", title: "Planned maintenance shutdown, Toowoomba, Saturday 6:00 to 18:00", from: sm("twb").id, site: "twb", approver: "gm", why: "Shutdowns always need approval" },
  { id: "a2", kind: "Leave", title: "Annual leave, 8 days from next Monday", from: emp("ips", 2).id, site: "ips", approver: "site_manager", why: "Leave over 5 days goes to the Site Manager" },
  { id: "a3", kind: "Leave", title: "Personal leave, Thursday", from: emp("ips", 0).id, site: "ips", approver: "supervisor", why: "Leave up to 5 days goes to the Shift Supervisor" },
  { id: "a4", kind: "Access", title: "After-hours access to the Acacia Ridge comms room for a contractor", from: SECURITY.id, site: "acr", approver: "gm", why: "Restricted rooms need GM approval" },
  { id: "a5", kind: "Overtime", title: "Weekend overtime for 6 maintenance staff (48 hours)", from: sm("ips").id, site: "ips", approver: "gm", why: "Overtime over 40 hours a week" },
  { id: "a6", kind: "Change", title: "Move ISO audit prep meeting from Wed 9:00 to Thu 13:00", from: sup("acr").id, site: "acr", approver: "site_manager", why: "The meeting is locked by the Site Manager" },
  { id: "a7", kind: "Event", title: "Forklift refresher training, 6 hours, Ipswich", from: sup("ips").id, site: "ips", approver: "site_manager", why: "Training over 4 hours" },
  { id: "a8", kind: "Roster", title: "Swap night shifts between two operators", from: emp("twb", 1).id, site: "twb", approver: "supervisor", why: "Roster swaps go to the Shift Supervisor" },
];

// ── Calendar: this week's events (day 0 = Monday) ──
export const EVENT_TYPES = ["Meeting", "Shutdown", "Audit", "Training", "Inspection", "Shift", "Leave"];
export const EVENTS = [
  { id: "e1", title: "QLD operations review", type: "Meeting", day: 0, start: 8, hours: 1.5, owner: GM.id, site: "hq", lock: "locked" },
  { id: "e2", title: "ISO 9001 surveillance audit", type: "Audit", day: 2, start: 9, hours: 7, owner: sm("acr").id, site: "acr", lock: "locked" },
  { id: "e3", title: "ISO audit prep", type: "Meeting", day: 1, start: 13, hours: 1, owner: sm("acr").id, site: "acr", lock: "request" },
  { id: "e4", title: "Toolbox talk: manual handling", type: "Training", day: 1, start: 6, hours: 0.5, owner: sup("ips").id, site: "ips", lock: "open" },
  { id: "e5", title: "WHS committee", type: "Meeting", day: 3, start: 10, hours: 1, owner: PEOPLE.find((p) => p.title === "WHS Manager QLD").id, site: "hq", lock: "request" },
  { id: "e6", title: "Planned maintenance shutdown", type: "Shutdown", day: 5, start: 6, hours: 12, owner: sm("twb").id, site: "twb", lock: "locked", status: "pending" },
  { id: "e7", title: "Site walk with GM", type: "Inspection", day: 3, start: 14, hours: 2, owner: GM.id, site: "ips", lock: "locked" },
  { id: "e8", title: "Comms room inspection", type: "Inspection", day: 4, start: 7, hours: 0.5, owner: SECURITY.id, site: "twb", lock: "open" },
  { id: "e9", title: "New starter induction", type: "Training", day: 0, start: 7, hours: 3, owner: sm("tsv").id, site: "tsv", lock: "request" },
  { id: "e10", title: "Supplier quality meeting", type: "Meeting", day: 4, start: 11, hours: 1, owner: PEOPLE.find((p) => p.site === "ips" && p.title === "Quality Lead").id, site: "ips", lock: "open" },
];
export const DEFAULT_RULES = [
  { id: "long", label: "Events longer than 4 hours need approval from the next level up", on: true },
  { id: "types", label: "Shutdowns, audits and training always need approval", on: true },
  { id: "modify", label: "Managers need approval to move or delete existing events", on: false },
  { id: "lockSenior", label: "Events created by the GM or Site Managers are locked by default", on: true },
];
const RANK = { gm: 5, site_manager: 4, manager: 3, supervisor: 2, employee: 1, security: 3, hr: 3, it: 3 };
export const rank = (role) => RANK[role] || 1;

// Does a new event need approval? Pure, so the rules can be tested (data.test.js).
export function needsApproval(event, creatorRole, rules) {
  if (creatorRole === "gm") return false;
  const on = (id) => rules.find((r) => r.id === id)?.on;
  return Boolean((on("long") && event.hours > 4) || (on("types") && ["Shutdown", "Audit", "Training"].includes(event.type)));
}
export function defaultLock(creatorRole, rules) {
  return rules.find((r) => r.id === "lockSenior")?.on && rank(creatorRole) >= 4 ? "locked" : "open";
}
// Can this viewer edit an event straight away, only by request, or not at all?
export function editMode(event, viewerRole, viewerId) {
  if (event.owner === viewerId || viewerRole === "gm") return "edit";
  const owner = person(event.owner);
  if (rank(viewerRole) > rank(owner?.role)) return "edit";
  return event.lock === "open" ? "edit" : event.lock === "request" ? "request" : "none";
}

// ── Physical security ──
export const SECURITY_ALERTS = [
  { id: "s1", sev: "high", title: `Card of a former employee (left ${fmtDay(leavers[0].leftOn)}) used at Gate 2`, site: "ips", when: hoursAgo(5), source: "access_control" },
  { id: "s2", sev: "high", title: "Comms room door held open for 14 minutes", site: "twb", when: hoursAgo(9), source: "access_control" },
  { id: "s3", sev: "medium", title: "Camera 'Dock 3' offline for 6 hours", site: "acr", when: hoursAgo(6), source: "cctv" },
  { id: "s4", sev: "medium", title: "Perimeter gate alarm at 02:14, checked by the patrol guard", site: "tsv", when: hoursAgo(20), source: "alarms" },
  { id: "s5", sev: "low", title: "3 visitors did not sign out yesterday", site: "acr", when: hoursAgo(15), source: "visitors" },
  { id: "s6", sev: "medium", title: "Comms room inspection overdue by 3 days", site: "twb", when: hoursAgo(72), source: "inspections" },
];
const DOORS = { acr: ["Main entry", "Gate 1", "Assembly hall", "Comms room", "Dock 3"], ips: ["Main entry", "Gate 2", "Machine shop", "Comms room", "Stores"],
  twb: ["Main entry", "Foundry", "Comms room", "Gate 1"], tsv: ["Main entry", "Workshop", "Comms room"], hq: ["Lobby", "Level 3", "Comms room"] };
export const DOOR_EVENTS = Array.from({ length: 24 }, (_, i) => {
  const site = pick([...SITES.map((s) => s.id), "hq"]);
  const who = pick(PEOPLE.filter((p) => p.site === site));
  const result = i === 2 ? "Forced" : i === 5 ? "Held open" : rand() < 0.12 ? "Denied" : "Granted";
  return { id: `d${i}`, when: hoursAgo(i * 0.7 + rand() * 0.5), site, door: pick(DOORS[site]), who: who.name, card: who.card, result };
});
DOOR_EVENTS.unshift({ id: "dl", when: hoursAgo(5), site: "ips", door: "Gate 2", who: `${leavers[0].name} (left)`, card: leavers[0].card, result: "Granted" });

export const CAMERAS = [
  { site: "acr", total: 64, offline: ["Dock 3"], storageDays: 31 }, { site: "ips", total: 48, offline: [], storageDays: 28 },
  { site: "twb", total: 36, offline: ["Foundry east", "Car park 2"], storageDays: 19 }, { site: "tsv", total: 18, offline: [], storageDays: 33 },
  { site: "hq", total: 12, offline: [], storageDays: 30 },
];
export const VISITORS = [
  { name: "Riley Shaw", company: "Coastline Electrical", host: sm("acr").id, site: "acr", since: hoursAgo(2.5), inducted: true },
  { name: "Dana Morales", company: "Auditor, certification body", host: sm("acr").id, site: "acr", since: hoursAgo(1.2), inducted: true },
  { name: "Theo Park", company: "Crane servicing contractor", host: PEOPLE.find((p) => p.site === "twb" && p.title === "Maintenance Manager").id, site: "twb", since: hoursAgo(4), inducted: false },
  { name: "Marta Lind", company: "Customer visit", host: GM.id, site: "ips", since: hoursAgo(0.5), inducted: true },
];
export const INSPECTIONS = [
  { id: "i1", title: "Comms room locked and tidy", site: "twb", every: "Weekly", due: dayOffset(-3) },
  { id: "i2", title: "Comms room locked and tidy", site: "acr", every: "Weekly", due: dayOffset(2) },
  { id: "i3", title: "Perimeter fence walk", site: "tsv", every: "Nightly", due: dayOffset(0) },
  { id: "i4", title: "Fire doors closed and unobstructed", site: "ips", every: "Monthly", due: dayOffset(-1) },
  { id: "i5", title: "Visitor badges returned", site: "acr", every: "Daily", due: dayOffset(0) },
  { id: "i6", title: "Server rack cabinets locked", site: "hq", every: "Weekly", due: dayOffset(4) },
];
export const POLICIES = [
  { policy: "Comms rooms locked when unattended", evidence: "Door sensor events and weekly inspections", status: "Gap at Toowoomba", ok: false, source: "access_control" },
  { policy: "Access cards cancelled on the last day of work", evidence: "HR leavers compared with active cards", status: "2 leavers with active cards", ok: false, source: "hr" },
  { policy: "Visitors signed in, inducted and escorted", evidence: "Visitor sign-in records", status: "1 visitor not inducted", ok: false, source: "visitors" },
  { policy: "Computers lock after 5 minutes idle", evidence: "Device compliance", status: "96% of devices", ok: true, source: "devices" },
  { policy: "Perimeter checked every night", evidence: "Guard patrol tour logs", status: "On track", ok: true, source: "guards" },
  { policy: "CCTV kept for at least 30 days", evidence: "Camera system storage", status: "Toowoomba keeps 19 days", ok: false, source: "cctv" },
];

// ── Devices and cyber ──
export const DEVICES = [
  { site: "acr", count: 142, lock: 97, encrypted: 99, patched: 91, av: 100 }, { site: "ips", count: 118, lock: 92, encrypted: 97, patched: 84, av: 99 },
  { site: "twb", count: 84, lock: 95, encrypted: 100, patched: 88, av: 100 }, { site: "tsv", count: 41, lock: 100, encrypted: 100, patched: 95, av: 100 },
  { site: "hq", count: 66, lock: 98, encrypted: 100, patched: 97, av: 100 },
];
export const BAD_DEVICES = [
  { name: "IPS-LINE3-TERM", site: "ips", issue: "Screen lock turned off (shared terminal)", seen: hoursAgo(1) },
  { name: "IPS-MAINT-LT07", site: "ips", issue: "47 days without updates", seen: hoursAgo(26) },
  { name: "ACR-QA-PC02", site: "acr", issue: "Screen lock set to 30 minutes", seen: hoursAgo(3) },
  { name: "TWB-FOUNDRY-HMI", site: "twb", issue: "Not encrypted (plant panel PC, exempt?)", seen: hoursAgo(5) },
  { name: "IPS-STORES-PC", site: "ips", issue: "Antivirus out of date", seen: hoursAgo(50) },
];
export const SIGNIN_ALERTS = [
  { title: "12 failed sign-ins on one account in 10 minutes", site: "ips", when: hoursAgo(7) },
  { title: "Sign-in from a new country on a supervisor's account (blocked by policy)", site: "acr", when: hoursAgo(30) },
];
export const ESSENTIAL_EIGHT = [
  ["Application control", 1], ["Patch applications", 2], ["Configure Office macros", 2], ["User application hardening", 1],
  ["Restrict admin privileges", 2], ["Patch operating systems", 2], ["Multi-factor authentication", 3], ["Regular backups", 2],
];
