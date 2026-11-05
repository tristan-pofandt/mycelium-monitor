// The cards a Home can hold (feature 10, docs/demo-features-plan.md): the same idea as web/src/panels/index.js.
// Each entry is { id, title, cap?, roles?, notFor?, sizes, full?, component }: `cap` is the permission the role needs, `roles`
// limits a card to some personas (each persona's own key figures or records), `notFor` keeps it from personas whose scope is
// narrower than the card (the Site Manager sees one site, so not the four-site comparison), `sizes` the widths it may take (1 or 2 columns), `full` a card that
// always takes the whole row. A component gets { persona, me } and renders one card. DEFAULT_LAYOUTS reproduce the six homes
// as they were hand-written before the registry, so nothing looks different until someone customises.
import { Link } from "react-router";
import { CountUp, KpiTile } from "../charts.jsx";
import { Icon } from "../icons.jsx";
import { DEVICES, EVENTS, INSPECTIONS, LEAVERS, OUTPUT, SIGNIN_ALERTS, SITES, TICKETS, VISITORS, CAMERAS, dayOffset, fmtDay, inScope, person, siteName, under, WEEK_START } from "./data.js";
import { dayLabel, useLiveSites, useRosterCoverage } from "./roster.js";
import { ApprovalsList, AlertsList, RoundLink, SourceNote, TaskRow, useAlerts, useApprovals, useTasks } from "./bits.jsx";
import { Assumed } from "./feedback.jsx";
import { WeatherCard } from "./weather.jsx";
import { RollCallCard } from "./rollcall.jsx";
import { AuditGapsCard } from "./controls.jsx";
import { DocumentsCard } from "./docs.jsx";
import { usePermits } from "./permits.jsx";
import { statusAt, typeName } from "./permits.js";
import { useSkillGaps } from "./skills.jsx";
import { useDemo, usePersona } from "./store.js";
import "./homecards.css";

const avg = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
const yesterday = (site) => OUTPUT.find((o) => o.site === site).days.at(-1).units;

export function Card({ title, sub, to, label, children, className = "" }) {
  return (
    <section className={`panel-card ${className}`}>
      <div className="card-head">
        <div><h2>{title}</h2>{sub && <p className="card-sub">{sub}</p>}</div>
        {to && <RoundLink to={to} label={label} />}
      </div>
      {children}
    </section>
  );
}

function TodayEvents({ site, shift }) {
  const today = (dayOffset(0) - WEEK_START) / 864e5;
  const list = [
    ...(shift ? [{ id: "shift", start: shift === "Day" ? 6 : 14, title: `Your ${shift.toLowerCase()} shift, until ${shift === "Day" ? "14:00" : "22:00"}`, site, type: "Shift" }] : []),
    ...EVENTS.filter((e) => e.day === Math.round(today) && (!site || e.site === site || e.site === "hq")),
  ];
  return list.length ? (
    <ul className="queue" role="list">{list.map((e) => <li key={e.id} className="queue-item"><p><strong>{e.start}:00</strong> {e.title}</p><p className="muted small">{siteName(e.site)} · {e.type}</p></li>)}</ul>
  ) : <p className="muted">Nothing on the calendar today. <Link to="/calendar">See the week</Link></p>;
}

function SitesGlance() {
  const live = useLiveSites();
  return (
    <Card title="Sites at a glance" sub="Worst figures flagged" to="/sites" label="Open sites">
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">Sites at a glance</caption>
          <thead><tr><th scope="col">Site</th><th scope="col">OEE</th><th scope="col">Overdue work orders</th><th scope="col">Roster coverage</th><th scope="col">Incidents (30 d)</th></tr></thead>
          <tbody>{live.map((s) => (
            <tr key={s.id}>
              <th scope="row"><Link to={`/sites?site=${s.id}`}>{s.name}</Link></th>
              <td className={s.kpi.oee < 75 ? "late" : ""}>{s.kpi.oee}%</td>
              <td className={s.kpi.overdue > 15 ? "late" : ""}>{s.kpi.overdue}</td>
              <td className={s.kpi.coverage < 90 ? "late" : ""}>{s.kpi.coverage}%</td>
              <td>{s.kpi.incidents}</td>
            </tr>
          ))}</tbody>
        </table>
        <SourceNote ids={["plantdata", "maintenance", "rostering", "whs"]} />
      </div>
    </Card>
  );
}

// ── Key figures: one row per persona ──
function GmKpis() {
  const { pending } = useApprovals();
  return (
    <dl className="kpis">
      <KpiTile icon="usage" label="Units built yesterday, all sites" value={<CountUp value={SITES.reduce((n, s) => n + yesterday(s.id), 0)} format={(v) => v.toLocaleString()} />} to="/sites" linkLabel="Open sites" />
      <KpiTile icon="status" label="Average OEE this week" value={<CountUp value={avg(SITES.map((s) => s.kpi.oee))} format={(v) => `${v}%`} />} to="/sites" linkLabel="Open sites" />
      <KpiTile icon="errors" label="Safety incidents, last 30 days" value={<CountUp value={SITES.reduce((n, s) => n + s.kpi.incidents, 0)} />} to="/sites" linkLabel="Open sites" />
      <KpiTile icon="check" label="Approvals waiting for you" value={<CountUp value={pending.length} />} to="/work" linkLabel="Open approvals" />
    </dl>
  );
}
function SiteKpis({ me }) {
  const s = useLiveSites().find((x) => x.id === me.site);
  return (
    <dl className="kpis">
      <KpiTile icon="usage" label="Units built yesterday" value={<CountUp value={yesterday(me.site)} />} to="/sites" linkLabel="Open site" />
      <KpiTile icon="status" label="OEE this week" value={<CountUp value={s.kpi.oee} format={(v) => `${v}%`} />} to="/sites" linkLabel="Open site" />
      <KpiTile icon="latency" label="Unplanned downtime, 7 days" value={<CountUp value={s.kpi.downtime} format={(v) => `${v} h`} />} to="/sites" linkLabel="Open site" />
      <KpiTile icon="check" label="Roster coverage, next 7 days" value={<CountUp value={s.kpi.coverage} format={(v) => `${v}%`} />} to="/rosters" linkLabel="Open rosters" />
    </dl>
  );
}
function EmployeeKpis({ me }) {
  const mine = useTasks("mine");
  return (
    <dl className="kpis">
      <KpiTile icon="clock" label="Annual leave balance" value="11.5 days" />
      <KpiTile icon="check" label="My open tasks" value={String(mine.filter((t) => t.status !== "done").length)} to="/work" linkLabel="Open my work" />
      <KpiTile icon="access" label={`Access card ${me.card}`} value="Active" />
    </dl>
  );
}
function SecurityKpis() {
  return (
    <dl className="kpis">
      <KpiTile icon="errors" label="Open alerts" value={String(useAlerts().filter((a) => !a.done).length)} to="/security" linkLabel="Open security" />
      <KpiTile icon="map" label="Visitors on site now" value={String(VISITORS.length)} to="/security" linkLabel="Open security" />
      <KpiTile icon="status" label="Cameras offline" value={String(CAMERAS.reduce((n, c) => n + c.offline.length, 0))} to="/security" linkLabel="Open security" />
    </dl>
  );
}
function ItKpis() {
  const answers = useDemo((s) => s.answers);
  return (
    <dl className="kpis">
      <KpiTile icon="terminal" label="Devices locking after 5 minutes" value={`${avg(DEVICES.map((d) => d.lock))}%`} to="/security?tab=cyber" linkLabel="Open cyber security" />
      <KpiTile icon="errors" label="Risky sign-ins this week" value={String(SIGNIN_ALERTS.length)} to="/security?tab=cyber" linkLabel="Open cyber security" />
      <KpiTile icon="settings" label="Systems confirmed by your team" value={`${Object.keys(answers).length}`} to="/systems" linkLabel="Open your systems" />
    </dl>
  );
}

function Brief() {
  const { pending } = useApprovals();
  return (
    <section className="insight" aria-label="Daily brief">
      <span className="insight-icon" aria-hidden="true"><Icon name="spark" /></span>
      <p>{`Overnight: Ipswich lost 2.1 hours on press line 2, a former employee's card opened Gate 2, and Toowoomba's comms room inspection is 3 days overdue. ${pending.length} approvals are waiting, including Saturday's shutdown.`}</p>
    </section>
  );
}

// ── Shared cards, worded for the persona ──
function Approvals({ persona }) {
  if (persona === "supervisor") return <Card title="Waiting for your approval" sub="Leave and roster swaps from your team" to="/work" label="Open approvals"><ApprovalsList limit={3} compact /></Card>;
  return <Card title="Waiting for your approval" to="/work" label="Open approvals" className="approvals-card"><ApprovalsList limit={3} compact /></Card>;
}
function OpenTasks({ persona }) {
  const tasks = useTasks().filter((t) => t.status !== "done").slice(0, 5);
  return (
    <Card title={TASKS_TITLE(persona)} to="/work" label="Open work">
      {tasks.length ? <ul className="tasks" role="list">{tasks.map((t) => <TaskRow key={t.id} t={t} />)}</ul>
        : <p className="muted">No open tasks{persona === "supervisor" ? " in your team" : persona === "site_manager" ? " at your site" : ""}. <Link to="/work">Hand one out on Work</Link></p>}
    </Card>
  );
}
const TASKS_TITLE = (p) => (p === "supervisor" ? "Team tasks" : p === "site_manager" ? "Open tasks at your site" : "Open tasks");
function Alerts({ persona }) {
  const alerts = useAlerts().filter((a) => !a.done);
  if (persona === "security") return <Card title="Alerts" to="/security" label="Open security"><AlertsList /></Card>;
  if (persona === "site_manager") return <Card title="Security at your site" to="/security" label="Open security"><AlertsList limit={3} /></Card>;
  return <Card title="Security" sub={`${alerts.length} open alerts across all sites`} to="/security" label="Open security"><AlertsList limit={3} /></Card>;
}
const ALERTS_TITLE = (p) => (p === "security" ? "Alerts" : p === "site_manager" ? "Security at your site" : "Security");
function Today({ persona, me }) {
  const site = persona === "gm" ? undefined : me.site;
  const shift = ["supervisor", "employee"].includes(persona) ? me.shift : undefined;
  return <Card title="Today" to="/calendar" label="Open calendar"><TodayEvents site={site} shift={shift} /></Card>;
}
function Certs({ me }) {
  const certs = under(me.id).flatMap((p) => p.certs.map((c) => ({ ...c, who: p.name })));
  return (
    <Card title="Certificates expiring" sub="From HR records">
      {certs.length ? <ul className="queue" role="list">{certs.map((c) => <li key={c.who + c.name} className="queue-item"><p><strong>{c.who}</strong>: {c.name}</p><p className="late small">Expires {fmtDay(c.expires)}</p></li>)}</ul> : <p className="muted">None in the next 4 weeks.</p>}
      <SourceNote ids={["hr"]} />
    </Card>
  );
}
function Tickets() {
  return (
    <Card title="My IT tickets" sub="Raised by you">
      <ul className="queue" role="list">{TICKETS.map((t) => <li key={t.id} className="queue-item"><p><strong>{t.title}</strong></p><p className="muted small">{t.id} · {t.status} · opened {fmtDay(t.opened)}</p></li>)}</ul>
      <SourceNote ids={["itsm"]} />
    </Card>
  );
}
function MyTasks() {
  const open = useTasks("mine").filter((t) => t.status !== "done");
  return (
    <Card title="My tasks" to="/work" label="Open my work">
      {open.length ? <ul className="tasks" role="list">{open.map((t) => <TaskRow key={t.id} t={t} />)}</ul>
        : <p className="muted">Nothing assigned to you right now. When your supervisor hands you a task, it shows here and in your phone app.</p>}
    </Card>
  );
}
function MyRequests() {
  const { sent, status } = useApprovals();
  return (
    <Card title="My requests" to="/work" label="Open my requests">
      {sent.length ? <ul className="queue" role="list">{sent.map((a) => <li key={a.id} className="queue-item"><p>{a.title}</p><p className="muted small">{status(a) || "Waiting for approval"}</p></li>)}</ul>
        : <p className="muted">No open requests. Leave and shift swaps you ask for appear here with their approval status. <Link to="/work">Make a request</Link></p>}
    </Card>
  );
}
function MyData() {
  return <Card title="What we hold about you" to="/my-data" label="Open my data"><p className="muted">Your record, where each part came from, who can see it and who has looked. <Link to="/my-data">See my data</Link></p></Card>;
}
function Systems() {
  return (
    <Card title="Connected systems" sub="What this demo assumes you run" to="/systems" label="Open your systems">
      <ul className="sys-list" role="list">{["sso", "devices", "erp", "hr", "rostering", "itsm", "access_control", "cctv"].map((id) => <li key={id}><Assumed id={id} /></li>)}</ul>
    </Card>
  );
}
function AccessReview() {
  return (
    <Card title="Access review due" sub="Quarterly check that people still need what they have">
      <p>Due {fmtDay(dayOffset(12))}. Each manager confirms their team's roles in a few clicks; you see who hasn't.</p>
      <Link to="/roles" className="button">Open roles and permissions</Link>
    </Card>
  );
}

// ── Cards from the newer features ──
// Permits open now, compact: the full card with close and revoke lives on Work.
function PermitsNow() {
  const open = usePermits().filter((pm) => statusAt(pm) === "open" && pm.from <= Date.now());
  return (
    <Card title="Permits open now" sub="Only holders should badge into the area's doors" to="/work" label="Open permits on Work">
      {open.length ? <ul className="queue" role="list">{open.slice(0, 4).map((pm) => (
        <li key={pm.id} className="queue-item">
          <p><span className="badge badge-ok">Open</span> <strong>{typeName(pm.type)} · {pm.area}</strong></p>
          <p className="muted small">{siteName(pm.site)} · until {new Date(pm.to).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {pm.holders.length} holder{pm.holders.length === 1 ? "" : "s"}</p>
        </li>
      ))}</ul> : <p className="muted">No permits open in your area right now.</p>}
      {open.length > 4 && <p className="muted small">And {open.length - 4} more on Work.</p>}
      <SourceNote ids={["permits", "access_control"]} />
    </Card>
  );
}

// Sites in this persona's view that have rostered teams.
const floorSites = (p) => SITES.filter((s) => s.id !== "hq" && inScope(p).some((x) => x.site === s.id && x.status === "active")).map((s) => s.id);

function SiteCoverage({ site }) {
  const { percent, short } = useRosterCoverage(site);
  return (
    <li className="queue-item">
      <p><strong>{siteName(site)}</strong>: {percent}% covered{short.length ? "" : ", no short shifts"}</p>
      {short.length > 0 && <p className="late small">Short: {short.slice(0, 3).map((c) => `${dayLabel(c.day)} ${c.shift.toLowerCase()} (${c.have} of ${c.need})`).join(", ")}{short.length > 3 ? `, and ${short.length - 3} more` : ""}</p>}
    </li>
  );
}
function Coverage() {
  const sites = floorSites(usePersona());
  return (
    <Card title="Roster coverage" sub="Next 7 days, against the headcount each shift needs" to="/rosters" label="Open rosters">
      <ul className="queue" role="list">{sites.map((s) => <SiteCoverage key={s} site={s} />)}</ul>
      <SourceNote ids={["rostering", "hr"]} />
    </Card>
  );
}

function SkillGaps({ persona, me }) {
  const gaps = useSkillGaps(floorSites(usePersona()), persona === "supervisor" ? me.shift : null);
  return (
    <Card title="Skills gaps" sub="Shifts without enough certified operators, next two weeks" to="/people" label="Open people (Skills view)">
      {gaps.length ? <ul className="queue" role="list">{gaps.slice(0, 4).map((g) => (
        <li key={`${g.site}${g.shift}${g.machine}`} className="queue-item">
          <p><span className="badge badge-bad">Gap</span> <strong>{siteName(g.site)}, {g.shift.toLowerCase()} shift: {g.name}</strong></p>
          <p className="muted small">{g.have ? `Only ${g.have} of ${g.need} people` : "Nobody"} with a current ticket from {dayLabel(g.day)}.</p>
        </li>
      ))}</ul> : <p className="muted">Every machine in your view has enough certified people on every shift.</p>}
      {gaps.length > 4 && <p className="muted small">And {gaps.length - 4} more in People, Skills.</p>}
      <SourceNote ids={["training", "rostering"]} />
    </Card>
  );
}

export const HOME_CARDS = [
  { id: "kpis-gm", title: "Key figures", roles: ["gm"], full: true, sizes: [2], component: GmKpis },
  { id: "kpis-site", title: "Key figures", roles: ["site_manager"], full: true, sizes: [2], component: SiteKpis },
  { id: "kpis-employee", title: "Key figures", roles: ["employee"], full: true, sizes: [2], component: EmployeeKpis },
  { id: "kpis-security", title: "Key figures", roles: ["security"], full: true, sizes: [2], component: SecurityKpis },
  { id: "kpis-it", title: "Key figures", roles: ["it"], full: true, sizes: [2], component: ItKpis },
  { id: "brief", title: "Daily brief", roles: ["gm"], full: true, sizes: [2], component: Brief },
  { id: "approvals", title: "Waiting for your approval", cap: "approveLeave", sizes: [1, 2], component: Approvals },
  { id: "tasks", title: TASKS_TITLE, cap: "assign", sizes: [1, 2], component: OpenTasks },
  { id: "alerts", title: ALERTS_TITLE, cap: "security", sizes: [1, 2], component: Alerts },
  { id: "today", title: "Today", sizes: [1, 2], component: Today },
  { id: "weather", title: "Weather and roads", sizes: [1, 2], component: WeatherCard },
  { id: "sites", title: "Sites at a glance", cap: "sites", notFor: ["site_manager"], full: true, sizes: [2], component: SitesGlance },
  { id: "certs", title: "Certificates expiring", roles: ["supervisor"], sizes: [1, 2], component: Certs },
  { id: "tickets", title: "My IT tickets", roles: ["employee"], sizes: [1, 2], component: Tickets },
  { id: "mytasks", title: "My tasks", sizes: [1, 2], component: MyTasks },
  { id: "requests", title: "My requests", sizes: [1, 2], component: MyRequests },
  { id: "mydata", title: "What we hold about you", sizes: [1, 2], component: MyData },
  { id: "systems", title: "Connected systems", cap: "devices", sizes: [1, 2], component: Systems },
  { id: "access-review", title: "Access review due", cap: "roles", sizes: [1, 2], component: AccessReview },
  { id: "rollcall", title: "Roll call", cap: "emergency", sizes: [1, 2], component: RollCallCard },
  { id: "audit", title: "Audit evidence", cap: "audit", sizes: [1, 2], component: AuditGapsCard },
  { id: "documents", title: "Documents", cap: "finance", sizes: [1, 2], component: DocumentsCard },
  { id: "permits", title: "Permits open now", cap: "permits", sizes: [1, 2], component: PermitsNow },
  { id: "coverage", title: "Roster coverage", cap: "roster", sizes: [1, 2], component: Coverage },
  { id: "skills", title: "Skills gaps", cap: "people", sizes: [1, 2], component: SkillGaps },
];

const L = (...ids) => ids.map((x) => (Array.isArray(x) ? { id: x[0], size: x[1] } : { id: x, size: HOME_CARDS.find((c) => c.id === x).sizes[0] }));
export const DEFAULT_LAYOUTS = {
  gm: L("kpis-gm", "brief", "approvals", "alerts", "today", "weather", ["sites", 2]),
  site_manager: L("kpis-site", "approvals", "tasks", "alerts", "today", "weather"),
  supervisor: L("approvals", "tasks", "certs", "today", "weather"),
  employee: L("kpis-employee", "tickets", "mytasks", "requests", "today", "weather", "mydata"),
  security: L("kpis-security", ["alerts", 2], "weather"),
  it: L("kpis-it", ["systems", 2], "access-review", "weather"),
};
