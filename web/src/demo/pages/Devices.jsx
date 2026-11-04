// Cyber security tab of Security (pages/Security.jsx): compliance read from the device management system (Mycelium checks and reports; your existing tools
// enforce), risky sign-ins, and an Essential Eight snapshot estimated from the same data.
import { Link } from "react-router";
import { Table } from "../../charts.jsx";
import { BAD_DEVICES, DEVICES, ESSENTIAL_EIGHT, SIGNIN_ALERTS, fmtAgo, person, siteName } from "../data.js";
import { SourceNote } from "../bits.jsx";
import { usePersona } from "../store.js";

const pct = (v, warn = 95) => <span className={v < warn ? "late" : ""}>{v}%</span>;

export default function Devices() {
  const p = usePersona();
  const site = p.id === "site_manager" ? person(p.person).site : null;
  const mine = (x) => !site || x.site === site;
  return (
    <>
      <section className="panel-card span-2">
        <div className="card-head"><div><h2>Device compliance by site</h2><p className="card-sub">Below 95% is flagged. Mycelium only reads these settings; your device management enforces them. <Link to="/about#it">How this would run in your environment</Link></p></div></div>
        <Table caption="Device compliance" head={["Site", "Devices", "Lock after 5 min idle", "Disk encrypted", "Updates within 14 days", "Antivirus current"]}
          keys={DEVICES.filter(mine).map((d) => [siteName(d.site), d.count, d.lock, d.encrypted, d.patched, d.av])}
          rows={DEVICES.filter(mine).map((d) => [siteName(d.site), d.count, pct(d.lock), pct(d.encrypted), pct(d.patched, 90), pct(d.av)])} />
        <SourceNote ids={["devices"]} />
      </section>
      <section className="panel-card">
        <h2>Out of policy</h2>
        <ul className="queue" role="list">{BAD_DEVICES.filter(mine).map((d) => (
          <li key={d.name} className="queue-item"><p><strong className="mono">{d.name}</strong></p><p className="muted small">{d.issue} · {siteName(d.site)} · checked {fmtAgo(d.seen)}</p></li>
        ))}</ul>
        <p className="muted small">Fixes go through your normal tools. A later version could offer one approved action, such as re-applying the lock-screen policy.</p>
      </section>
      <section className="panel-card">
        <h2>Risky sign-ins</h2>
        <ul className="queue" role="list">{SIGNIN_ALERTS.filter(mine).map((s) => (
          <li key={s.title} className="queue-item"><p>{s.title}</p><p className="muted small">{siteName(s.site)} · {fmtAgo(s.when)}</p></li>
        ))}</ul>
        <SourceNote ids={["sso"]} />
      </section>
      <section className="panel-card">
        <h2>Essential Eight snapshot</h2>
        <p className="muted small">Estimated maturity (0 to 3) from the data above. A guide to gaps, not an assessment.</p>
        <ul className="meters" role="list">{ESSENTIAL_EIGHT.map(([name, level]) => (
          <li key={name}>
            <span>{name}</span>
            <span className="meter-wrap"><span className="meter" aria-hidden="true">{[1, 2, 3].map((i) => <span key={i} className={i <= level ? "on" : ""} />)}</span><span className="small">Level {level} of 3</span></span>
          </li>
        ))}</ul>
      </section>
    </>
  );
}
