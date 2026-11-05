// Skills: who holds which machine ticket, when each runs out, and which shifts will be left without a certified operator.
// A real table (people down, machines across) with filters for site, shift and machine; the gaps strip above it reads the
// same records through skillGaps (roster.js), so the roster planner and this view always agree.
import { useState } from "react";
import { Table } from "../charts.jsx";
import { MACHINES, PEOPLE, SITES, TODAY, dayOffset, inScope, person, siteName } from "./data.js";
import { DAYS, TEAMS, TODAY_INDEX, dayLabel, siteShifts, skillGaps } from "./roster.js";
import { SourceNote } from "./feedback.jsx";
import "./roster.css";

const short = (d) => d.toLocaleDateString([], { day: "numeric", month: "short" });
const EXTRA = [{ id: "first_aid", name: "First aid", needs: "first_aid" }, { id: "warden", name: "Fire warden", needs: "warden" }];
const ROSTERED = new Set(TEAMS.flatMap((t) => t.members.map((m) => m.id)));

// One cell: a badge with a word, never colour alone.
export function skillBadge(p, cert) {
  const s = (p.skills || []).find((x) => x.cert === cert);
  if (!s) return { word: "None", tone: "" };
  if (s.status === "training") return { word: "Training", tone: "badge-none" };
  if (s.expires && s.expires < TODAY) return { word: `Expired ${short(s.expires)}`, tone: "badge-bad" };
  if (s.expires && s.expires < dayOffset(28)) return { word: `Expires ${short(s.expires)}`, tone: "badge-warn" };
  return { word: "Certified", tone: "badge-ok" };
}
const Badge = ({ b }) => (b.tone ? <span className={`badge ${b.tone}`}>{b.word}</span> : <><span aria-hidden="true" className="muted">—</span><span className="sr-only">None</span></>);

// Gaps over the next two weeks, one line per site, shift and machine, from the first day it bites.
export function useSkillGaps(sites, shift) {
  const crew = PEOPLE.filter((p) => sites.includes(p.site));
  const machines = MACHINES.filter((m) => sites.includes(m.site));
  const seen = new Map();
  for (let d = TODAY_INDEX; d < DAYS; d++) {
    for (const g of skillGaps(crew, machines, d)) {
      const k = `${g.site}|${g.shift}|${g.machine}`;
      if ((!shift || g.shift === shift) && !seen.has(k)) seen.set(k, g);
    }
  }
  return [...seen.values()];
}

export function SkillsMatrix({ persona }) {
  const me = person(persona.person);
  const scope = inScope(persona).filter((p) => p.status === "active" && p.site !== "hq");
  const sites = SITES.filter((s) => scope.some((p) => p.site === s.id));
  const gapsAll = useSkillGaps(sites.map((s) => s.id), persona.id === "supervisor" ? me.shift : null);
  const [site, setSite] = useState(() => (sites.some((s) => s.id === me.site) ? me.site : gapsAll[0]?.site || sites[0]?.id));
  const [shift, setShift] = useState("all");
  const [machine, setMachine] = useState("all");
  const [limit, setLimit] = useState(40);
  if (!sites.length) return <p className="muted">Nobody in your view works on a site floor.</p>;
  const cols = [...MACHINES.filter((m) => m.site === site), ...EXTRA];
  const shown = machine === "all" ? cols : cols.filter((c) => c.id === machine);
  const pick = cols.find((c) => c.id === machine);
  const rows = scope.filter((p) => p.site === site && (ROSTERED.has(p.id) || p.skills?.length) && (shift === "all" || p.shift === shift)
    && (!pick || (p.skills || []).some((s) => s.cert === pick.needs)));
  const gaps = gapsAll.filter((g) => sites.length === 1 || g.site === site);
  return (
    <>
      <div className="skills-gaps" aria-labelledby="gaps-h">
        <h3 id="gaps-h">Gaps in the next two weeks</h3>
        {gaps.length ? (
          <ul className="queue" role="list">{gaps.map((g) => (
            <li key={`${g.site}${g.shift}${g.machine}`} className="queue-item">
              <p><span className="badge badge-bad">Gap</span> <strong>{siteName(g.site)}, {g.shift.toLowerCase()} shift: {g.name}</strong></p>
              <p className="muted small">{g.have ? `Only ${g.have} of ${g.need} people` : "Nobody"} on the shift will hold a current ticket from {dayLabel(g.day)}.</p>
            </li>
          ))}</ul>
        ) : <p className="muted small">Every machine in your view has enough certified people on every shift for the next two weeks.</p>}
      </div>
      <div className="toolbar">
        {sites.length > 1 && <label>Site <select className="input" value={site} onChange={(e) => { setSite(e.target.value); setMachine("all"); setShift("all"); }}>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
        <label>Shift <select className="input" value={shift} onChange={(e) => setShift(e.target.value)}>
          <option value="all">All</option>{siteShifts(site).map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Machine <select className="input" value={machine} onChange={(e) => setMachine(e.target.value)}>
          <option value="all">All</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      </div>
      <Table caption={`Machine tickets at ${siteName(site)}`} head={["Name", "Shift", ...shown.map((c) => c.name)]} empty="Nobody matches these filters."
        keys={rows.slice(0, limit).map((p) => [p.name, p.shift, ...shown.map((c) => skillBadge(p, c.needs).word)])}
        rows={rows.slice(0, limit).map((p) => [<span key="n">{p.name}<span className="muted small block">{p.title}</span></span>, p.shift, ...shown.map((c) => <Badge key={c.id} b={skillBadge(p, c.needs)} />)])} />
      {rows.length > limit && (
        <div className="table-more">
          <span className="muted small">Showing {limit} of {rows.length}. Pick a shift or machine to narrow it down.</span>
          <button type="button" className="button" onClick={() => setLimit((n) => n + 40)}>Show 40 more</button>
        </div>
      )}
      <SourceNote ids={["training", "hr"]} />
    </>
  );
}
