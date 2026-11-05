// Audit evidence on screen, for the Audit evidence page and other pages: the persona's scope, every control with its live
// evidence and status, the status badge (a word, not only a colour) and AuditGapsCard for the customisable Home.
import { Link } from "react-router";
import { POLICIES, person } from "./data.js";
import { mergePermits } from "./permits.js";
import { CONTROLS, FRAMEWORKS, POLICY_CONTROL, STATUS_WORD, ago, collectedAt, controlStatus, evidenceContext, evidenceFor, statusReason } from "./controls.js";
import { RoundLink, SourceNote } from "./bits.jsx";
import { useCan, useDemo, usePersona } from "./store.js";
import "./controls.css";

// The sites a persona's evidence covers: the Site Manager their own site, everyone else every site (null).
export function useAuditScope() {
  const p = usePersona();
  return p.id === "site_manager" ? [person(p.person).site] : null;
}

// Every control of a framework (null for all) with its evidence for these sites, always inside the persona's scope.
// Each row: { control, items, status, reason, collected } where collected is when the freshest source was last read.
export function useControls(framework = null, sites = null) {
  const s = useDemo();
  const scope = useAuditScope();
  const ctx = evidenceContext({ ...s, permits: mergePermits(s.permits, s.permitEdits) }, Date.now());
  const within = scope ? (sites ? sites.filter((x) => scope.includes(x)) : scope) : sites;
  return CONTROLS.filter((c) => !framework || c.framework === framework).map((control) => {
    const items = evidenceFor(control, ctx, within).sort((a, b) => Boolean(b.gap) - Boolean(a.gap) || b.date - a.date);
    const collected = items.length ? new Date(Math.max(...items.map((e) => +collectedAt(e.source, ctx.now)))) : null;
    return { control, items, status: controlStatus(control, items, ctx.today), reason: statusReason(control, items, ctx.today), collected, now: ctx.now };
  });
}

const BADGE = { evidence: "badge-ok", gap: "badge-bad", stale: "badge-warn" };
export const ControlBadge = ({ status }) => <span className={`badge ${BADGE[status]} ctl-badge`}>{STATUS_WORD[status]}</span>;
export const controlHref = (c) => `/audit?framework=${c.framework}&control=${encodeURIComponent(c.id)}`;
export const freshness = (row) => (row.collected ? `last collected ${ago(row.collected, row.now)}` : "nothing collected yet");

// Security's "Physical security policies": each policy with the live status of the ISO 27001 control that holds its evidence,
// linking to it on Audit evidence (one list of evidence, not two).
export function PoliciesCard() {
  const can = useCan();
  const rows = useControls("iso27001");
  return (
    <section className="panel-card">
      <h2>Physical security policies</h2>
      <p className="muted small">Each policy, with the evidence collected for it{can("audit") ? " in Audit evidence" : ""}.</p>
      <ul className="queue" role="list">{POLICIES.map((x) => {
        const map = POLICY_CONTROL[x.policy];
        const row = rows.find((r) => r.control.id === map.control);
        const items = row.items.filter((e) => map.sources.includes(e.source));
        const status = controlStatus(row.control, items, new Date(row.now)), reason = statusReason(row.control, items, new Date(row.now));
        return (
          <li key={x.policy} className="queue-item">
            <p><ControlBadge status={status} /> <strong>{x.policy}</strong></p>
            <p className="muted small">{x.evidence} · ISO 27001 {row.control.ref}: {can("audit") ? <Link to={controlHref(row.control)}>{reason}</Link> : reason}</p>
            <SourceNote ids={[x.source]} />
          </li>
        );
      })}</ul>
      {can("audit") && <p className="small"><Link to="/audit?framework=iso27001">See all ISO 27001 evidence</Link></p>}
    </section>
  );
}

// For Home (the customisable Home registry): the open gaps across every framework, worst first.
export function AuditGapsCard() {
  const can = useCan();
  const rows = useControls();
  if (!can("audit")) return null;
  const gaps = rows.filter((r) => r.status === "gap");
  const stale = rows.filter((r) => r.status === "stale").length;
  return (
    <section className="panel-card">
      <div className="card-head">
        <div><h2>Audit evidence</h2><p className="card-sub">Collected as your systems run, sorted by control</p></div>
        <RoundLink to="/audit" label="Open audit evidence" />
      </div>
      <p><strong>{rows.length - gaps.length - stale} of {rows.length} controls have evidence found.</strong> {gaps.length} gap{gaps.length === 1 ? "" : "s"}{stale ? `, ${stale} stale` : ""}.</p>
      {gaps.length > 0 && <ul className="ctl-mini" role="list">{gaps.slice(0, 3).map((r) => (
        <li key={r.control.id}><Link to={controlHref(r.control)}>{FRAMEWORKS.find((f) => f.id === r.control.framework).name} {r.control.ref} {r.control.title}</Link><span className="muted small block">{r.reason}</span></li>
      ))}</ul>}
      <SourceNote ids={[...new Set(rows.flatMap((r) => r.items.map((e) => e.source)))]} />
    </section>
  );
}
