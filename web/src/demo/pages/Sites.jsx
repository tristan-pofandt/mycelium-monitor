// Sites: every site side by side, then one site in detail. A Site Manager sees only their own site.
import { useSearchParams } from "react-router";
import { Bars, KpiTile } from "../../charts.jsx";
import { rovingKeys } from "../../ui.jsx";
import { ENTITIES, OUTPUT, PEOPLE, SITES, person } from "../data.js";
import { SourceNote } from "../bits.jsx";
import { usePersona } from "../store.js";

const COLS = [
  ["oee", "OEE", "%", "plantdata", (v) => v < 75], ["downtime", "Unplanned downtime, 7 d", " h", "plantdata", (v) => v > 10],
  ["incidents", "Recordable incidents, 30 d", "", "whs", (v) => v > 1], ["nearMiss", "Near misses, 30 d", "", "whs", () => false],
  ["overdue", "Overdue work orders", "", "maintenance", (v) => v > 15], ["quality", "Open quality issues", "", "quality", (v) => v > 5],
  ["otif", "On time in full", "%", "erp", (v) => v < 92], ["coverage", "Roster coverage, next 7 d", "%", "rostering", (v) => v < 90],
];
const short = (d) => d.toLocaleDateString([], { day: "numeric", month: "short" });

function Comparison() {
  return (
    <>
      <section className="panel-card">
        <div className="card-head"><div><h2>All sites</h2><p className="card-sub">Figures past their threshold are flagged in red</p></div></div>
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Site comparison</caption>
            <thead><tr><th scope="col">Site</th>{COLS.map(([k, label]) => <th key={k} scope="col">{label}</th>)}</tr></thead>
            <tbody>{SITES.map((s) => (
              <tr key={s.id}>
                <th scope="row">{s.name}<span className="muted small block">{s.kind} · {s.staff} staff</span></th>
                {COLS.map(([k, , unit, , bad]) => <td key={k} className={bad(s.kpi[k]) ? "late" : ""}>{s.kpi[k]}{unit}{bad(s.kpi[k]) && <span className="sr-only"> (flagged)</span>}</td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="muted small">Thresholds are examples, set per site in a real deployment.</p>
        <SourceNote ids={[...new Set(COLS.map((c) => c[3])), "s_kpis"]} />
      </section>
      <section className="panel-card">
        <div className="card-head"><div><h2>Output, last 14 days</h2><p className="card-sub">Units built or serviced, all sites stacked</p></div></div>
        <Bars title="Units per day, all sites" hideTitle height={220} format={(v) => Math.round(v).toLocaleString()}
          series={SITES.map((s, i) => ({ key: s.id, label: s.name, color: ["var(--series-1)", "var(--series-2)", "var(--orange)", "var(--text-muted)"][i] }))}
          rows={OUTPUT[0].days.map((d, i) => ({ label: short(d.date), values: Object.fromEntries(OUTPUT.map((o) => [o.site, o.days[i].units])) }))} />
        <SourceNote ids={["plantdata"]} />
      </section>
      <section className="panel-card">
        <h2>How the sites are organised</h2>
        <ul className="queue" role="list">{ENTITIES.map((e) => (
          <li key={e.id} className="queue-item"><p><strong>{e.name}</strong></p><p className="muted small">{SITES.filter((s) => s.entity === e.id).map((s) => s.name).join(", ") || "Brisbane office"}</p></li>
        ))}</ul>
        <SourceNote ids={["s_entities", "s_sites"]} />
      </section>
    </>
  );
}

function Detail({ id }) {
  const s = SITES.find((x) => x.id === id);
  const days = OUTPUT.find((o) => o.site === id).days;
  const issues = [
    s.kpi.overdue > 15 && `${s.kpi.overdue} maintenance work orders are overdue; 6 are on press line 2.`,
    s.kpi.coverage < 90 && `Next week's night shifts are short by 9 people.`,
    s.kpi.oee < 75 && `OEE is ${s.kpi.oee}%, below the 75% target, mostly from unplanned downtime.`,
    s.kpi.quality > 5 && `${s.kpi.quality} quality issues are open, the oldest 19 days.`,
  ].filter(Boolean);
  return (
    <>
      <dl className="kpis">
        {COLS.slice(0, 4).map(([k, label, unit], i) => <KpiTile key={k} icon={["status", "latency", "errors", "spark"][i]} label={label} value={`${s.kpi[k]}${unit}`} />)}
        {COLS.slice(4).map(([k, label, unit], i) => <KpiTile key={k} icon={["settings", "ledger", "check", "clock"][i]} label={label} value={`${s.kpi[k]}${unit}`} />)}
      </dl>
      <section className="panel-card">
        <div className="card-head"><div><h2>{s.name} output, last 14 days</h2><p className="card-sub">{s.kind}. Site Manager: {PEOPLE.find((x) => x.site === id && x.role === "site_manager").name}</p></div></div>
        <Bars title={`${s.name} units per day`} hideTitle height={200} series={[{ key: "u", label: "Units", color: "var(--accent)" }]}
          rows={days.map((d) => ({ label: short(d.date), values: { u: d.units } }))} />
        <SourceNote ids={["plantdata"]} />
      </section>
      <section className="panel-card">
        <h2>What needs attention</h2>
        {issues.length ? <ul className="queue" role="list">{issues.map((t) => <li key={t} className="queue-item"><p>{t}</p></li>)}</ul> : <p className="muted">Nothing past its threshold.</p>}
        <SourceNote ids={["maintenance", "rostering", "quality"]} />
      </section>
    </>
  );
}

export default function Sites() {
  const p = usePersona();
  const [params, setParams] = useSearchParams();
  const own = p.id === "site_manager" ? person(p.person).site : null;
  const site = own || params.get("site") || "all";
  return (
    <>
      {!own && (
        <div className="toolbar" style={{ gridColumn: "1 / -1" }}>
          <div role="group" aria-label="Site" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
            {[{ id: "all", name: "All sites" }, ...SITES].map((s) => (
              <button key={s.id} type="button" aria-pressed={site === s.id} onClick={() => setParams(s.id === "all" ? {} : { site: s.id })}>{s.name}</button>
            ))}
          </div>
        </div>
      )}
      {own && <p className="notice">As Site Manager you see {SITES.find((s) => s.id === own).name} only. The GM sees every site side by side.</p>}
      {site === "all" ? <Comparison /> : <Detail id={site} />}
    </>
  );
}
