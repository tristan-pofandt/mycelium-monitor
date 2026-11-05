// Calendar: this week across the sites in your view, with lock levels (locked, edit by request, editable), approval rules for
// big events, change requests that go to the right person, and business-only import from a personal calendar.
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../../icons.jsx";
import { Switch, useToast } from "../../ui.jsx";
import { EVENTS, EVENT_TYPES, PLACES, WEEK_START, defaultLock, editMode, needsApproval, person, siteName } from "../data.js";
import { SourceNote } from "../bits.jsx";
import { SystemName } from "../feedback.jsx";
import { SHIFT_TIMES, isWork, useRoster } from "../roster.js";
import { update, useCan, useDemo, usePersona } from "../store.js";

const DAYS = Array.from({ length: 7 }, (_, i) => { const d = new Date(WEEK_START); d.setDate(d.getDate() + i); return d; });
const LOCKS = { locked: "Locked", request: "Ask first", open: "Anyone can move" };
const LOCK_HELP = {
  locked: "Only the person who made it, or someone above them, can change it.",
  request: "Others can ask to move it; the change goes to the creator's side to approve.",
  open: "Anyone who can see it can move it.",
};
// The filter shows four groups rather than seven types, so it stays one quick decision.
const GROUPS = [["Meetings", ["Meeting"]], ["Shutdowns and audits", ["Shutdown", "Audit"]], ["Training and inspections", ["Training", "Inspection"]], ["Shifts and leave", ["Shift", "Leave"]]];
const time = (h) => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;
// The next level up decides (the demo has three approver levels).
const approverFor = (role) => (role === "employee" ? "supervisor" : role === "supervisor" ? "site_manager" : "gm");

function useEvents() {
  const p = usePersona();
  const me = person(p.person);
  const { events, eventEdits } = useDemo();
  const { roster } = useRoster();
  // Front-line staff see their own shifts on the calendar, from the roster their supervisor plans (so moving one means asking first).
  const mine = roster[me.id] || [];
  const shifts = ["employee", "supervisor"].includes(p.id) ? [0, 1, 2, 3, 4, 5, 6].filter((day) => isWork(mine[day])).map((day) => ({
    id: `shift-${day}`, title: `Your ${mine[day].toLowerCase()} shift`, type: "Shift", day, start: SHIFT_TIMES[mine[day]][0], hours: 8,
    owner: p.id === "employee" ? me.manager : me.id, site: me.site, lock: p.id === "employee" ? "request" : "open",
  })) : [];
  const all = [...shifts, ...EVENTS, ...events].map((e) => ({ ...e, ...eventEdits[e.id] })).filter((e) => !e.deleted && e.status !== "declined");
  if (["gm", "security", "it"].includes(p.id)) return all;
  return all.filter((e) => e.site === me.site || e.owner === me.id || (e.site === "hq" && e.owner === person(me.manager)?.id));
}

function EventDialog({ e, onClose }) {
  const p = usePersona();
  const me = person(p.person);
  const rules = useDemo((s) => s.rules);
  const toast = useToast();
  const mode = editMode(e, p.id, me.id);
  const [day, setDay] = useState(e.day), [start, setStart] = useState(e.start), [reason, setReason] = useState("");
  const owner = person(e.owner);
  const managerNeedsOk = rules.find((r) => r.id === "modify")?.on && p.id !== "gm" && e.owner !== me.id;
  const save = () => {
    if (mode === "edit" && !managerNeedsOk) {
      update((s) => ({ eventEdits: { ...s.eventEdits, [e.id]: { ...s.eventEdits[e.id], day: Number(day), start: Number(start) } } }));
      toast({ title: "Event moved. Everyone invited is told.", tone: "good" });
    } else {
      update((s) => ({ requests: [...s.requests, { id: `r${Date.now()}`, kind: "Change", title: `Move "${e.title}" to ${DAYS[day].toLocaleDateString([], { weekday: "short" })} ${time(Number(start))}`,
        from: me.id, site: e.site, approver: owner.role === "gm" ? "gm" : owner.role === "site_manager" ? "site_manager" : approverFor(p.id), why: reason || `The event is ${LOCKS[e.lock].toLowerCase()}`,
        edit: { id: e.id, changes: { day: Number(day), start: Number(start) } } }] }));
      toast({ title: `Change request sent to ${owner.name}'s approver. You'll see it in My requests.`, tone: "good" });
    }
    onClose();
  };
  return (
    <div className="dialog-body">
      <div className="card-head">
        <div><h2>{e.title}</h2><p className="card-sub">{e.type} · {siteName(e.site)} · {DAYS[e.day].toLocaleDateString([], { weekday: "long" })} {time(e.start)} for {e.hours} h</p></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      </div>
      <p><span className={`lock-chip lock-${e.lock}`}>{e.lock !== "open" && <Icon name="access" size={12} />}{LOCKS[e.lock]}</span> {LOCK_HELP[e.lock]}</p>
      <p className="muted small">Created by {owner.name}, {owner.title}.{e.status === "pending" && <strong> Waiting for approval.</strong>}</p>
      {mode === "none" ? (
        <p className="notice">This event is locked by {owner.name}. Only they, or someone above them, can change it. You can still send feedback about it.</p>
      ) : (
        <>
          <p className="muted small">{mode === "request" || managerNeedsOk ? `Changes to this event need ${owner.name}'s side to approve.` : "You can move this event straight away."}</p>
          <div className="toolbar">
            <label>Day <select className="input" value={day} onChange={(x) => setDay(x.target.value)}>{DAYS.map((d, i) => <option key={i} value={i}>{d.toLocaleDateString([], { weekday: "short", day: "numeric" })}</option>)}</select></label>
            <label>Start <select className="input" value={start} onChange={(x) => setStart(x.target.value)}>{Array.from({ length: 29 }, (_, i) => 5 + i / 2).map((h) => <option key={h} value={h}>{time(h)}</option>)}</select></label>
          </div>
          {(mode === "request" || managerNeedsOk) && <label className="field"><span>Reason</span><input className="input" value={reason} onChange={(x) => setReason(x.target.value)} placeholder="Why it needs to move" /></label>}
          <div className="actions"><button type="button" className="button button-primary" onClick={save}>{mode === "request" || managerNeedsOk ? "Request the change" : "Move event"}</button></div>
        </>
      )}
    </div>
  );
}

function NewEvent() {
  const p = usePersona();
  const me = person(p.person);
  const can = useCan();
  const rules = useDemo((s) => s.rules);
  const toast = useToast();
  const [f, setF] = useState({ title: "", type: "Meeting", day: 2, start: 9, hours: 1, site: me.site === "hq" ? "acr" : me.site, lock: defaultLock(p.id, rules) });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ev = { ...f, day: Number(f.day), start: Number(f.start), hours: Number(f.hours) };
  const approval = needsApproval(ev, p.id, rules);
  const add = (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    const id = `u${Date.now()}`;
    update((s) => ({
      events: [...s.events, { ...ev, id, owner: me.id, status: approval ? "pending" : undefined }],
      requests: approval ? [...s.requests, { id: `r${id}`, kind: "Event", title: `${ev.title}, ${ev.hours} h, ${siteName(ev.site)}`, from: me.id, site: ev.site, approver: approverFor(p.id), why: "Matches an approval rule", event: id }] : s.requests,
    }));
    toast({ title: approval ? "Added as pending. It needs approval from the next level up." : "Event added and invitations sent (simulated).", tone: "good" });
    setF({ ...f, title: "" });
  };
  return (
    <form className="form-grid" onSubmit={add}>
      <label className="field"><span>Title</span><input className="input" value={f.title} onChange={set("title")} placeholder="For example: Line 2 changeover" /></label>
      <div className="form-row">
        <label className="field"><span>Type</span><select className="input" value={f.type} onChange={set("type")}>{EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label className="field"><span>Site</span><select className="input" value={f.site} onChange={set("site")}>{PLACES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      </div>
      <div className="form-row">
        <label className="field"><span>Day</span><select className="input" value={f.day} onChange={set("day")}>{DAYS.map((d, i) => <option key={i} value={i}>{d.toLocaleDateString([], { weekday: "short", day: "numeric" })}</option>)}</select></label>
        <label className="field"><span>Start</span><select className="input" value={f.start} onChange={set("start")}>{Array.from({ length: 29 }, (_, i) => 5 + i / 2).map((h) => <option key={h} value={h}>{time(h)}</option>)}</select></label>
        <label className="field"><span>Hours</span><select className="input" value={f.hours} onChange={set("hours")}>{[0.5, 1, 2, 3, 4, 6, 8, 12].map((h) => <option key={h}>{h}</option>)}</select></label>
      </div>
      {can("lock") && <label className="field"><span>Who can change it</span>
        <select className="input" value={f.lock} onChange={set("lock")}>{Object.entries(LOCKS).map(([k, v]) => <option key={k} value={k}>{v}: {LOCK_HELP[k].toLowerCase()}</option>)}</select></label>}
      {approval && <p className="notice small">This event will need approval: {ev.hours > 4 ? "it's longer than 4 hours" : `${ev.type.toLowerCase()} events always do`}.</p>}
      <div className="actions"><button type="submit" className="button button-primary" disabled={!f.title.trim()}>Add event</button></div>
    </form>
  );
}

const PERSONAL = [
  { title: "Call with Group operations", business: true }, { title: "Dentist", business: false }, { title: "Supplier dinner, Brisbane", business: true },
  { title: "School pick-up", business: false }, { title: "Ipswich site walk", business: true },
];

export default function Calendar() {
  const p = usePersona();
  const can = useCan();
  const events = useEvents();
  const rules = useDemo((s) => s.rules);
  const [groups, setGroups] = useState(new Set(GROUPS.map((g) => g[0])));
  const [open, setOpen] = useState(null);
  const [imported, setImported] = useState(false);
  const ref = useRef(null);
  const show = (e) => { setOpen(e); requestAnimationFrame(() => ref.current?.showModal?.()); };
  const toggle = (g) => setGroups((s) => { const n = new Set(s); n.has(g) ? n.delete(g) : n.add(g); return n; });
  const types = new Set(GROUPS.filter((g) => groups.has(g[0])).flatMap((g) => g[1]));
  const shown = events.filter((e) => types.has(e.type));
  const me = person(p.person);
  const movable = shown.filter((e) => editMode(e, p.id, me.id) === "edit").length;
  return (
    <>
      <section className="panel-card span-2">
        <div className="card-head">
          <div><h2>This week</h2><p className="card-sub">{shown.length} events in your view. As {p.label.replace(" (you)", "")} you can move {movable} of them yourself; click any event to see why.</p></div>
        </div>
        <ul className="lock-legend" role="list" aria-label="Who can change an event">
          {Object.keys(LOCKS).map((k) => (
            <li key={k}><span className={`lock-chip lock-${k}`}>{k !== "open" && <Icon name="access" size={12} />}{LOCKS[k]}</span><span className="muted small">{LOCK_HELP[k]}</span></li>
          ))}
        </ul>
        <div role="group" aria-label="Show event types" className="chips">
          {GROUPS.map(([g]) => <button key={g} type="button" className="chip" aria-pressed={groups.has(g)} onClick={() => toggle(g)}>{g}</button>)}
        </div>
        <div className="week">
          {DAYS.map((d, i) => (
            <div key={i} className="week-day">
              <h3>{d.toLocaleDateString([], { weekday: "short" })} <span className="muted">{d.getDate()}</span></h3>
              <ul role="list">
                {shown.filter((e) => e.day === i).sort((a, b) => a.start - b.start).map((e) => (
                  <li key={e.id}>
                    <button type="button" className={`event type-${e.type.toLowerCase()} ${e.status === "pending" ? "is-pending" : ""}`} onClick={() => show(e)}>
                      <span className="event-time">{time(e.start)} · {e.hours} h</span>
                      <span className="event-title">{e.title}</span>
                      <span className="event-meta">{siteName(e.site)}</span>
                      {(e.lock !== "open" || e.status === "pending") && (
                        <span className="event-chips">
                          {e.lock !== "open" && <span className={`lock-chip lock-${e.lock}`}><Icon name="access" size={11} />{LOCKS[e.lock]}</span>}
                          {e.status === "pending" && <span className="lock-chip lock-pending">Waiting for approval</span>}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <SourceNote ids={["email", "rostering"]} />
      </section>
      {can("events") && <section className="panel-card"><h2>New event</h2><NewEvent /></section>}
      <section className="panel-card">
        <h2>Approval rules</h2>
        <p className="muted small">{p.id === "gm" ? "You set these for the whole region." : "Set by the GM. Shown here so everyone knows what needs sign-off."}</p>
        <div className="rules">
          {rules.map((r) => <Switch key={r.id} checked={r.on} disabled={p.id !== "gm"} label={r.label}
            onChange={(on) => update((s) => ({ rules: s.rules.map((x) => (x.id === r.id ? { ...x, on } : x)) }))} />)}
        </div>
        <SourceNote ids={["s_events", "s_leave"]} />
      </section>
      <section className="panel-card">
        <h2>Bring in your own calendar</h2>
        <p className="muted small">Mycelium reads your <SystemName id="email" /> calendar and keeps only work events. Private ones show to others as "busy", with no details.</p>
        <Switch checked={imported} onChange={setImported} label="Import business events from my calendar" />
        {imported && (
          <ul className="queue" role="list">{PERSONAL.map((e) => (
            <li key={e.title} className="queue-item"><p>{e.business ? e.title : <span className="muted">Busy (private: {e.title})</span>}</p>
              <p className="muted small">{e.business ? "Shared with your team" : "Only you see the title"}</p></li>
          ))}</ul>
        )}
      </section>
      {open && createPortal(
        <dialog ref={ref} className="palette demo-dialog" aria-label={open.title} onClose={() => setOpen(null)} onClick={(e) => e.target === ref.current && ref.current.close()}>
          <EventDialog e={open} onClose={() => ref.current?.close()} />
        </dialog>, document.body)}
    </>
  );
}
