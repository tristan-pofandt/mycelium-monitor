// Home: one page, six different views. What each persona sees first is what their job needs first.
import { Link, useNavigate } from "react-router";
import { CountUp, KpiTile } from "../../charts.jsx";
import { Icon } from "../../icons.jsx";
import { CAMERAS, DEVICES, EVENTS, INSPECTIONS, LEAVERS, OUTPUT, SIGNIN_ALERTS, SITES, TICKETS, VISITORS, dayOffset, fmtDay, person, siteName, under, WEEK_START } from "../data.js";
import { useLiveSites } from "../roster.js";
import { ApprovalsList, AlertsList, RoundLink, SourceNote, TaskRow, useAlerts, useApprovals, useTasks } from "../bits.jsx";
import { Assumed } from "../feedback.jsx";
import { WeatherCard } from "../weather.jsx";
import { update, useDemo, usePersona } from "../store.js";

const updatedAt = new Date(Date.now() - 3 * 60e3).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };
const avg = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
const yesterday = (site) => OUTPUT.find((o) => o.site === site).days.at(-1).units;

function Greeting({ line, bad }) {
  const p = usePersona();
  return (
    <div className="greeting">
      <h1><span className="rise-mask"><span className="rise">{greeting()}, {person(p.person).name.split(" ")[0]}</span></span></h1>
      <p className={`state-line state-${bad ? "bad" : "ok"}`}>
        <span className={`badge ${bad ? "badge-bad" : "badge-ok"}`}><Icon name={bad ? "down" : "up"} />{bad ? "Needs attention" : "On track"}</span>
        <span>{line}</span>
        <span className="muted small">Updated {updatedAt}</span>
      </p>
    </div>
  );
}

function Card({ title, sub, to, label, children, className = "" }) {
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

function Brief({ text }) {
  return (
    <section className="insight" aria-label="Daily brief">
      <span className="insight-icon" aria-hidden="true"><Icon name="spark" /></span>
      <p>{text}</p>
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
  );
}

// First visit: what Mycelium is in one line, and three things worth trying. Hidden once dismissed (Reset brings it back).
function StartStrip() {
  const navigate = useNavigate();
  const hidden = useDemo((s) => s.introHidden);
  if (hidden) return null;
  const approve = () => {
    const btn = document.querySelector(".approvals-card .button-primary");
    btn?.scrollIntoView({ block: "center" });
    btn?.focus({ preventScroll: true });
  };
  return (
    <section className="panel-card start-strip" aria-labelledby="start-h">
      <div>
        <h2 id="start-h">Start here</h2>
        <p>Mycelium puts every site's operations, people, schedules and security on one screen, and shows each person only what their role needs.</p>
      </div>
      <div className="actions">
        <button type="button" className="button button-primary" onClick={approve}>Approve Saturday's shutdown</button>
        <button type="button" className="button" onClick={() => update(() => ({ viewer: "site_manager" }))}>See it as a Site Manager</button>
        <button type="button" className="button" onClick={() => navigate("/systems")}>Check our guesses about your systems</button>
        <Link to="/about" className="button">Full guide</Link>
        <button type="button" className="link small" onClick={() => update(() => ({ introHidden: true }))}>Hide this</button>
      </div>
    </section>
  );
}

function GmHome() {
  const { pending } = useApprovals();
  const alerts = useAlerts().filter((a) => !a.done);
  return (
    <>
      <Greeting bad line={`2 sites need you today: Ipswich has 23 overdue work orders, and Toowoomba's roster is ${useLiveSites().find((s) => s.id === "twb").kpi.coverage}% covered for the next 7 days.`} />
      <StartStrip />
      <dl className="kpis">
        <KpiTile icon="usage" label="Units built yesterday, all sites" value={<CountUp value={SITES.reduce((n, s) => n + yesterday(s.id), 0)} format={(v) => v.toLocaleString()} />} to="/sites" linkLabel="Open sites" />
        <KpiTile icon="status" label="Average OEE this week" value={<CountUp value={avg(SITES.map((s) => s.kpi.oee))} format={(v) => `${v}%`} />} to="/sites" linkLabel="Open sites" />
        <KpiTile icon="errors" label="Safety incidents, last 30 days" value={<CountUp value={SITES.reduce((n, s) => n + s.kpi.incidents, 0)} />} to="/sites" linkLabel="Open sites" />
        <KpiTile icon="check" label="Approvals waiting for you" value={<CountUp value={pending.length} />} to="/work" linkLabel="Open approvals" />
      </dl>
      <Brief text={`Overnight: Ipswich lost 2.1 hours on press line 2, a former employee's card opened Gate 2, and Toowoomba's comms room inspection is 3 days overdue. ${pending.length} approvals are waiting, including Saturday's shutdown.`} />
      <Card title="Waiting for your approval" to="/work" label="Open approvals" className="approvals-card"><ApprovalsList limit={3} compact /></Card>
      <Card title="Security" sub={`${alerts.length} open alerts across all sites`} to="/security" label="Open security"><AlertsList limit={3} /></Card>
      <Card title="Today" to="/calendar" label="Open calendar"><TodayEvents /></Card>
      <WeatherCard />
      <Card title="Sites at a glance" sub="Worst figures flagged" to="/sites" label="Open sites" className="span-2"><SitesGlance /></Card>
    </>
  );
}

function SiteHome({ site }) {
  const s = useLiveSites().find((x) => x.id === site);
  const tasks = useTasks().filter((t) => t.status !== "done").slice(0, 5);
  return (
    <>
      <Greeting bad line={`${s.name}: ${s.kpi.overdue} overdue work orders and OEE at ${s.kpi.oee}%, the lowest of the four sites.`} />
      <dl className="kpis">
        <KpiTile icon="usage" label="Units built yesterday" value={<CountUp value={yesterday(site)} />} to="/sites" linkLabel="Open site" />
        <KpiTile icon="status" label="OEE this week" value={<CountUp value={s.kpi.oee} format={(v) => `${v}%`} />} to="/sites" linkLabel="Open site" />
        <KpiTile icon="latency" label="Unplanned downtime, 7 days" value={<CountUp value={s.kpi.downtime} format={(v) => `${v} h`} />} to="/sites" linkLabel="Open site" />
        <KpiTile icon="check" label="Roster coverage, next 7 days" value={<CountUp value={s.kpi.coverage} format={(v) => `${v}%`} />} to="/rosters" linkLabel="Open rosters" />
      </dl>
      <Card title="Waiting for your approval" to="/work" label="Open approvals" className="approvals-card"><ApprovalsList limit={3} compact /></Card>
      <Card title="Open tasks at your site" to="/work" label="Open work"><ul className="tasks" role="list">{tasks.map((t) => <TaskRow key={t.id} t={t} />)}</ul></Card>
      <Card title="Security at your site" to="/security" label="Open security"><AlertsList limit={3} /></Card>
      <Card title="Today" to="/calendar" label="Open calendar"><TodayEvents site={site} /></Card>
      <WeatherCard />
    </>
  );
}

function SupervisorHome({ me }) {
  const team = under(me.id);
  const certs = team.flatMap((p) => p.certs.map((c) => ({ ...c, who: p.name })));
  const tasks = useTasks().filter((t) => t.status !== "done").slice(0, 5);
  return (
    <>
      <Greeting line={`Your ${me.shift.toLowerCase()} shift team: ${team.length} people. ${certs.length ? `${certs.length} certificates expire within 4 weeks.` : ""}`} bad={certs.length > 0} />
      <Card title="Waiting for your approval" sub="Leave and roster swaps from your team" to="/work" label="Open approvals"><ApprovalsList limit={3} compact /></Card>
      <Card title="Team tasks" to="/work" label="Open work"><ul className="tasks" role="list">{tasks.map((t) => <TaskRow key={t.id} t={t} />)}</ul></Card>
      <Card title="Certificates expiring" sub="From HR records">
        {certs.length ? <ul className="queue" role="list">{certs.map((c) => <li key={c.who + c.name} className="queue-item"><p><strong>{c.who}</strong>: {c.name}</p><p className="late small">Expires {fmtDay(c.expires)}</p></li>)}</ul> : <p className="muted">None in the next 4 weeks.</p>}
        <SourceNote ids={["hr"]} />
      </Card>
      <Card title="Today" to="/calendar" label="Open calendar"><TodayEvents site={me.site} shift={me.shift} /></Card>
      <WeatherCard />
    </>
  );
}

function EmployeeHome({ me }) {
  const mine = useTasks("mine");
  const { sent, status } = useApprovals();
  return (
    <>
      <Greeting line={`You're on the ${me.shift.toLowerCase()} shift today at ${siteName(me.site)}, ${me.shift === "Day" ? "6:00 to 14:00" : "14:00 to 22:00"}.`} />
      <dl className="kpis">
        <KpiTile icon="clock" label="Annual leave balance" value="11.5 days" />
        <KpiTile icon="check" label="My open tasks" value={String(mine.filter((t) => t.status !== "done").length)} to="/work" linkLabel="Open my work" />
        <KpiTile icon="access" label={`Access card ${me.card}`} value="Active" />
      </dl>
      <Card title="My IT tickets" sub="Raised by you">
        <ul className="queue" role="list">{TICKETS.map((t) => <li key={t.id} className="queue-item"><p><strong>{t.title}</strong></p><p className="muted small">{t.id} · {t.status} · opened {fmtDay(t.opened)}</p></li>)}</ul>
        <SourceNote ids={["itsm"]} />
      </Card>
      <Card title="My tasks" to="/work" label="Open my work">
        {mine.filter((t) => t.status !== "done").length ? <ul className="tasks" role="list">{mine.filter((t) => t.status !== "done").map((t) => <TaskRow key={t.id} t={t} />)}</ul>
          : <p className="muted">Nothing assigned to you right now. When your supervisor hands you a task, it shows here and in your phone app.</p>}
      </Card>
      <Card title="My requests" to="/work" label="Open my requests">
        {sent.length ? <ul className="queue" role="list">{sent.map((a) => <li key={a.id} className="queue-item"><p>{a.title}</p><p className="muted small">{status(a) || "Waiting for approval"}</p></li>)}</ul>
          : <p className="muted">No open requests. Leave and shift swaps you ask for appear here with their approval status. <Link to="/work">Make a request</Link></p>}
      </Card>
      <Card title="Today" to="/calendar" label="Open calendar"><TodayEvents site={me.site} shift={me.shift} /></Card>
      <WeatherCard />
      <Card title="What we hold about you" to="/my-data" label="Open my data"><p className="muted">Your record, where each part came from, who can see it and who has looked. <Link to="/my-data">See my data</Link></p></Card>
    </>
  );
}

function SecurityHome() {
  const overdue = INSPECTIONS.filter((i) => i.due < dayOffset(0));
  return (
    <>
      <Greeting bad line={`${LEAVERS.length} former employees still have active cards, and ${overdue.length} inspections are overdue.`} />
      <dl className="kpis">
        <KpiTile icon="errors" label="Open alerts" value={String(useAlerts().filter((a) => !a.done).length)} to="/security" linkLabel="Open security" />
        <KpiTile icon="map" label="Visitors on site now" value={String(VISITORS.length)} to="/security" linkLabel="Open security" />
        <KpiTile icon="status" label="Cameras offline" value={String(CAMERAS.reduce((n, c) => n + c.offline.length, 0))} to="/security" linkLabel="Open security" />
      </dl>
      <Card title="Alerts" to="/security" label="Open security" className="span-2"><AlertsList /></Card>
      <WeatherCard />
    </>
  );
}

function ItHome() {
  const devices = DEVICES.reduce((n, d) => n + d.count, 0);
  const answers = useDemo((s) => s.answers);
  return (
    <>
      <Greeting bad line={`${devices} managed devices; 5 are out of policy. 2 risky sign-ins this week.`} />
      <dl className="kpis">
        <KpiTile icon="terminal" label="Devices locking after 5 minutes" value={`${avg(DEVICES.map((d) => d.lock))}%`} to="/security?tab=cyber" linkLabel="Open cyber security" />
        <KpiTile icon="errors" label="Risky sign-ins this week" value={String(SIGNIN_ALERTS.length)} to="/security?tab=cyber" linkLabel="Open cyber security" />
        <KpiTile icon="settings" label="Systems confirmed by your team" value={`${Object.keys(answers).length}`} to="/systems" linkLabel="Open your systems" />
      </dl>
      <Card title="Connected systems" sub="What this demo assumes you run" to="/systems" label="Open your systems" className="span-2">
        <ul className="sys-list" role="list">{["sso", "devices", "erp", "hr", "rostering", "itsm", "access_control", "cctv"].map((id) => <li key={id}><Assumed id={id} /></li>)}</ul>
      </Card>
      <Card title="Access review due" sub="Quarterly check that people still need what they have">
        <p>Due {fmtDay(dayOffset(12))}. Each manager confirms their team's roles in a few clicks; you see who hasn't.</p>
        <Link to="/roles" className="button">Open roles and permissions</Link>
      </Card>
      <WeatherCard />
    </>
  );
}

export default function Home() {
  const p = usePersona();
  const me = person(p.person);
  if (p.id === "gm") return <GmHome />;
  if (p.id === "site_manager") return <SiteHome site={me.site} />;
  if (p.id === "supervisor") return <SupervisorHome me={me} />;
  if (p.id === "employee") return <EmployeeHome me={me} />;
  if (p.id === "security") return <SecurityHome />;
  return <ItHome />;
}
