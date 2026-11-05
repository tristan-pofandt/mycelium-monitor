// Home: one page, six different views. What each persona sees first is what their job needs first. The greeting and the
// start strip stay fixed at the top; the cards below come from the registry (homecards.jsx) in the persona's layout
// (layout.js), which anyone can change with Customise: drag by the handle, or Move up and Move down from the keyboard.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { motion, useDragControls } from "framer-motion";
import { Icon } from "../../icons.jsx";
import { useToast } from "../../ui.jsx";
import { DUR, EASE, slow } from "../../choreography.js";
import { useReducedMotion } from "../../reduced.js";
import { DEVICES, INSPECTIONS, LEAVERS, ROLES, dayOffset, person, siteName, under } from "../data.js";
import { useLiveSites } from "../roster.js";
import { addable, cardById, layoutFor, move, sameLayout, titleOf } from "../layout.js";
import { audit, update, useDemo, usePersona } from "../store.js";

const updatedAt = new Date(Date.now() - 3 * 60e3).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };
const avg = (xs) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
const roleName = (id) => ROLES.find((r) => r.id === id)?.name || id;
// Content that needs the whole row (the house rule in app.css and demo.css), so its width can't be toggled.
const FORCED = ":has(.table-wrap, .chart, .week, .board, .team-map)";

function Greeting({ line, bad, children }) {
  const p = usePersona();
  return (
    <div className="greeting">
      <h1><span className="rise-mask"><span className="rise">{greeting()}, {person(p.person).name.split(" ")[0]}</span></span></h1>
      <p className={`state-line state-${bad ? "bad" : "ok"}`}>
        <span className={`badge ${bad ? "badge-bad" : "badge-ok"}`}><Icon name={bad ? "down" : "up"} />{bad ? "Needs attention" : "On track"}</span>
        <span>{line}</span>
        <span className="muted small">Updated {updatedAt}</span>
        {children}
      </p>
    </div>
  );
}

// The greeting line for each persona (fixed, not a card).
function GmLine({ children }) {
  const cov = useLiveSites().find((s) => s.id === "twb").kpi.coverage;
  return <Greeting bad line={`2 sites need you today: Ipswich has 23 overdue work orders, and Toowoomba's roster is ${cov}% covered for the next 7 days.`}>{children}</Greeting>;
}
function SiteLine({ me, children }) {
  const s = useLiveSites().find((x) => x.id === me.site);
  return <Greeting bad line={`${s.name}: ${s.kpi.overdue} overdue work orders and OEE at ${s.kpi.oee}%, the lowest of the four sites.`}>{children}</Greeting>;
}
function SupervisorLine({ me, children }) {
  const team = under(me.id);
  const certs = team.flatMap((p) => p.certs);
  return <Greeting line={`Your ${me.shift.toLowerCase()} shift team: ${team.length} people. ${certs.length ? `${certs.length} certificates expire within 4 weeks.` : ""}`} bad={certs.length > 0}>{children}</Greeting>;
}
const EmployeeLine = ({ me, children }) => <Greeting line={`You're on the ${me.shift.toLowerCase()} shift today at ${siteName(me.site)}, ${me.shift === "Day" ? "6:00 to 14:00" : "14:00 to 22:00"}.`}>{children}</Greeting>;
const SecurityLine = ({ children }) => <Greeting bad line={`${LEAVERS.length} former employees still have active cards, and ${INSPECTIONS.filter((i) => i.due < dayOffset(0)).length} inspections are overdue.`}>{children}</Greeting>;
const ItLine = ({ children }) => <Greeting bad line={`${DEVICES.reduce((n, d) => n + d.count, 0)} managed devices; 5 are out of policy. 2 risky sign-ins this week.`}>{children}</Greeting>;
const LINES = { gm: GmLine, site_manager: SiteLine, supervisor: SupervisorLine, employee: EmployeeLine, security: SecurityLine, it: ItLine };

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

// One card in the grid. In edit mode it gains a tool row (fades in) and its content goes inert; it drags by the grip only.
// shortcut: drag uses framer-motion's drag + layout (what Reorder.Item is built on) because Reorder.Group needs a wrapper
// element, which would take the cards out of the page grid and its reveal, and it only reorders along one axis.
function Slot({ entry, index, count, persona, me, editing, armed, instant, tools }) {
  const card = cardById(entry.id);
  const C = card.component;
  const title = titleOf(card, persona);
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const ref = useRef(null);
  const [forced, setForced] = useState(false);
  const [lifted, setLifted] = useState(false);
  useLayoutEffect(() => { if (editing) setForced(!!ref.current?.matches(FORCED)); }, [editing, entry.size]);
  const wide = !card.full && entry.size === 2;
  // layout stays on from mount: framer only wires its layout animation and the drag's "follow the pointer when the card
  // changes slot" correction for elements that mount with layout, so switching it on in edit mode left the dragged card
  // off screen. Outside edit mode (and for keyboard moves and reduced motion) the duration is 0, so nothing slides.
  const slide = editing && armed && !reduced && !instant;
  return (
    <motion.div ref={ref} data-card={entry.id} className={`home-slot${wide ? " span-2" : ""}${card.full ? " home-full" : ""}${editing ? " is-editing" : ""}${lifted ? " is-lifted" : ""}`}
      layout="position" transition={{ layout: slide ? { duration: DUR.panel * slow(), ease: EASE } : { duration: 0 } }}
      drag={editing} dragListener={false} dragControls={controls} dragSnapToOrigin dragMomentum={false} whileDrag={reduced ? { zIndex: 5 } : { zIndex: 5, scale: 1.02 }}
      onDragStart={() => { setLifted(true); tools.dragStart(entry.id); }} onDrag={(e, info) => tools.dragOver(entry.id, e, info)} onDragEnd={() => { setLifted(false); tools.dragEnd(entry.id); }}>
      {editing && (
        <motion.div className="home-tools" role="group" aria-label={`${title}, position ${index + 1} of ${count}`}
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR.fade * slow(), ease: EASE }}>
          <span className="home-grip" aria-hidden="true" title="Drag to move" onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}><Icon name="grip" /></span>
          <span className="home-tools-name">{title}</span>
          <span className="home-tools-buttons">
            <button type="button" className="icon-button" data-move="up" disabled={index === 0} onClick={(e) => tools.step(entry.id, -1, e)} aria-label="Move up"><Icon name="chevron" className="flip" /></button>
            <button type="button" className="icon-button" data-move="down" disabled={index === count - 1} onClick={(e) => tools.step(entry.id, 1, e)} aria-label="Move down"><Icon name="chevron" /></button>
            {card.sizes.length > 1 && !forced && <button type="button" className="button home-size" aria-pressed={entry.size === 2} onClick={() => tools.size(entry.id)}>Wide</button>}
            <button type="button" className="button" onClick={() => tools.hide(entry.id)}>Hide</button>
          </span>
        </motion.div>
      )}
      <div className="home-card" inert={editing ? "" : undefined}><C persona={persona} me={me} /></div>
    </motion.div>
  );
}

function AddSheet({ open, onClose, cards, persona, onAdd }) {
  const ref = useRef(null);
  useEffect(() => { if (open) ref.current?.showModal?.(); else ref.current?.close?.(); }, [open]);
  return createPortal(
    <dialog ref={ref} className="palette demo-dialog" aria-labelledby="add-card-h" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current.close()}>
      <div className="dialog-body">
        <div className="card-head">
          <h2 id="add-card-h">Add a card</h2>
          <button type="button" className="icon-button" onClick={() => ref.current?.close()} aria-label="Close"><Icon name="close" /></button>
        </div>
        <p className="muted small">The cards your role may have that aren't on your Home. A card needing a permission you don't have isn't offered.</p>
        {cards.length ? (
          <ul className="queue" role="list">{cards.map((c) => (
            <li key={c.id} className="queue-item home-add-row">
              <p><strong>{titleOf(c, persona)}</strong></p>
              <button type="button" className="button" onClick={() => onAdd(c.id)}>Add<span className="sr-only"> {titleOf(c, persona)}</span></button>
            </li>
          ))}</ul>
        ) : <p className="muted">Every card your role may have is already on your Home.</p>}
      </div>
    </dialog>,
    document.body,
  );
}

export default function Home() {
  const p = usePersona();
  const me = person(p.person);
  const toast = useToast();
  const { layouts, grants, roleLayouts } = useDemo();
  const saved = layoutFor(p.id, layouts, grants, roleLayouts);
  const [draft, setDraft] = useState(null); // the layout being edited; null when not editing
  const [armed, setArmed] = useState(false); // sliding starts a frame after edit mode, so entering it moves nothing
  const [adding, setAdding] = useState(false);
  const [instant, setInstant] = useState(false);
  const [said, setSaid] = useState("");
  const editing = !!draft;
  const layout = draft || saved;
  const caps = grants[p.id] || [];
  const drag = useRef({ from: -1, over: null });
  const Line = LINES[p.id] || ItLine;

  useEffect(() => {
    if (!editing) { setArmed(false); return undefined; }
    const r = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(r);
  }, [editing]);

  const focus = (sel) => requestAnimationFrame(() => document.querySelector(sel)?.focus());
  const nameOf = (id) => titleOf(cardById(id), p.id);
  const say = (text) => setSaid((s) => (s === text ? `${text} ` : text)); // a repeat still gets announced
  const start = () => { setDraft(saved); focus(".home-edit-add"); };
  const stop = () => { setDraft(null); setAdding(false); focus(".home-customise"); };

  const tools = {
    step(id, by, e) {
      setInstant(e?.detail === 0); // a keyboard press moves at once; a click slides (keyboard actions never animate)
      const from = draft.findIndex((x) => x.id === id), to = from + by;
      if (to < 0 || to >= draft.length) return;
      setDraft(move(draft, from, to));
      say(`${nameOf(id)} moved to position ${to + 1} of ${draft.length}`);
      if (to === 0 || to === draft.length - 1) focus(`.home-slot[data-card="${id}"] [data-move="${by < 0 ? "down" : "up"}"]`);
    },
    size(id) {
      const next = draft.map((x) => (x.id === id ? { ...x, size: x.size === 2 ? 1 : 2 } : x));
      setDraft(next);
      say(`${nameOf(id)} is now ${next.find((x) => x.id === id).size === 2 ? "two columns" : "one column"} wide`);
    },
    hide(id) {
      const i = draft.findIndex((x) => x.id === id);
      const next = draft.filter((x) => x.id !== id);
      setDraft(next);
      say(`${nameOf(id)} hidden. Add it back from Add a card.`);
      const after = next[i] || next[i - 1];
      focus(after ? `.home-slot[data-card="${after.id}"] .home-tools button:not(:disabled)` : ".home-edit-add");
    },
    dragStart(id) { setInstant(false); drag.current = { from: draft.findIndex((x) => x.id === id), over: null }; },
    dragOver(id, e, info) {
      // Hit-test the slots where they sit in the grid (offset boxes ignore transforms), not where they are drawn: a card still
      // sliding away under the pointer would otherwise be "entered" again and swap straight back.
      const { x, y } = info.point; // page coordinates
      const hit = (s) => { const p = s.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 }; const l = p.left + scrollX + s.offsetLeft, t = p.top + scrollY + s.offsetTop; return x >= l && x <= l + s.offsetWidth && y >= t && y <= t + s.offsetHeight; };
      const over = [...document.querySelectorAll(".home-slot")].find((s) => s.dataset.card !== id && hit(s))?.dataset.card || null;
      if (over === drag.current.over) return;
      drag.current.over = over; // one move per card entered, so a card sliding under the pointer doesn't bounce back
      if (over) setDraft((d) => move(d, d.findIndex((c) => c.id === id), d.findIndex((c) => c.id === over)));
    },
    dragEnd(id) {
      const to = draft.findIndex((x) => x.id === id);
      if (to !== drag.current.from) say(`${nameOf(id)} moved to position ${to + 1} of ${draft.length}`);
    },
  };

  const add = (id) => {
    const card = cardById(id);
    const next = [...draft, { id, size: card.sizes[0] }];
    setDraft(next);
    say(`${nameOf(id)} added at position ${next.length} of ${next.length}`);
    if (!addable(p.id, next, caps).length) setAdding(false);
  };
  const done = () => {
    const prev = layouts[p.id];
    if (!sameLayout(draft, saved)) {
      update((s) => ({ layouts: { ...s.layouts, [p.id]: draft } }));
      audit(`changed their Home layout (${draft.length} cards)`);
      toast({ title: "Home saved. Only you see this layout.", tone: "good", action: { label: "Undo", onClick: () => {
        update((s) => { const x = { ...s.layouts }; if (prev) x[p.id] = prev; else delete x[p.id]; return { layouts: x }; });
        audit("undid their Home layout change");
      } } });
    }
    stop();
  };
  const reset = () => {
    const prev = layouts[p.id];
    update((s) => { const x = { ...s.layouts }; delete x[p.id]; return { layouts: x }; });
    if (prev) audit(`reset their Home to the ${roleName(p.id)} default`);
    toast({ title: `Home is back to the ${roleName(p.id)} default.`, action: prev ? { label: "Undo", onClick: () => { update((s) => ({ layouts: { ...s.layouts, [p.id]: prev } })); audit("undid their Home reset"); } } : undefined });
    stop();
  };

  return (
    <>
      <Line me={me}>
        {editing ? (
          <span className="home-edit-bar">
            <span className="home-edit-hint">Drag a card by its handle, or use Move up and Move down.</span>
            <button type="button" className="button home-edit-add" onClick={() => setAdding(true)}>Add a card</button>
            <button type="button" className="button" onClick={reset}>Reset to my role's default</button>
            <button type="button" className="button" onClick={stop}>Cancel</button>
            <button type="button" className="button button-primary" onClick={done}>Done</button>
          </span>
        ) : <button type="button" className="link small home-customise" onClick={start}><Icon name="settings" /> Customise</button>}
      </Line>
      {p.id === "gm" && <StartStrip />}
      {layout.map((x, i, all) => (
        <Slot key={x.id} entry={x} index={i} count={all.length} persona={p.id} me={me} editing={editing} armed={armed} instant={instant} tools={tools} />
      ))}
      {editing && !layout.length && <p className="notice home-empty">Your Home has no cards. Use Add a card, or Reset to my role's default.</p>}
      {editing && <AddSheet open={adding} onClose={() => setAdding(false)} cards={addable(p.id, layout, caps)} persona={p.id} onAdd={add} />}
      {createPortal(<p className="sr-only home-live" aria-live="polite">{said}</p>, document.body)}
    </>
  );
}
