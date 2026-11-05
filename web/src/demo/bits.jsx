// Pieces several demo pages share: approvals, alerts, tasks and the person dialog, each filtered to what the persona may see.
import { Fragment, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { APPROVALS, MACHINES, PEOPLE, ROLES, SECURITY_ALERTS, TASKS, certName, dayOffset, fmtAgo, fmtDay, person, qualified, siteName, under, inScope } from "./data.js";
import { SourceNote } from "./feedback.jsx";
import { ALERT_FOCUS, mapHref } from "./plans.js";
export { SourceNote };
import { audit, update, useCan, useDemo, usePersona } from "./store.js";
import { Icon } from "../icons.jsx";
import { EmptyState, HoldButton, Tip, useToast } from "../ui.jsx";
import { viewReason } from "./held.js";
import { PermitBadge } from "./permits.jsx"; // permits.jsx uses PersonSearch from here: a cycle that's safe because both only run at render

export const SEV = { high: "badge-bad", medium: "badge-warn", low: "badge-none" };
export const Sev = ({ sev }) => <span className={`badge ${SEV[sev]}`}>{sev === "high" ? "High" : sev === "medium" ? "Medium" : "Low"}</span>;

// ── Approvals ──
export function useApprovals() {
  const p = usePersona();
  const { approvals, requests } = useDemo();
  const me = person(p.person);
  const all = [...APPROVALS, ...requests];
  const mine = all.filter((a) => {
    if (p.id === "gm") return a.approver === "gm";
    if (p.id === "site_manager") return a.approver === "site_manager" && a.site === me.site;
    if (p.id === "supervisor") return a.approver === "supervisor" && under(me.id).some((x) => x.id === a.from);
    return false;
  });
  const sent = all.filter((a) => a.from === me.id);
  return { pending: mine.filter((a) => !approvals[a.id]), decided: mine.filter((a) => approvals[a.id]), sent, status: (a) => approvals[a.id] };
}

export function decide(a, verdict, toast) {
  update((s) => ({
    approvals: { ...s.approvals, [a.id]: verdict },
    events: a.event ? s.events.map((e) => (e.id === a.event ? { ...e, status: verdict === "Approved" ? undefined : "declined" } : e)) : s.events,
    eventEdits: a.edit ? { ...s.eventEdits, ...(verdict === "Approved" ? { [a.edit.id]: { ...s.eventEdits[a.edit.id], ...a.edit.changes } } : {}) } : s.eventEdits,
  }));
  audit(`${verdict.toLowerCase()} "${a.title}"`);
  toast?.({ title: `${verdict}: ${a.title}`, tone: verdict === "Approved" ? "good" : "info", action: { label: "Undo", onClick: () => undoDecision(a) } });
}
function undoDecision(a) {
  update((s) => { const x = { ...s.approvals }; delete x[a.id]; return { approvals: x }; });
  audit(`undid the decision on "${a.title}"`);
}

export function ApprovalsList({ limit, compact }) {
  const { pending, decided, status } = useApprovals();
  const toast = useToast();
  const shown = limit ? pending.slice(0, limit) : pending;
  if (!pending.length && !decided.length) return <EmptyState title="Nothing waiting for you.">Requests that need your sign-off land here, from every site in your scope.</EmptyState>;
  return (
    <>
      {!pending.length && <p className="muted">Nothing waiting. You've decided {decided.length}.</p>}
      <ul className="queue" role="list">
        {shown.map((a) => (
          <li key={a.id} className="queue-item">
            <p><span className="badge">{a.kind}</span> <strong>{a.title}</strong></p>
            <p className="muted small">From {person(a.from)?.name}, {person(a.from)?.title}{person(a.from)?.title.includes(siteName(a.site)) ? "" : ` · ${siteName(a.site)}`} · {a.why}</p>
            <div className="actions">
              <button type="button" className="button button-primary" onClick={() => decide(a, "Approved", toast)}>Approve</button>
              <button type="button" className="button" onClick={() => decide(a, "Declined", toast)}>Decline</button>
            </div>
          </li>
        ))}
        {!compact && decided.map((a) => (
          <li key={a.id} className="queue-item is-done">
            <p><span className={`badge ${status(a) === "Approved" ? "badge-ok" : "badge-none"}`}>{status(a)}</span> {a.title}</p>
            <button type="button" className="link small" onClick={() => undoDecision(a)}>Undo</button>
          </li>
        ))}
      </ul>
      {limit && pending.length > limit && <p className="small"><Link to="/work">{pending.length - limit} more in Work and approvals</Link></p>}
    </>
  );
}

// ── Security alerts ──
export function useAlerts() {
  const p = usePersona();
  const me = person(p.person);
  const acked = useDemo((s) => s.revoked);
  const list = SECURITY_ALERTS.filter((a) => p.id !== "site_manager" || a.site === me.site);
  return list.map((a) => ({ ...a, done: acked[a.id] }));
}

const reopen = (id) => update((s) => { const x = { ...s.revoked }; delete x[id]; return { revoked: x }; });

export function AlertsList({ limit }) {
  const alerts = useAlerts();
  const can = useCan();
  const toast = useToast();
  const shown = alerts.filter((a) => !a.done).slice(0, limit || 99);
  if (!shown.length) return <EmptyState title="No open alerts.">Acknowledged alerts stay in the history.</EmptyState>;
  return (
    <ul className="queue" role="list">
      {shown.map((a) => (
        <li key={a.id} className="queue-item">
          <p><Sev sev={a.sev} /> <strong>{a.title}</strong></p>
          <p className="muted small">{siteName(a.site)} · {fmtAgo(a.when)}{ALERT_FOCUS[a.id] && <> · <Link to={can("security") ? `/security?map=${ALERT_FOCUS[a.id].site}&focus=${encodeURIComponent(ALERT_FOCUS[a.id].focus)}` : mapHref(ALERT_FOCUS[a.id].site, ALERT_FOCUS[a.id].focus)} className="link">Show on map<span className="sr-only">: {a.title}</span></Link></>}</p>
          <SourceNote ids={[a.source]} />
          <div className="actions">
            {a.id === "s1" && can("revoke") && (
              <HoldButton className="button-danger" onConfirm={() => {
                update((s) => ({ revoked: { ...s.revoked, s1: "Card cancelled" } }));
                audit("cancelled access card of a former employee at Ipswich");
                toast({ title: "Card cancelled (simulated) and logged.", tone: "good", action: { label: "Undo", onClick: () => { reopen("s1"); audit("restored the access card"); } } });
              }}>Hold to cancel the card</HoldButton>
            )}
            <button type="button" className="button" onClick={() => {
              update((s) => ({ revoked: { ...s.revoked, [a.id]: "Acknowledged" } }));
              audit(`acknowledged "${a.title}"`);
              toast({ title: "Acknowledged and logged.", action: { label: "Undo", onClick: () => reopen(a.id) } });
            }}>Acknowledge</button>
          </div>
          {a.id === "s1" && can("revoke") && <p className="muted small">In a real deployment this would go through a restricted service account in the access system, and land in the audit trail.</p>}
        </li>
      ))}
    </ul>
  );
}

// ── Tasks ──
export function useTasks(filter = "scope") {
  const p = usePersona();
  const { tasks, newTasks } = useDemo();
  const me = person(p.person);
  const scope = new Set(inScope(p).map((x) => x.id));
  // due comes back from localStorage as a string for tasks handed out in the demo
  const all = [...TASKS, ...newTasks].map((t) => ({ ...t, ...tasks[t.id], due: new Date(t.due) }));
  if (filter === "mine") return all.filter((t) => t.assignee === me.id);
  return all.filter((t) => scope.has(t.assignee) || t.assignee === me.id);
}
export const setTask = (id, changes) => update((s) => ({ tasks: { ...s.tasks, [id]: { ...s.tasks[id], ...changes } } }));
export const isLate = (t) => t.status !== "done" && t.due < dayOffset(0);

export function TaskRow({ t }) {
  return (
    <li className="task-row">
      <label className="check">
        <input type="checkbox" checked={t.status === "done"} onChange={(e) => setTask(t.id, { status: e.target.checked ? "done" : "todo" })} />
        <span className={t.status === "done" ? "done-text" : ""}>{t.title}</span>
      </label>
      <span className="muted small">{person(t.assignee)?.name} · {siteName(t.site)} · <span className={isLate(t) ? "late" : ""}>{isLate(t) ? "overdue, was due" : "due"} {fmtDay(t.due)}</span></span>
      <PermitBadge t={t} />
      <SourceNote ids={[t.source]} />
    </li>
  );
}

// ── Person dialog: details, why you can see them, and a role ──
export function PersonButton({ id, children }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const p = person(id);
  const show = () => { setOpen(true); requestAnimationFrame(() => ref.current?.showModal?.()); };
  return (
    <>
      <button type="button" className="link" onClick={show}>{children || p.name}</button>
      {open && createPortal(
        <dialog ref={ref} className="palette demo-dialog" aria-label={p.name} onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && ref.current.close()}>
          <div className="dialog-body"><PersonCard id={id} onClose={() => ref.current?.close()} /></div>
        </dialog>, document.body)}
    </>
  );
}

function why(persona, viewer, p) {
  if (viewer.id === p.id) return "This is you.";
  if (persona.id === "gm") return "You're GM Operations, so you see everyone at every Queensland site.";
  if (["security", "it", "hr"].includes(persona.id)) return `Your role (${persona.label}) sees everyone, but only the ${persona.id === "hr" ? "people" : persona.id === "it" ? "systems and devices" : "security"} side of their record.`;
  if (persona.id === "site_manager") return `You manage ${siteName(viewer.site)}, and ${p.name} works there.`;
  return `${p.name} is in your team (they report to ${person(p.manager)?.name}).`;
}

export function PersonCard({ id, onClose }) {
  const p = person(id);
  const persona = usePersona();
  const viewer = person(persona.person);
  const can = useCan();
  const role = useDemo((s) => s.roleOf[id]);
  const reports = PEOPLE.filter((x) => x.manager === id).length;
  const logged = useRef(null);
  useEffect(() => { // My data's "Who looked at your record": once per open, never for your own record
    const key = `${persona.id}|${id}`;
    if (viewer.id === id || logged.current === key) return;
    logged.current = key;
    update((s) => ({ views: [{ at: Date.now(), viewer: persona.label.replace(" (you)", ""), viewerPersonId: viewer.id, personId: id, why: viewReason(persona, viewer, p) }, ...s.views].slice(0, 60) }));
  }, [persona.id, id]);
  return (
    <>
      <div className="card-head">
        <div><h2>{p.name}</h2><p className="card-sub">{p.title} · {siteName(p.site)}</p></div>
        {onClose && <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>}
      </div>
      <dl className="facts">
        <dt>Reports to</dt><dd>{person(p.manager)?.name || "Group (outside Queensland operations)"}</dd>
        <dt>Direct reports</dt><dd>{reports || "None"}</dd>
        <dt>Shift</dt><dd>{p.shift}</dd>
        {MACHINES.some((m) => m.site === p.site) && <><dt>Can operate</dt><dd>{MACHINES.filter((m) => m.site === p.site && qualified(p, m.needs)).map((m) => m.name).join(", ") || "No machine tickets"}{p.skills?.some((s) => s.status === "training") && <span className="muted"> · in training for {p.skills.filter((s) => s.status === "training").map((s) => certName(s.cert).toLowerCase()).join(", ")}</span>}</dd></>}
        <dt>Open tasks</dt><dd>{p.tasks}</dd>
        <dt>Access card</dt><dd>{p.card} · {p.status === "left" ? <span className="late">still active after they left</span> : "active"}</dd>
        <dt>Pay rate</dt><dd>{can("pay") ? "$41.20 an hour (fictional)" : <span className="muted">Hidden for your role</span>}</dd>
        <dt>Mycelium role</dt><dd>{role || ROLES.find((r) => r.id === p.role)?.name || p.role}</dd>
        {p.certs.map((c) => <Fragment key={c.name}><dt>{c.name}</dt><dd className="late">expires {fmtDay(c.expires)}</dd></Fragment>)}
      </dl>
      <p className="notice small"><strong>Why can you see this?</strong> {why(persona, viewer, p)}{viewer.id === id && <> <Link to="/my-data" onClick={onClose}>See everything we hold about you</Link></>}</p>
      <SourceNote ids={["hr"]} />
    </>
  );
}


export const RoundLink = ({ to, label }) => (
  <Tip label={label} describe={false}><Link to={to} className="round-link" aria-label={label}><Icon name="arrow" /></Link></Tip>
);

// ── Person search: type a name, job or site, pick with the arrow keys and Enter (an ARIA combobox) ──
// Replaces long dropdowns of people. `people` is the list the viewer may pick from; `value` is the chosen person's id.
export function PersonSearch({ label, people, value, onChange, placeholder = "Search by name, job or site" }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const chosen = value ? person(value) : null;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = words.length ? people.filter((p) => words.every((w) => `${p.name} ${p.title} ${siteName(p.site)}`.toLowerCase().includes(w))).slice(0, 8) : [];
  const pick = (p) => { onChange(p.id); setQ(""); setOpen(false); };
  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, hits.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && open && hits[active]) { e.preventDefault(); pick(hits[active]); }
    else if (e.key === "Escape") setOpen(false);
  };
  if (chosen) {
    return (
      <div className="field">
        <span>{label}</span>
        <div className="person-chosen">
          <span><strong>{chosen.name}</strong> <span className="muted small">{chosen.title} · {siteName(chosen.site)}</span></span>
          <button type="button" className="link small" onClick={() => onChange(null)}>Change<span className="sr-only"> {label.toLowerCase()}</span></button>
        </div>
      </div>
    );
  }
  return (
    <div className="field person-search">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" value={q} placeholder={placeholder} autoComplete="off" role="combobox" aria-expanded={open && hits.length > 0}
        aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={open && hits[active] ? `${id}-${active}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }} onKeyDown={onKey} onBlur={() => setTimeout(() => setOpen(false), 120)} />
      {open && hits.length > 0 && (
        <ul id={`${id}-list`} className="popover person-results" role="listbox" aria-label={`${label}: matches`}>
          {hits.map((p, i) => (
            <li key={p.id} id={`${id}-${i}`} role="option" aria-selected={i === active} className={i === active ? "is-active" : ""}
              onPointerMove={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); pick(p); }}>
              <span><strong>{p.name}</strong><span className="muted small block">{p.title} · {siteName(p.site)}</span></span>
            </li>
          ))}
        </ul>
      )}
      {open && words.length > 0 && !hits.length && <p className="muted small" role="status">Nobody matches "{q}".</p>}
    </div>
  );
}
