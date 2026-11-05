// Audit evidence (feature 6): evidence collected as the systems run, sorted by control, one tab per framework. Each control is a
// row saying Evidence found, Gap or Stale; opening it lists the items and where they live in the demo. "An auditor is here"
// builds a pack in the browser (a Markdown summary and a CSV, each item hashed). The wording is "evidence found" or "gap", never
// a verdict: in a real deployment this is the compliance plug-in, a separate app that Mycelium feeds, read-only (decision 5).
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { KpiTile } from "../../charts.jsx";
import { Icon } from "../../icons.jsx";
import { rovingKeys } from "../../ui.jsx";
import { TaskChip, useTask } from "../../tasks.jsx";
import { PLACES, fmtDay, siteName } from "../data.js";
import { FRAMEWORKS, ago, collectedAt, frameworkName, inPeriod, itemLine, packFiles, sha256 } from "../controls.js";
import { ControlBadge, freshness, useAuditScope, useControls } from "../controls.jsx";
import { SourceNote, SystemName } from "../feedback.jsx";
import { audit, update, useCan, useDemo, usePersona } from "../store.js";

const WHERE = { "/security": "Security", "/security?tab=cyber": "Cyber security", "/work": "Work and approvals", "/people": "People (Skills view)",
  "/emergency": "Roll call", "/roles": "Roles and permissions", "/sites": "Sites" };
const sources = (rows) => [...new Set(rows.flatMap((r) => r.items.map((e) => e.source)))];

function ControlRow({ row, open }) {
  const { control: c, items } = row;
  return (
    <li className="ctl-row" id={`ctl-${c.id}`}>
      <details open={open}>
        <summary>
          <ControlBadge status={row.status} />
          <span className="ctl-name"><span className="ctl-ref">{c.ref}</span> {c.title}</span>
          <span className="ctl-reason">{row.reason}</span>
          <span className="ctl-fresh">{freshness(row)}</span>
          <Icon name="chevron" size={14} />
        </summary>
        {items.length ? (
          <ul className="ctl-items" role="list">{items.map((e) => (
            <li key={e.id} className={e.gap ? "is-gap" : ""}>
              <p><span className={`badge ${e.gap ? "badge-bad" : "badge-ok"}`}>{e.gap ? "Gap" : "Evidence"}</span> {e.what}</p>
              <p className="muted small">{e.site ? siteName(e.site) : "All sites"} · {e.gap ? "open now" : fmtDay(e.date)} · from <SystemName id={e.source} />, collected {ago(collectedAt(e.source, row.now), row.now)}
                {e.to && <> · <Link to={e.to}>Open in {WHERE[e.to]}</Link></>}</p>
            </li>
          ))}</ul>
        ) : <p className="muted small">No evidence collected yet for this control.</p>}
        <p className="muted small">Evidence counts for {c.period} days, then it's stale and needs collecting again.</p>
      </details>
    </li>
  );
}

// Choose the framework, sites and period, build, then download. Exporting needs the export permission as well as audit.
function AuditorHere({ framework }) {
  const can = useCan();
  const persona = usePersona();
  const scope = useAuditScope();
  const places = PLACES.filter((p) => !scope || scope.includes(p.id));
  const [fw, setFw] = useState(framework);
  const [sites, setSites] = useState(() => places.map((p) => p.id));
  const [days, setDays] = useState(90);
  const [task, run, retry] = useTask();
  const [files, setFiles] = useState(null);
  const rows = useControls(fw, sites);
  const { packs, auditors } = useDemo();
  useEffect(() => setFw(framework), [framework]);
  useEffect(() => () => files && [files.md, files.csv].forEach((u) => URL.revokeObjectURL(u)), [files]);
  const guests = auditors.filter((a) => new Date(a.until) > new Date());
  const toggle = (id, on) => setSites((cur) => (on ? [...cur, id] : cur.filter((x) => x !== id)));
  const build = () => run({
    name: "Build audit pack", arg: frameworkName(fw), expectedMs: 1600,
    action: async () => {
      await new Promise((r) => setTimeout(r, 900)); // gathering from each source, in a real deployment
      const builtAt = Date.now();
      const hashed = await Promise.all(rows.map(async (r) => ({ ...r, items: await Promise.all(inPeriod(r.items, days, builtAt).map(async (e) => ({ ...e, hash: await sha256(itemLine(r.control, e)) }))) })));
      const siteNames = sites.length === PLACES.length ? ["All sites"] : sites.map(siteName);
      const { md, csv } = packFiles({ framework: fw, siteNames, days, builtAt, by: persona.label.replace(" (you)", ""), rows: hashed });
      const stamp = new Date(builtAt).toISOString().slice(0, 10);
      setFiles({ md: URL.createObjectURL(new Blob([md], { type: "text/markdown" })), csv: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), base: `brolga-${fw}-evidence-${stamp}` });
      const n = hashed.reduce((k, r) => k + r.items.length, 0), gaps = hashed.filter((r) => r.status === "gap").length;
      update((s) => ({ packs: [{ id: builtAt, framework: fw, sites: siteNames, days, at: builtAt, items: n, gaps, by: persona.label.replace(" (you)", "") }, ...s.packs].slice(0, 10) }));
      audit(`built an audit pack for ${frameworkName(fw)}, ${siteNames.join(", ")}, last ${days} days (${n} items)`);
      return { n, gaps };
    },
    done: (r) => `${r.n} items, ${r.gaps} controls with a gap`,
  });
  return (
    <section className="panel-card ctl-pack">
      <h2>An auditor is here</h2>
      <p className="muted small">Pick what they're auditing and build a pack: a summary and a spreadsheet of every item, made in your browser from the demo's data.</p>
      {can("export") ? (
        <div className="form-grid">
          <div className="toolbar">
            <label>Framework <select className="input" value={fw} onChange={(e) => setFw(e.target.value)}>{FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.sub})</option>)}</select></label>
            <label>Period <select className="input" value={days} onChange={(e) => setDays(Number(e.target.value))}>{[30, 90, 180, 365].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select></label>
          </div>
          {places.length > 1 ? (
            <fieldset className="ctl-sites"><legend>Sites</legend>
              {places.map((p) => <label key={p.id} className="check"><input type="checkbox" checked={sites.includes(p.id)} onChange={(e) => toggle(p.id, e.target.checked)} />{p.name}</label>)}
            </fieldset>
          ) : <p className="small">Site: <strong>{places[0]?.name}</strong>, the one your role covers.</p>}
          <div className="actions">
            <button type="button" className="button button-primary" disabled={!sites.length || task?.state === "running"} onClick={() => { setFiles(null); build(); }}>Build the pack</button>
          </div>
          {task && <TaskChip task={task} onRetry={retry} />}
          {files && task?.state === "done" && (
            <div className="actions">
              <a className="button" href={files.md} download={`${files.base}.md`}><Icon name="doc" /> Download summary (Markdown)</a>
              <a className="button" href={files.csv} download={`${files.base}.csv`}><Icon name="doc" /> Download evidence (CSV)</a>
            </div>
          )}
          <p className="muted small">Each item carries a SHA-256 hash. A real pack would be signed, and each hash checked against the tamper-evident audit log, so an edited record shows.</p>
        </div>
      ) : <p className="notice small">Your role can see the evidence but not take it away: building a pack also needs the "Export data" permission.</p>}
      {guests.length > 0 && <p className="small">{guests.map((a) => `${a.name} (${a.firm})`).join(", ")} {guests.length === 1 ? "has" : "have"} read-only access to the evidence.{can("roles") && <> <Link to="/roles">Manage on Roles</Link></>}</p>}
      {packs.length > 0 && <>
        <h3 className="small-head">Packs built</h3>
        <ul className="queue" role="list">{packs.slice(0, 5).map((p) => (
          <li key={p.id} className="queue-item"><p><strong>{frameworkName(p.framework)}</strong>, {p.sites.join(", ")}, last {p.days} days</p>
            <p className="muted small">{p.items} items, {p.gaps} controls with a gap · by {p.by}, {ago(p.at)}</p></li>
        ))}</ul>
      </>}
      <SourceNote ids={sources(rows)} />
    </section>
  );
}

export default function Audit() {
  const [params, setParams] = useSearchParams();
  const scope = useAuditScope();
  const fw = FRAMEWORKS.find((f) => f.id === params.get("framework")) || FRAMEWORKS[0];
  const [site, setSite] = useState("all");
  const rows = useControls(fw.id, site === "all" ? null : [site]);
  const opened = params.get("control");
  const count = (st) => rows.filter((r) => r.status === st).length;
  useEffect(() => { if (opened) document.getElementById(`ctl-${opened}`)?.scrollIntoView({ block: "center" }); }, [opened]);
  return (
    <>
      <div className="toolbar" style={{ gridColumn: "1 / -1" }}>
        <div role="group" aria-label="Framework" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
          {FRAMEWORKS.map((f) => <button key={f.id} type="button" aria-pressed={fw.id === f.id} onClick={() => setParams({ framework: f.id })}>{f.name}</button>)}
        </div>
        {scope ? <span className="muted small">{siteName(scope[0])} only, the site your role covers</span> : (
          <label>Site <select className="input" value={site} onChange={(e) => setSite(e.target.value)}>
            <option value="all">All sites</option>{PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        )}
      </div>
      <p className="notice small ctl-plugin">
        <strong>This is the compliance plug-in:</strong> a separate app that Mycelium feeds, read-only. It lines up what your systems already
        record against each control and shows the gaps. It finds evidence; the auditor still makes the call.
      </p>
      <dl className="kpis">
        <KpiTile icon="evidence" label={`${fw.name} controls with evidence found`} value={String(count("evidence"))} />
        <KpiTile icon="errors" label="Controls with a gap" value={String(count("gap"))} />
        <KpiTile icon="clock" label="Controls with stale evidence" value={String(count("stale"))} />
      </dl>
      <section className="panel-card span-2">
        <div className="card-head"><div><h2>{fw.name}: {fw.sub}</h2><p className="card-sub">Each control with the evidence collected for it. Open one to see the items and where they live.</p></div></div>
        <ul className="ctl-rows" role="list">{rows.map((r) => <ControlRow key={r.control.id} row={r} open={opened === r.control.id} />)}</ul>
        <p className="muted small">Control numbers and short titles only; the standards' own text stays with their publishers. The Essential Eight is published free by the ACSC.</p>
        <SourceNote ids={sources(rows)} />
      </section>
      <AuditorHere framework={fw.id} />
    </>
  );
}
