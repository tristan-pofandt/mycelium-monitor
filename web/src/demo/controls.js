// Audit evidence (feature 6, docs/demo-features-plan.md): control lists as data, and the evidence each control draws from what
// the demo already holds (inspections, door logs, permits, roll calls, skills, devices, approvals and the audit trail).
// Short titles and clause numbers only, never standard text (roadmap "Compliance wording"); the Essential Eight is the ACSC's.
// The wording is always "evidence found" or "gap". In a real deployment this is the compliance plug-in (roadmap decision 5):
// a separate app that Mycelium feeds, read-only. No rand() here: the few records that aren't in data.js are fixed below.
import { APPROVALS, BAD_DEVICES, CAMERAS, DEVICES, DOOR_EVENTS, ESSENTIAL_EIGHT, INSPECTIONS, LEAVERS, MACHINES, PEOPLE, SECURITY_ALERTS,
  SIGNIN_ALERTS, SITES, TASKS, VISITORS, fmtDay, qualified, siteName } from "./data.js";
import { PERMITS, permitFor, restricted, statusAt } from "./permits.js";
import { TODAY_INDEX, siteShifts, skillGaps } from "./roster.js";

const H = 3600e3, D = 864e5;

export const FRAMEWORKS = [
  { id: "iso9001", name: "ISO 9001", sub: "quality" },
  { id: "iso45001", name: "ISO 45001", sub: "health and safety" },
  { id: "iso27001", name: "ISO 27001", sub: "physical controls" },
  { id: "e8", name: "Essential Eight", sub: "cyber security, from the ACSC" }, // sub is shown as written (lower case, acronyms kept)
];
export const frameworkName = (id) => FRAMEWORKS.find((f) => f.id === id)?.name || id;

// How long ago each source's collector last ran, in hours: the "last collected 2 h ago" line.
const LAG = { access_control: 0.1, permits: 0.2, visitors: 0.2, inspections: 0.3, cctv: 0.5, alarms: 0.5, devices: 1, sso: 1, hr: 2, maintenance: 2,
  quality: 2, plantdata: 0.25, whs: 3, itsm: 4, training: 6, guards: 8, evac: 0, tasks: 1 };
export const collectedAt = (source, now = Date.now()) => new Date(now - (LAG[source] ?? 1) * H);
export const ago = (d, now = Date.now()) => { const m = Math.max(0, Math.round((now - d) / 60e3)); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };

// One evidence item. site null means organisation-wide. gap: what's missing, when the item is a finding rather than evidence.
const item = (id, site, date, what, source, to, extra = {}) => ({ id, site, date: new Date(date), what, source, to, ...extra });
const gapItem = (id, site, what, source, to, now) => item(id, site, now, what, source, to, { gap: what });

// ── Evidence getters, each (ctx) => items. ctx is what the reviewer has clicked: see evidenceContext. ──
const EVERY = { Daily: 1, Nightly: 1, Weekly: 7, Monthly: 30 };
const inspections = (match) => (ctx) => INSPECTIONS.filter(match).map((i) => {
  const done = ctx.inspections[i.id];
  if (done) return item(i.id, i.site, ctx.now, `${i.title}: done ${done}, with a photo`, "inspections", "/security");
  if (i.due < ctx.today) return gapItem(i.id, i.site, `${i.title}: overdue since ${fmtDay(i.due)}`, "inspections", "/security", ctx.now);
  const last = new Date(+i.due - EVERY[i.every] * D);
  return item(i.id, i.site, last, `${i.title}: last done ${fmtDay(last)}, next due ${fmtDay(i.due)}`, "inspections", "/security");
});

const bySite = (list) => Object.entries(list.reduce((m, x) => ({ ...m, [x.site]: [...(m[x.site] || []), x] }), {}));
const reads = (match, label, id) => (ctx) => bySite(DOOR_EVENTS.filter(match)).flatMap(([site, evs]) => {
  const bad = evs.filter((e) => e.result === "Forced" || e.result === "Held open");
  const latest = new Date(Math.max(...evs.map((e) => +e.when)));
  return [item(`${id}-${site}`, site, latest, `${evs.length} card reads at ${label} in 24 h, ${evs.filter((e) => e.result === "Denied").length} denied`, "access_control", "/security"),
    ...bad.map((e) => gapItem(`${id}-${e.id}`, site, `${e.door}: door ${e.result.toLowerCase()} ${ago(e.when, ctx.now)}`, "access_control", "/security", ctx.now))];
});

const tasks = (match, source) => (ctx) => TASKS.filter(match).map((t) => {
  const status = ctx.tasks[t.id]?.status || t.status;
  if (status === "done") return item(t.id, t.site, ctx.now, `${t.title}: done`, source, "/work");
  if (t.due < ctx.today) return gapItem(t.id, t.site, `${t.title}: overdue since ${fmtDay(t.due)}`, source, "/work", ctx.now);
  return item(t.id, t.site, collectedAt(source, ctx.now), `${t.title}: scheduled for ${fmtDay(t.due)}`, source, "/work");
});

// Machine tickets: every shift a machine runs has enough certified operators today (roster.js skillGaps).
const machineTickets = (ctx) => SITES.flatMap((s) => {
  const machines = MACHINES.filter((m) => m.site === s.id);
  const gaps = skillGaps(PEOPLE.filter((p) => p.site === s.id), machines, TODAY_INDEX);
  const shifts = machines.reduce((n, m) => n + (m.shifts || siteShifts(m.site)).length, 0);
  return [item(`tickets-${s.id}`, s.id, collectedAt("training", ctx.now), `${shifts - gaps.length} of ${shifts} machine shifts have enough certified operators today`, "training", "/people"),
    ...gaps.map((g) => gapItem(`tickets-${s.id}-${g.machine}-${g.shift}`, s.id, `${g.name}, ${g.shift.toLowerCase()} shift: ${g.have} of ${g.need} certified operators`, "training", "/people", ctx.now))];
});

// Safety tickets: a first aider on every shift at every site.
const firstAiders = (ctx) => SITES.flatMap((s) => siteShifts(s.id).map((shift) => {
  const n = PEOPLE.filter((p) => p.site === s.id && p.shift === shift && p.status === "active" && qualified(p, "first_aid", ctx.today)).length;
  return n ? item(`fa-${s.id}-${shift}`, s.id, collectedAt("training", ctx.now), `${shift} shift: ${n} first aiders with current tickets`, "training", "/people")
    : gapItem(`fa-${s.id}-${shift}`, s.id, `${shift} shift: no first aider with a current ticket`, "training", "/people", ctx.now);
}));

const permitsIssued = (ctx) => ctx.permits.map((p) => {
  const st = statusAt(p, ctx.now);
  const what = `${p.id}, ${p.area}`;
  if (st === "expired") return gapItem(p.id, p.site, `${what}: ended ${fmtDay(new Date(p.to))} but not closed out`, "permits", "/security", ctx.now);
  if (st === "closed") return item(p.id, p.site, p.closedAt ?? p.to, `${what}: issued, worked and closed`, "permits", "/security");
  if (st === "revoked") return item(p.id, p.site, p.to, `${what}: revoked`, "permits", "/security");
  return item(p.id, p.site, p.from, `${what}: open, every holder ticketed`, "permits", "/security");
});

// Entries to restricted plant areas checked against permits to work.
const secureAreas = (ctx) => bySite(DOOR_EVENTS.filter((e) => restricted(e.site, e.door))).flatMap(([site, evs]) => evs.map((e) => {
  const pm = permitFor(e, e.card, e.when, ctx.permits);
  return pm === "valid" ? item(`sa-${e.id}`, site, e.when, `${e.door}: entry on a valid permit`, "permits", "/security")
    : gapItem(`sa-${e.id}`, site, `${e.door}: entry with ${pm === "expired" ? "an expired" : "no"} permit, ${ago(e.when, ctx.now)}`, "permits", "/security", ctx.now);
}));

const drills = (ctx) => SITES.map((s) => {
  const last = ctx.rollcalls.filter((r) => r.site === s.id && r.endedAt).sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))[0];
  if (!last || +ctx.now - new Date(last.endedAt) > 183 * D) return gapItem(`drill-${s.id}`, s.id, "No drill recorded in the last 6 months", "evac", "/emergency", ctx.now);
  const missing = Array.isArray(last.missing) ? last.missing.length : Number(last.missing) || 0;
  const total = Number(last.total) || 0;
  return item(`drill-${s.id}`, s.id, last.endedAt, `${last.mode === "drill" ? "Drill" : "Roll call"}: ${total - missing} of ${total} accounted for`, "evac", "/emergency");
});

// Physical entry: card reads, leavers' cards and visitor inductions.
const leavers = (ctx) => LEAVERS.map((p, i) => (i === 0 && ctx.revoked.s1 === "Card cancelled"
  ? item(`leaver-${p.id}`, p.site, ctx.now, "Card of a former employee cancelled and logged", "hr", "/security")
  : gapItem(`leaver-${p.id}`, p.site, `Card of a former employee still active (left ${fmtDay(p.leftOn)})`, "hr", "/security", ctx.now)));
const visitors = (ctx) => VISITORS.map((v, i) => (v.inducted
  ? item(`vis-${i}`, v.site, v.since, `Visitor from ${v.company} signed in and inducted`, "visitors", "/security")
  : gapItem(`vis-${i}`, v.site, `Visitor from ${v.company} signed in but not inducted`, "visitors", "/security", ctx.now)));

const patrols = (ctx) => SITES.map((s) => item(`patrol-${s.id}`, s.id, collectedAt("guards", ctx.now), "Night patrol tour completed", "guards", "/security"));

const cameras = (ctx) => CAMERAS.flatMap((c) => [
  item(`cam-${c.site}`, c.site, collectedAt("cctv", ctx.now), `${c.total - c.offline.length} of ${c.total} cameras recording`, "cctv", "/security"),
  ...c.offline.map((name) => gapItem(`cam-${c.site}-${name}`, c.site, `Camera "${name}" offline`, "cctv", "/security", ctx.now)),
  ...(c.storageDays < 30 ? [gapItem(`cam-${c.site}-days`, c.site, `Footage kept ${c.storageDays} days, policy is 30`, "cctv", "/security", ctx.now)] : []),
]);

const screens = (ctx) => [
  ...DEVICES.map((d) => item(`lock-${d.site}`, d.site, collectedAt("devices", ctx.now), `${d.lock}% of ${d.count} devices lock after 5 minutes idle`, "devices", "/security?tab=cyber")),
  ...BAD_DEVICES.filter((d) => /screen lock/i.test(d.issue)).map((d) => gapItem(`lock-${d.name}`, d.site, `${d.name}: ${d.issue.toLowerCase()}`, "devices", "/security?tab=cyber", ctx.now)),
];

const records = (ctx) => {
  const decided = Object.keys(ctx.approvals).length;
  return [
    item("appr-routed", null, collectedAt("tasks", ctx.now), `${APPROVALS.length} requests routed by rule, each with its approver and reason`, "tasks", "/work"),
    ...(decided ? [item("appr-decided", null, ctx.now, `${decided} decisions recorded with who and when`, "tasks", "/work")] : []),
    ...(ctx.audit.length ? [item("audit-log", null, ctx.now, `${ctx.audit.length} changes in the audit trail`, "sso", "/roles")] : []),
  ];
};

const plant = (ctx) => SITES.map((s) => item(`plant-${s.id}`, s.id, collectedAt("plantdata", ctx.now), `Output and downtime recorded every shift (OEE ${s.kpi.oee}%)`, "plantdata", "/sites"));
const quality = (ctx) => SITES.map((s) => item(`ncr-${s.id}`, s.id, collectedAt("quality", ctx.now), `${s.kpi.quality} open quality issues tracked to close`, "quality", "/sites"));
const nearMisses = (ctx) => SITES.map((s) => item(`nm-${s.id}`, s.id, collectedAt("whs", ctx.now), `${s.kpi.nearMiss} near misses reported in 30 days`, "whs", "/sites"));
const incidents = (ctx) => SITES.map((s) => item(`inc-${s.id}`, s.id, collectedAt("whs", ctx.now), `${s.kpi.incidents} recordable incidents in 30 days, each investigated`, "whs", "/sites"));

// Internal audits: records held in the quality system, not elsewhere in the demo. Days since each site's last one (fixed).
const INTERNAL = { acr: 84, ips: 151, twb: 410, tsv: 240 };
const internalAudits = (ctx) => SITES.map((s) => item(`ia-${s.id}`, s.id, +ctx.now - INTERNAL[s.id] * D, `Internal audit report closed ${fmtDay(new Date(+ctx.now - INTERNAL[s.id] * D))}`, "quality", null));

// Essential Eight: maturity from the device-management snapshot against a target of level 2, plus what each strategy can show.
const TARGET = 2;
const maturity = (name) => (ctx) => {
  const lvl = ESSENTIAL_EIGHT.find(([n]) => n === name)[1];
  const what = `Maturity level ${lvl} of 3 (target ${TARGET})`;
  return [lvl < TARGET ? gapItem(`ml-${name}`, null, what, "devices", "/security?tab=cyber", ctx.now) : item(`ml-${name}`, null, collectedAt("devices", ctx.now), what, "devices", "/security?tab=cyber")];
};
const plus = (...getters) => (ctx) => getters.flatMap((g) => g(ctx));
const patchedOs = (ctx) => [
  ...DEVICES.map((d) => item(`patch-${d.site}`, d.site, collectedAt("devices", ctx.now), `${d.patched}% of ${d.count} devices up to date`, "devices", "/security?tab=cyber")),
  ...BAD_DEVICES.filter((d) => /without updates/i.test(d.issue)).map((d) => gapItem(`patch-${d.name}`, d.site, `${d.name}: ${d.issue}`, "devices", "/security?tab=cyber", ctx.now)),
];
const mfa = (ctx) => SIGNIN_ALERTS.filter((a) => /blocked/i.test(a.title)).map((a, i) => item(`mfa-${i}`, a.site, a.when, a.title, "sso", "/security?tab=cyber"));
const adminChanges = (ctx) => { const n = ctx.audit.filter((e) => /role|delegat|auditor/i.test(e.what)).length; return n ? [item("admin-log", null, ctx.now, `${n} role and access changes logged`, "sso", "/roles")] : []; };
const restoreTest = (ctx) => [item("restore", null, +ctx.now - 200 * D, `Restore test of the file servers, ${fmtDay(new Date(+ctx.now - 200 * D))}`, "itsm", null)];

// period: how fresh every piece of evidence must be, in days. Titles are short and our own.
const c = (framework, ref, title, period, evidence) => ({ id: `${framework}-${ref}`, framework, ref, title, period, evidence });
export const CONTROLS = [
  c("iso9001", "7.1.5", "Measuring equipment calibrated", 30, tasks((t) => /calibrat/i.test(t.title), "maintenance")),
  c("iso9001", "7.2", "Competence", 30, machineTickets),
  c("iso9001", "7.5", "Records kept and controlled", 30, records),
  c("iso9001", "8.5.1", "Production controlled", 7, plant),
  c("iso9001", "8.7", "Nonconforming output", 30, plus(tasks((t) => t.source === "quality", "quality"), quality)),
  c("iso9001", "9.2", "Internal audit", 365, internalAudits),
  c("iso45001", "6.1.2", "Hazards identified", 30, nearMisses),
  c("iso45001", "7.2", "Competence", 30, plus(machineTickets, firstAiders)),
  c("iso45001", "8.1", "Operational control (permits)", 30, permitsIssued),
  c("iso45001", "8.2", "Emergency preparedness", 183, drills),
  c("iso45001", "9.1", "Monitoring and inspection", 31, plus(inspections((i) => /fire door|perimeter/i.test(i.title)), incidents)),
  c("iso27001", "7.1", "Physical security perimeters", 2, plus(patrols, inspections((i) => /perimeter/i.test(i.title)))),
  c("iso27001", "7.2", "Physical entry", 1, plus(reads(() => true, "all doors", "entry"), leavers, visitors)),
  c("iso27001", "7.3", "Securing offices and rooms", 7, plus(inspections((i) => /comms room|server rack/i.test(i.title)), reads((e) => e.door === "Comms room", "the comms room", "comms"),
    (ctx) => SECURITY_ALERTS.filter((a) => a.source === "access_control" && /comms room/i.test(a.title)).map((a) => gapItem(`alert-${a.id}`, a.site, a.title, "access_control", "/security", ctx.now)))),
  c("iso27001", "7.4", "Physical security monitoring", 1, cameras),
  c("iso27001", "7.6", "Working in secure areas", 7, secureAreas),
  c("iso27001", "7.7", "Clear desk and clear screen", 7, screens),
  c("e8", "E8-1", "Application control", 30, maturity("Application control")),
  c("e8", "E8-2", "Patch applications", 30, maturity("Patch applications")),
  c("e8", "E8-3", "Configure Office macros", 30, maturity("Configure Office macros")),
  c("e8", "E8-4", "User application hardening", 30, maturity("User application hardening")),
  c("e8", "E8-5", "Restrict admin privileges", 30, plus(maturity("Restrict admin privileges"), adminChanges)),
  c("e8", "E8-6", "Patch operating systems", 30, plus(maturity("Patch operating systems"), patchedOs)),
  c("e8", "E8-7", "Multi-factor authentication", 30, plus(maturity("Multi-factor authentication"), mfa)),
  c("e8", "E8-8", "Regular backups", 180, plus(maturity("Regular backups"), restoreTest)),
];

// Security's "Physical security policies" rows, each pointing at the control that holds its evidence.
// sources: the systems whose items speak to that policy (a control can cover several policies).
export const POLICY_CONTROL = {
  "Comms rooms locked when unattended": { control: "iso27001-7.3", sources: ["access_control", "inspections"] },
  "Access cards cancelled on the last day of work": { control: "iso27001-7.2", sources: ["hr"] },
  "Visitors signed in, inducted and escorted": { control: "iso27001-7.2", sources: ["visitors"] },
  "Computers lock after 5 minutes idle": { control: "iso27001-7.7", sources: ["devices"] },
  "Perimeter checked every night": { control: "iso27001-7.1", sources: ["guards", "inspections"] },
  "CCTV kept for at least 30 days": { control: "iso27001-7.4", sources: ["cctv"] },
};

// ── Rules ──
// What the reviewer has clicked, from the store: done inspections, permits, roll calls, approvals, the audit trail, cancelled cards, tasks.
export function evidenceContext(s = {}, now = Date.now()) {
  const d = new Date(now);
  return { now, today: new Date(d.getFullYear(), d.getMonth(), d.getDate()), inspections: s.inspections || {}, permits: s.permits || PERMITS,
    rollcalls: s.rollcalls || [], approvals: s.approvals || {}, audit: s.audit || [], revoked: s.revoked || {}, tasks: s.tasks || {} };
}

// A control's evidence, for some sites (null for all). Organisation-wide items (site null) count everywhere.
export const evidenceFor = (control, ctx, sites = null) => control.evidence(ctx).filter((e) => !sites || e.site == null || sites.includes(e.site));

// "gap" when there's no evidence or any item is a finding, "stale" when any item is older than the control's period, else "evidence".
export function controlStatus(control, evidence, today = new Date()) {
  if (!evidence.length || evidence.some((e) => e.gap)) return "gap";
  return evidence.some((e) => +today - +e.date > control.period * D) ? "stale" : "evidence";
}
export const STATUS_WORD = { evidence: "Evidence found", gap: "Gap", stale: "Stale" };

// Why a control isn't "evidence found", in a few words.
export function statusReason(control, evidence, today = new Date()) {
  const st = controlStatus(control, evidence, today);
  if (st === "evidence") return `${evidence.length} item${evidence.length === 1 ? "" : "s"}, all within ${control.period} days`;
  if (st === "stale") return `Older than ${control.period} days: ${evidence.find((e) => +today - +e.date > control.period * D).what}`;
  const gaps = evidence.filter((e) => e.gap);
  return gaps.length ? `${gaps[0].gap}${gaps.length > 1 ? `, and ${gaps.length - 1} more` : ""}` : "No evidence collected yet";
}

// ── The pack an auditor takes away: a Markdown summary and a CSV, each item with a SHA-256 hash ──
export const itemLine = (control, e) => [control.id, e.site || "all", e.date.toISOString(), e.what, e.source].join("|");
export async function sha256(text) {
  if (!globalThis.crypto?.subtle) return "unavailable (needs a secure page)";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

// rows: [{ control, status, items: [{ ...item, hash }] }]
export function packFiles({ framework, siteNames, days, builtAt, by, rows }) {
  const fw = FRAMEWORKS.find((f) => f.id === framework);
  const count = (st) => rows.filter((r) => r.status === st).length;
  const md = [
    `# Audit evidence pack: ${fw.name} (${fw.sub})`, "",
    `Brolga Industries, a fictional company: every record here is demo data.`, "",
    `- Sites: ${siteNames.join(", ")}`, `- Period: the last ${days} days`, `- Built: ${new Date(builtAt).toLocaleString("en-AU")} by ${by}`,
    `- Controls: ${count("evidence")} with evidence found, ${count("gap")} with a gap, ${count("stale")} stale`, "",
    "This pack lists the evidence collected against a published control list, and the gaps. It is not a certificate.",
    "In a real deployment it would be signed, and each hash checked against the tamper-evident audit log (roadmap B.5).", "",
    "| Ref | Control | Status | Items |", "|---|---|---|---|",
    ...rows.map((r) => `| ${r.control.ref} | ${r.control.title} | ${STATUS_WORD[r.status]} | ${r.items.length} |`), "",
    ...rows.flatMap((r) => [`## ${r.control.ref} ${r.control.title}: ${STATUS_WORD[r.status]}`, "",
      ...(r.items.length ? r.items.map((e) => `- ${e.date.toISOString().slice(0, 10)} · ${e.site ? siteName(e.site) : "all sites"} · ${e.gap ? "Gap: " : ""}${e.what} · sha256 \`${e.hash}\``) : ["- No evidence collected yet"]), ""]),
  ].join("\n");
  const csv = [["framework", "ref", "control", "status", "site", "date", "evidence", "gap", "source", "sha256"].join(","),
    ...rows.flatMap((r) => r.items.map((e) => [fw.name, r.control.ref, r.control.title, STATUS_WORD[r.status], e.site ? siteName(e.site) : "All sites", e.date.toISOString(), e.what, e.gap ? "yes" : "no", e.source, e.hash].map(csvCell).join(",")))].join("\n");
  return { md, csv };
}

// Items inside the period (findings always count: they're open now).
export const inPeriod = (items, days, now = Date.now()) => items.filter((e) => e.gap || +now - +e.date <= days * D);
