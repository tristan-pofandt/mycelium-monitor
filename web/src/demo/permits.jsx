// Permits to work, on screen: the Permits card (Security and Work), the badge on tasks that need a permit, and the dialog
// that issues one. Holders can only be people in the viewer's scope with the right ticket (feature 1's skills).
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../icons.jsx";
import { EmptyState, HoldButton, useToast } from "../ui.jsx";
import { PLACES, TASKS, fmtDay, inScope, person, siteName } from "./data.js";
import { SourceNote, SystemName } from "./feedback.jsx";
import { AREAS, PERMIT_TYPES, canHold, mergePermits, needsPermit, statusAt, typeName, whyNot } from "./permits.js";
import { PersonSearch } from "./bits.jsx";
import { audit, update, useCan, useDemo, usePersona } from "./store.js";
import "./permits.css";

const H = 3600e3;
const clock = (ms) => new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const sameDay = (ms) => new Date(ms).toDateString() === new Date().toDateString();
const when = (ms) => (sameDay(ms) ? clock(ms) : `${fmtDay(new Date(ms))}, ${clock(ms)}`);
const left = (ms) => { const m = Math.round((ms - Date.now()) / 60e3); return m < 60 ? `${m} min left` : `${Math.round(m / 60)} h left`; };
const names = (ids) => ids.map((id) => person(id)?.name).join(", ");

// Every permit (seeded and issued here) with this demo's closes and revokes.
const useAllPermits = () => { const { permits, permitEdits } = useDemo(); return mergePermits(permits, permitEdits); };

// The permits this persona may see: GM and Security every site, Site Manager and supervisor their site, anyone else their own.
export function usePermits() {
  const p = usePersona();
  const me = person(p.person);
  const all = useAllPermits();
  if (["gm", "security"].includes(p.id)) return all;
  if (["site_manager", "supervisor"].includes(p.id)) return all.filter((x) => x.site === me.site);
  return all.filter((x) => x.holders.includes(me.id));
}

const STATUS = { open: ["Open", "badge-ok"], later: ["Starts later", "badge-none"], expired: ["Expired", "badge-warn"], closed: ["Closed", "badge-none"], revoked: ["Revoked", "badge-bad"] };
const statusOf = (pm) => { const s = statusAt(pm); return s === "open" && pm.from > Date.now() ? "later" : s; };
function windowText(pm) {
  const s = statusOf(pm);
  if (s === "open") return `until ${when(pm.to)}, ${left(pm.to)}`;
  if (s === "later") return `starts ${when(pm.from)}, until ${when(pm.to)}`;
  if (s === "expired") return `ended ${when(pm.to)}`;
  return `${s} ${when(pm.closedAt)}`;
}

function setStatus(pm, status, toast) {
  update((s) => ({ permitEdits: { ...s.permitEdits, [pm.id]: { status, closedAt: Date.now() } } }));
  audit(`${status} permit ${pm.id} (${typeName(pm.type).toLowerCase()}, ${pm.area}, ${siteName(pm.site)})`);
  toast({ title: `Permit ${pm.id} ${status}. Its holders no longer count as permitted at its doors.`, tone: status === "revoked" ? "info" : "good",
    action: { label: "Undo", onClick: () => { update((s) => { const x = { ...s.permitEdits }; delete x[pm.id]; return { permitEdits: x }; }); audit(`reopened permit ${pm.id}`); } } });
}

// ── The Permits to work card ──
export function PermitsCard() {
  const p = usePersona();
  const me = person(p.person);
  const can = useCan();
  const toast = useToast();
  const order = { open: 0, later: 1, expired: 2, revoked: 3, closed: 4 };
  const list = usePermits().sort((a, b) => order[statusOf(a)] - order[statusOf(b)] || b.from - a.from);
  const isLive = (pm) => ["open", "later"].includes(statusOf(pm));
  const live = list.filter(isLive), ended = list.filter((x) => !isLive(x));
  const open = list.filter((x) => statusOf(x) === "open");
  // Supervisors close their own permits; roles above them any permit they can see.
  const mayEdit = (pm) => can("permits") && isLive(pm) && (pm.issuer === me.id || p.id !== "supervisor");
  const row = (pm) => {
    const [word, tone] = STATUS[statusOf(pm)];
    const task = pm.task && TASKS.find((t) => t.id === pm.task);
    return (
      <li key={pm.id} className={`queue-item ${isLive(pm) ? "" : "is-done"}`}>
        <p><span className={`badge ${tone}`}>{word}</span> <strong>{typeName(pm.type)} · {pm.area}</strong> <span className="muted small">{pm.id}</span></p>
        <p className="muted small">{siteName(pm.site)} · {windowText(pm)} · issued by {person(pm.issuer)?.name}{task ? ` · for "${task.title}"` : ""}</p>
        <p className="small">Holders: {names(pm.holders)}</p>
        {pm.doors.length > 0 && <p className="muted small">Restricted door: {pm.doors.join(", ")}</p>}
        {mayEdit(pm) && (
          <div className="actions">
            <HoldButton onConfirm={() => setStatus(pm, "closed", toast)}>Hold to close</HoldButton>
            <HoldButton className="button-danger" onConfirm={() => setStatus(pm, "revoked", toast)}>Hold to revoke</HoldButton>
          </div>
        )}
      </li>
    );
  };
  return (
    <section className="panel-card span-2">
      <div className="card-head">
        <div><h2>Permits to work</h2><p className="card-sub">{open.length} open{live.length > open.length ? `, ${live.length - open.length} starting later` : ""} · only holders should badge into the area's doors</p></div>
        {can("permits") && <div className="card-tools"><IssueButton className="button button-primary">Issue a permit</IssueButton></div>}
      </div>
      {!list.length && <EmptyState title="No permits in your view.">Hot-work, confined-space and isolation permits for your area show here.</EmptyState>}
      {live.length > 0 && <ul className="queue" role="list">{live.map(row)}</ul>}
      {ended.length > 0 && (
        <details className="table-toggle">
          <summary>{ended.length} closed, revoked or expired</summary>
          <ul className="queue" role="list">{ended.map(row)}</ul>
        </details>
      )}
      {!can("permits") && <p className="muted small">You see permits read-only. Site Managers and Shift Supervisors issue and close them.</p>}
      <p className="muted small">Mycelium only alerts when someone without a permit badges into a restricted door. In a real deployment it could also add
        the holders' cards to the area's access group in <SystemName id="access_control" /> for the permit window and remove them after,
        once that action is approved (roadmap decision 3).</p>
      <SourceNote ids={["permits", "access_control", "training"]} />
    </section>
  );
}

// ── Badge on a task that needs a permit ──
export function PermitBadge({ t }) {
  const type = needsPermit(t);
  const can = useCan();
  const all = useAllPermits();
  if (!type) return null;
  const pm = all.find((x) => x.task === t.id && statusAt(x) === "open");
  if (pm) return <span className="permit-line"><span className="badge badge-ok"><Icon name="permit" />{typeName(pm.type)} permit {pm.id}, {pm.from > Date.now() ? `starts ${when(pm.from)}` : `until ${when(pm.to)}`}</span></span>;
  return (
    <span className="permit-line">
      <span className="badge badge-warn"><Icon name="permit" />Needs {type === "isolation" ? "an" : "a"} {PERMIT_TYPES.find((x) => x.id === type).ticket} permit</span>
      {can("permits") && t.status !== "done" && <IssueButton task={t} className="link small">Issue permit<span className="sr-only"> for {t.title}</span></IssueButton>}
    </span>
  );
}

// ── Issue dialog ──
export function IssueButton({ task, className, children }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const show = () => { setOpen(true); requestAnimationFrame(() => ref.current?.showModal?.()); };
  return (
    <>
      <button type="button" className={className} onClick={show}>{children}</button>
      {open && createPortal(
        <dialog ref={ref} className="palette demo-dialog" aria-label="Issue a permit to work" onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && ref.current.close()}>
          <div className="dialog-body"><IssuePermit task={task} onClose={() => ref.current?.close()} /></div>
        </dialog>, document.body)}
    </>
  );
}

const STARTS = [["now", "Now"], ["1", "In 1 hour"], ["tomorrow", "Tomorrow at 6:00"]];
const startAt = (v) => { if (v === "now") return Date.now(); if (v === "tomorrow") { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(6, 0, 0, 0); return +d; } return Date.now() + Number(v) * H; };

export function IssuePermit({ task, onClose }) {
  const p = usePersona();
  const me = person(p.person);
  const toast = useToast();
  const sites = PLACES.filter((s) => AREAS.some((a) => a.site === s.id));
  const fixedSite = task?.site || (["site_manager", "supervisor"].includes(p.id) ? me.site : null);
  const [site, setSite] = useState(fixedSite || sites[0].id);
  const areas = AREAS.filter((a) => a.site === site);
  const [type, setType] = useState((task && needsPermit(task)) || "hotwork");
  const guess = (task && areas.find((a) => task.title.toLowerCase().includes(a.name.toLowerCase()))) || areas.find((a) => a.type === type);
  const [area, setArea] = useState((guess || areas[0])?.name);
  const [start, setStart] = useState("now"), [hours, setHours] = useState(8);
  const [holders, setHolders] = useState([]);
  const from = startAt(start), to = from + hours * H;
  const people = inScope(p).filter((x) => x.site === site && x.status === "active" && x.role !== "gm");
  const able = people.filter((x) => canHold(x, type, to));
  const unable = people.filter((x) => !canHold(x, type, to)).map((x) => ({ x, why: whyNot(x, type, to) }))
    .sort((a, b) => a.why.startsWith("needs") - b.why.startsWith("needs")); // nearly-there first: training or a ticket running out
  const chosen = holders.filter((id) => able.some((x) => x.id === id)); // a new type or time drops anyone who no longer qualifies
  const a = areas.find((x) => x.name === area);
  const ticket = PERMIT_TYPES.find((x) => x.id === type).ticket;
  const issue = (e) => {
    e.preventDefault();
    if (!chosen.length || !a) return;
    const pm = { id: `PTW-${2000 + Math.floor(Math.random() * 8000)}`, type, site, area: a.name, doors: a.door ? [a.door] : [], holders: chosen, issuer: me.id, from, to, task: task?.id || null, status: "open" };
    update((s) => ({ permits: [...s.permits, pm] }));
    audit(`issued ${typeName(type).toLowerCase()} permit ${pm.id} for ${a.name}, ${siteName(site)}, to ${names(chosen)}`);
    toast({ title: `Permit ${pm.id} issued to ${chosen.length} ${chosen.length === 1 ? "person" : "people"} until ${when(to)}.`, tone: "good",
      action: { label: "Undo", onClick: () => { update((s) => ({ permits: s.permits.filter((x) => x.id !== pm.id) })); audit(`withdrew permit ${pm.id}`); } } });
    onClose();
  };
  return (
    <form className="permit-form" onSubmit={issue}>
      <div className="card-head">
        <div><h2>Issue a permit to work</h2>{task && <p className="card-sub">For "{task.title}"</p>}</div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      </div>
      <div className="permit-fields">
        <label className="field"><span>Type</span>
          <select className="input" value={type} onChange={(e) => { setType(e.target.value); setArea((cur) => areas.find((x) => x.type === e.target.value)?.name || cur); }}>{PERMIT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        {!fixedSite && <label className="field"><span>Site</span>
          <select className="input" value={site} onChange={(e) => { setSite(e.target.value); setArea(AREAS.find((x) => x.site === e.target.value)?.name); setHolders([]); }}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
        <label className="field"><span>Area</span>
          <select className="input" value={area} onChange={(e) => setArea(e.target.value)}>{areas.map((x) => <option key={x.name} value={x.name}>{x.name}{x.door ? " (restricted door)" : ""}</option>)}</select></label>
        <label className="field"><span>Starts</span>
          <select className="input" value={start} onChange={(e) => setStart(e.target.value)}>{STARTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="field"><span>Lasts</span>
          <select className="input" value={hours} onChange={(e) => setHours(Number(e.target.value))}>{[2, 4, 8, 12].map((h) => <option key={h} value={h}>{h} hours (to {when(startAt(start) + h * H)})</option>)}</select></label>
      </div>
      <PersonSearch label="Add a holder" people={able.filter((x) => !chosen.includes(x.id))} value={null} onChange={(id) => id && setHolders((h) => [...h, id])} placeholder="Name or job, for example fitter" />
      <p className="muted small">{able.length ? `${able.length} ${able.length === 1 ? "person" : "people"} in your view at ${siteName(site)} hold a current ${ticket} ticket for the whole permit.` : `Nobody in your view at ${siteName(site)} holds a current ${ticket} ticket for this permit.`}
        {able.length > 0 && !chosen.length && <> Try: {able.slice(0, 3).map((x, i) => <span key={x.id}>{i ? ", " : ""}<button type="button" className="link" onClick={() => setHolders((h) => [...h, x.id])}>{x.name}</button></span>)}.</>}</p>
      {chosen.length > 0 && (
        <ul className="permit-holders" role="list" aria-label="Holders">{chosen.map((id) => (
          <li key={id}><span>{person(id).name} <span className="muted small">{person(id).title}</span></span>
            <button type="button" className="link small" onClick={() => setHolders((h) => h.filter((x) => x !== id))}>Remove<span className="sr-only"> {person(id).name}</span></button></li>
        ))}</ul>
      )}
      {unable.length > 0 && (
        <details className="table-toggle">
          <summary>{unable.length} {unable.length === 1 ? "person" : "people"} can't hold this permit</summary>
          <ul className="permit-unable" role="list">{unable.slice(0, 8).map(({ x, why }) => <li key={x.id}><strong>{x.name}</strong> <span className="muted small">{x.title}: {why}</span></li>)}</ul>
          {unable.length > 8 && <p className="muted small">and {unable.length - 8} more.</p>}
        </details>
      )}
      <div className="actions"><button type="submit" className="button button-primary" disabled={!chosen.length || !a}>Issue permit</button>
        <button type="button" className="button" onClick={onClose}>Cancel</button></div>
      <p className="muted small">{a?.door ? `Only holders should open ${a.door} while it's live; anyone else badging in raises an alert.` : "This area has no restricted door, so the permit is tracked but not checked at a door."} A real
        deployment would also record it where permits live today (<SystemName id="permits" />).</p>
    </form>
  );
}
