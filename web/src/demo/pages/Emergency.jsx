// Emergency roll call (feature 5, docs/demo-features-plan.md). Nothing running: the start card, how it works and past reports.
// Running: the counts, a list of who is not yet found grouped by where they last badged (one person per row, big Safe and
// Not found buttons for wardens on phones), the site map with those counts per area, and End roll call. No motion on ticks:
// a ticked person leaves the list at once, because this screen needs speed (emil-design-eng: no animation on urgent,
// high-frequency actions).
import { useEffect, useMemo, useRef, useState } from "react";
import { KpiTile, Table } from "../../charts.jsx";
import { EmptyState, HoldButton, useToast } from "../../ui.jsx";
import { siteName } from "../data.js";
import { SourceNote } from "../bits.jsx";
import { SystemName } from "../feedback.jsx";
import { SiteMap } from "../sitemap.jsx";
import { nameOf, zoneTally } from "../rollcall.js";
import { LiveCounts, MODE, StartForm, timeOf, useRollCall } from "../rollcall.jsx";

const SOURCES = ["access_control", "visitors", "rostering", "permits", "evac"];
const minutes = (ms) => { const m = Math.max(1, Math.round(ms / 60e3)); return `${m} minute${m === 1 ? "" : "s"}`; };
const match = (q) => (e) => !q || e.name.toLowerCase().includes(q);

function HowItWorks() {
  return (
    <section className="panel-card" aria-labelledby="rc-how-h">
      <div className="card-head"><div><h2 id="rc-how-h">How it works</h2><p className="card-sub">Four lists joined into one, so nobody is counted twice</p></div></div>
      <ul className="rc-how" role="list">
        <li><strong>Doors.</strong> Everyone who badged in and hasn't badged out (<SystemName id="access_control" />), with the area of their last read.</li>
        <li><strong>Visitors.</strong> Everyone signed in and not out in the visitor book (<SystemName id="visitors" />).</li>
        <li><strong>Permits.</strong> People working under a permit, such as in a confined space, listed in that area so wardens check it first.</li>
        <li><strong>Roster.</strong> People on today's shift (<SystemName id="rostering" />) who never badged in are listed as probably absent, not counted.</li>
      </ul>
      <p className="muted small">Today, in our guess: <SystemName id="evac" />. Wardens tick people off on their phones, and the report goes to the audit trail when it ends.</p>
      <SourceNote ids={SOURCES} />
    </section>
  );
}

function Reports({ reports }) {
  const rows = reports.map((r) => [
    siteName(r.site), MODE[r.mode], `${new Date(r.startedAt).toLocaleDateString([], { day: "numeric", month: "short" })}, ${timeOf(r.startedAt)}`,
    minutes(r.endedAt - r.startedAt), `${r.total - r.missing.length} of ${r.total}`, r.missing.length ? r.missing.slice(0, 4).map(nameOf).join(", ") + (r.missing.length > 4 ? ` and ${r.missing.length - 4} more` : "") : "Nobody",
  ]);
  return (
    <section className="panel-card" aria-labelledby="rc-rep-h">
      <div className="card-head"><div><h2 id="rc-rep-h">Past roll calls</h2><p className="card-sub">Each report also goes to the audit trail. Not accounted for means still not ticked safe at the all-clear.</p></div></div>
      <Table caption="Past roll calls" head={["Site", "Type", "Started", "All clear after", "Accounted for", "Not accounted for"]} rows={rows} sortable={false}
        empty="No roll calls yet" emptyText="Run a drill and its report shows here." />
      <SourceNote ids={["evac"]} />
    </section>
  );
}

// One person: name, what they are, and the two buttons with the name in each label.
function Row({ e, onTick }) {
  return (
    <li className={`rc-row ${e.tick === "missing" ? "is-missing" : ""}`} data-rc={e.id}>
      <div className="rc-who">
        <span className="rc-name">{e.name}</span>
        <span className="rc-tags">
          {e.tick === "missing" && <span className="badge badge-bad">Not found</span>}
          {e.kind === "visitor" && <span className="badge">Visitor</span>}
          {e.permit && <span className="badge badge-warn">Permit {e.permit}</span>}
        </span>
        <span className="rc-detail muted">{e.detail}</span>
      </div>
      <div className="rc-actions">
        <button type="button" className="button rc-btn rc-btn-safe" aria-label={`Mark ${e.name} safe`} onClick={() => onTick(e, "safe")}>Safe</button>
        <button type="button" className="button rc-btn" aria-pressed={e.tick === "missing"} aria-label={`Mark ${e.name} not found`}
          onClick={() => onTick(e, e.tick === "missing" ? null : "missing")}>Not found</button>
      </div>
    </li>
  );
}

function Running() {
  const { rc, result, tick, end } = useRollCall();
  const toast = useToast();
  const [q, setQ] = useState("");
  const focusAfter = useRef(null);
  const { counts } = result;
  const query = q.trim().toLowerCase();
  const groups = useMemo(() => {
    const by = new Map();
    for (const e of result.everyone.filter((x) => x.tick !== "safe").filter(match(query))) {
      if (!by.has(e.zoneName)) by.set(e.zoneName, []);
      by.get(e.zoneName).push(e);
    }
    return [...by].map(([name, list]) => ({ name, list: list.sort((a, b) => (b.tick === "missing") - (a.tick === "missing") || a.name.localeCompare(b.name)) }))
      .sort((a, b) => b.list.length - a.list.length);
  }, [result, query]);
  const safe = result.everyone.filter((e) => e.tick === "safe").filter(match(query));
  const noBadge = result.rosteredNoBadge.filter(match(query));

  // A person marked safe leaves the list; keep keyboard focus on the next person instead of losing it.
  useEffect(() => {
    if (!focusAfter.current) return;
    const el = document.querySelector(`[data-rc="${focusAfter.current}"] .rc-btn-safe`) || document.querySelector(".rc-row .rc-btn-safe") || document.getElementById("rc-search");
    focusAfter.current = null;
    el?.focus();
  }, [result]);

  const onTick = (e, value) => {
    const prev = e.tick || null;
    if (value === "safe") {
      const flat = groups.flatMap((g) => g.list);
      const i = flat.indexOf(e);
      focusAfter.current = (flat[i + 1] || flat[i - 1])?.id || "none";
    }
    tick(e.id, value);
    toast({
      key: "rc-tick", ms: 8000, tone: value === "safe" ? "good" : "info",
      title: value === "safe" ? `${e.name} marked safe` : value === "missing" ? `${e.name} marked not found` : `${e.name} back to not yet found`,
      action: { label: "Undo", onClick: () => tick(e.id, prev) },
    });
  };

  return (
    <>
      <section className="panel-card rc-status" aria-labelledby="rc-status-h">
        <div className="rc-status-text">
          <h2 id="rc-status-h"><span className="badge badge-bad">{MODE[rc.mode]}</span> {siteName(rc.site)}</h2>
          <p className="muted small">Started {timeOf(rc.startedAt)} by {rc.by}. In a real deployment every warden's phone shows this list, and ticks appear on all of them at once.</p>
        </div>
        <HoldButton onConfirm={end}>End roll call</HoldButton>
      </section>
      <dl className="kpis rc-kpis">
        <KpiTile icon="users" label="On site" value={String(counts.onSite)} />
        <KpiTile icon="check" label="Safe" value={String(counts.safe)} />
        <KpiTile icon="errors" label="Not yet found" value={String(counts.notYet)} />
        <KpiTile icon="user" label="Visitors" value={String(counts.visitors)} />
      </dl>
      <LiveCounts text={`${counts.safe} safe, ${counts.notYet} not yet found, of ${counts.onSite} on site.`} />
      <div className="rc-board">
        <section className="panel-card rc-list" aria-labelledby="rc-list-h">
          <div className="card-head"><div><h2 id="rc-list-h">Not yet found</h2>
            <p className="card-sub">Grouped by where each person last badged. Tick them off as they reach the assembly point.</p></div></div>
          <label className="field rc-search"><span>Find a person</span>
            <input id="rc-search" type="search" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name" autoComplete="off" />
          </label>
          {groups.map((g) => (
            <div key={g.name} className="rc-group">
              <h3 className="small-head">{g.name} <span className="muted">({g.list.length})</span></h3>
              <ul role="list" className="rc-rows">{g.list.map((e) => <Row key={e.id} e={e} onTick={onTick} />)}</ul>
            </div>
          ))}
          {!groups.length && (query ? <EmptyState title={`Nobody not yet found matches "${q.trim()}"`} /> : <EmptyState title="Everyone is accounted for">Hold End roll call to write the report.</EmptyState>)}
          <details className="rc-fold">
            <summary>Safe ({safe.length})</summary>
            <ul role="list" className="rc-rows">
              {safe.map((e) => (
                <li key={e.id} className="rc-row is-safe" data-rc={e.id}>
                  <div className="rc-who"><span className="rc-name">{e.name}</span><span className="rc-tags"><span className="badge badge-ok">Safe</span></span><span className="rc-detail muted">{e.zoneName}</span></div>
                  <div className="rc-actions"><button type="button" className="button rc-btn" aria-label={`Undo safe for ${e.name}`} onClick={() => onTick(e, null)}>Undo</button></div>
                </li>
              ))}
            </ul>
          </details>
          <details className="rc-fold">
            <summary>Rostered, no badge-in ({noBadge.length})</summary>
            <p className="muted small">On today's roster but no card read, so probably absent and not counted above. Call them or their supervisor to be sure.</p>
            <ul role="list" className="rc-plain">{noBadge.map((x) => <li key={x.id}>{x.name} <span className="muted">({x.shift === "Office" ? "office hours" : `${x.shift.toLowerCase()} shift`})</span></li>)}</ul>
          </details>
          <SourceNote ids={SOURCES} />
        </section>
        <section className="panel-card rc-map" aria-labelledby="rc-map-h">
          <div className="card-head"><div><h2 id="rc-map-h">Where to look</h2>
            <p className="card-sub">People not yet found in each area, at their last door read. Areas without a reader show "Not counted".</p></div></div>
          <SiteMap site={rc.site} mode="rollcall" counts={zoneTally(result)} compact />
          <SourceNote ids={["floorplans", "access_control"]} />
        </section>
      </div>
    </>
  );
}

export default function Emergency() {
  const { rc, result, canRun, sites, reports } = useRollCall();
  const mine = reports.filter((r) => sites.includes(r.site));
  if (rc && canRun(rc.site)) return <><Running /><Reports reports={mine} /></>;
  return (
    <>
      {rc ? (
        <section className="panel-card notice-card" aria-labelledby="rc-other-h">
          <h2 id="rc-other-h">A {MODE[rc.mode].toLowerCase()} is running at {siteName(rc.site)}</h2>
          <p className="muted">Started {timeOf(rc.startedAt)} by {rc.by}. {result.counts.notYet} of {result.counts.onSite} not yet accounted for. Only wardens for {siteName(rc.site)} and the all-sites roles see the list.</p>
        </section>
      ) : (
        <section className="panel-card" aria-labelledby="rc-start-h">
          <div className="card-head"><div><h2 id="rc-start-h">Start a roll call</h2><p className="card-sub">Choose the site, then hold the button. Drills only in this demo.</p></div></div>
          <StartForm />
          <SourceNote ids={SOURCES} />
        </section>
      )}
      <HowItWorks />
      <Reports reports={mine} />
    </>
  );
}
