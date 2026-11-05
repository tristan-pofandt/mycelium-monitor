// Customisable dashboard: any page of cards that people can rearrange. Kit file: keep identical in every Mycelium repo
// (docs/design/parts.md, "Customisable dashboard"; motion in docs/design/motion.md, "Drag and drop").
//
//   const board = useCustomise({ layout, cards, onSave, onReset });
//   <Greeting>{board.bar}</Greeting>   // the Customise link, or the edit bar while editing
//   {board.slots}                      // one grid item per card, straight inside <Page>
//   {board.extras}                     // empty notice, Add a card dialog, spoken updates
//
// layout: [{ id, size }] (size 1 or 2 columns), the saved order. cards: every card this viewer may have, as
// { id, title, sizes: [1] | [2] | [1, 2], full?, render() }; cards not in the layout are offered by Add a card.
// onSave(next) runs from Done when the layout changed; onReset() (optional) adds a Reset button.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls } from "framer-motion";
import { Icon } from "./icons.jsx";
import { DUR, EASE, slow } from "./choreography.js";
import { useReducedMotion } from "./reduced.js";

export function moveItem(layout, from, to) {
  if (to < 0 || to >= layout.length || from === to) return layout;
  const next = [...layout];
  next.splice(to, 0, ...next.splice(from, 1));
  return next;
}
export const sameLayout = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// One card. In edit mode it gains a tool row (fades in) and its content goes inert; it drags by the grip only.
// shortcut: drag uses framer-motion's drag + layout (what Reorder.Item is built on) because Reorder.Group needs a wrapper
// element, which would take the cards out of the page grid and its reveal, and it only reorders along one axis.
function Slot({ entry, card, index, count, editing, armed, instant, tools }) {
  const reduced = useReducedMotion();
  const controls = useDragControls();
  const ref = useRef(null);
  const [forced, setForced] = useState(false);
  const [lifted, setLifted] = useState(false);
  // A card whose content takes the whole row anyway (a table, a chart: app.css) can't be made Wide.
  useLayoutEffect(() => { if (editing && ref.current) setForced(getComputedStyle(ref.current).gridColumnEnd === "-1"); }, [editing, entry.size]);
  const wide = !card.full && entry.size === 2;
  // layout stays on from mount: framer only wires its layout animation and the drag's "follow the pointer when the card
  // changes slot" correction for elements that mount with layout. Outside edit mode (and for keyboard moves and reduced
  // motion) the duration is 0, so nothing slides.
  const slide = editing && armed && !reduced && !instant;
  return (
    <motion.div ref={ref} data-card={entry.id} className={`cust-slot${wide ? " span-2" : ""}${card.full ? " cust-full" : ""}${editing ? " is-editing" : ""}${lifted ? " is-lifted" : ""}`}
      layout="position" transition={{ layout: slide ? { duration: DUR.panel * slow(), ease: EASE } : { duration: 0 } }}
      drag={editing} dragListener={false} dragControls={controls} dragSnapToOrigin dragMomentum={false} whileDrag={reduced ? { zIndex: 5 } : { zIndex: 5, scale: 1.02 }}
      onDragStart={() => { setLifted(true); tools.dragStart(entry.id); }} onDrag={(e, info) => tools.dragOver(entry.id, info)} onDragEnd={() => { setLifted(false); tools.dragEnd(entry.id); }}>
      {editing && (
        <motion.div className="cust-tools" role="group" aria-label={`${card.title}, position ${index + 1} of ${count}`}
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR.fade * slow(), ease: EASE }}>
          <span className="cust-grip" aria-hidden="true" title="Drag to move" onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}><Icon name="grip" /></span>
          <span className="cust-tools-name">{card.title}</span>
          <span className="cust-tools-buttons">
            <button type="button" className="icon-button" data-move="up" disabled={index === 0} onClick={(e) => tools.step(entry.id, -1, e)} aria-label="Move up"><Icon name="chevron" className="flip" /></button>
            <button type="button" className="icon-button" data-move="down" disabled={index === count - 1} onClick={(e) => tools.step(entry.id, 1, e)} aria-label="Move down"><Icon name="chevron" /></button>
            {card.sizes.length > 1 && !forced && <button type="button" className="button cust-size" aria-pressed={entry.size === 2} onClick={() => tools.size(entry.id)}>Wide</button>}
            <button type="button" className="button" onClick={() => tools.hide(entry.id)}>Hide</button>
          </span>
        </motion.div>
      )}
      <div className="cust-card" inert={editing ? "" : undefined}>{card.render()}</div>
    </motion.div>
  );
}

function AddSheet({ open, onClose, cards, onAdd, note }) {
  const ref = useRef(null);
  useEffect(() => { if (open) ref.current?.showModal?.(); else ref.current?.close?.(); }, [open]);
  return createPortal(
    <dialog ref={ref} className="palette dialog" aria-labelledby="add-card-h" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current.close()}>
      <div className="dialog-body">
        <div className="card-head">
          <h2 id="add-card-h">Add a card</h2>
          <button type="button" className="icon-button" onClick={() => ref.current?.close()} aria-label="Close"><Icon name="close" /></button>
        </div>
        {note && <p className="muted small">{note}</p>}
        {cards.length ? (
          <ul className="queue" role="list">{cards.map((c) => (
            <li key={c.id} className="queue-item cust-add-row">
              <p><strong>{c.title}</strong></p>
              <button type="button" className="button" onClick={() => onAdd(c.id)}>Add<span className="sr-only"> {c.title}</span></button>
            </li>
          ))}</ul>
        ) : <p className="muted">Every card you may have is already here.</p>}
      </div>
    </dialog>,
    document.body,
  );
}

export function useCustomise({ layout: saved, cards, onSave, onReset, resetLabel = "Reset to default", addNote, emptyText = "No cards here. Use Add a card." }) {
  const [draft, setDraft] = useState(null); // the layout being edited; null when not editing
  const [armed, setArmed] = useState(false); // sliding starts a frame after edit mode, so entering it moves nothing
  const [adding, setAdding] = useState(false);
  const [instant, setInstant] = useState(false);
  const [said, setSaid] = useState("");
  const drag = useRef({ from: -1, over: null });
  const editing = !!draft;
  const byId = (id) => cards.find((c) => c.id === id);
  const layout = (draft || saved).filter((x) => byId(x.id)); // a card the viewer may no longer have drops out

  useEffect(() => {
    if (!editing) { setArmed(false); return undefined; }
    const r = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(r);
  }, [editing]);
  useEffect(() => {
    if (!editing) return undefined;
    const onKey = (e) => { if (e.key === "Escape" && !adding) stop(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [editing, adding]);

  const focus = (sel) => requestAnimationFrame(() => document.querySelector(sel)?.focus());
  const nameOf = (id) => byId(id)?.title || id;
  const say = (text) => setSaid((s) => (s === text ? `${text} ` : text)); // a repeat still gets announced
  const start = () => { setDraft(layout); focus(".cust-edit-add"); };
  function stop() { setDraft(null); setAdding(false); focus(".cust-open"); }

  const tools = {
    step(id, by, e) {
      setInstant(e?.detail === 0); // a keyboard press moves at once; a click slides (keyboard actions never animate)
      const from = layout.findIndex((x) => x.id === id), to = from + by;
      if (to < 0 || to >= layout.length) return;
      setDraft(moveItem(layout, from, to));
      say(`${nameOf(id)} moved to position ${to + 1} of ${layout.length}`);
      if (to === 0 || to === layout.length - 1) focus(`.cust-slot[data-card="${id}"] [data-move="${by < 0 ? "down" : "up"}"]`);
    },
    size(id) {
      const next = layout.map((x) => (x.id === id ? { ...x, size: x.size === 2 ? 1 : 2 } : x));
      setDraft(next);
      say(`${nameOf(id)} is now ${next.find((x) => x.id === id).size === 2 ? "two columns" : "one column"} wide`);
    },
    hide(id) {
      const i = layout.findIndex((x) => x.id === id);
      const next = layout.filter((x) => x.id !== id);
      setDraft(next);
      say(`${nameOf(id)} hidden. Add it back from Add a card.`);
      const after = next[i] || next[i - 1];
      focus(after ? `.cust-slot[data-card="${after.id}"] .cust-tools button:not(:disabled)` : ".cust-edit-add");
    },
    dragStart(id) { setInstant(false); drag.current = { from: layout.findIndex((x) => x.id === id), over: null }; },
    dragOver(id, info) {
      // Hit-test the slots where they sit in the grid (offset boxes ignore transforms), not where they are drawn: a card still
      // sliding away under the pointer would otherwise be "entered" again and swap straight back.
      const { x, y } = info.point; // page coordinates
      const hit = (s) => { const p = s.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 }; const l = p.left + scrollX + s.offsetLeft, t = p.top + scrollY + s.offsetTop; return x >= l && x <= l + s.offsetWidth && y >= t && y <= t + s.offsetHeight; };
      const over = [...document.querySelectorAll(".cust-slot")].find((s) => s.dataset.card !== id && hit(s))?.dataset.card || null;
      if (over === drag.current.over) return;
      drag.current.over = over; // one move per card entered, so a card sliding under the pointer doesn't bounce back
      if (over) setDraft((d) => moveItem(d, d.findIndex((c) => c.id === id), d.findIndex((c) => c.id === over)));
    },
    dragEnd(id) {
      const to = layout.findIndex((x) => x.id === id);
      if (to !== drag.current.from) say(`${nameOf(id)} moved to position ${to + 1} of ${layout.length}`);
    },
  };

  const spare = cards.filter((c) => !layout.some((x) => x.id === c.id));
  const add = (id) => {
    const next = [...layout, { id, size: byId(id).sizes[0] }];
    setDraft(next);
    say(`${nameOf(id)} added at position ${next.length} of ${next.length}`);
    if (spare.length <= 1) setAdding(false);
  };
  const done = () => { if (!sameLayout(layout, saved)) onSave(layout); stop(); };
  const reset = () => { onReset(); stop(); };

  const bar = editing ? (
    <span className="cust-edit-bar">
      <span className="cust-edit-hint">Drag a card by its handle, or use Move up and Move down.</span>
      <button type="button" className="button cust-edit-add" onClick={() => setAdding(true)}>Add a card</button>
      {onReset && <button type="button" className="button" onClick={reset}>{resetLabel}</button>}
      <button type="button" className="button" onClick={stop}>Cancel</button>
      <button type="button" className="button button-primary" onClick={done}>Done</button>
    </span>
  ) : <button type="button" className="link small cust-open" onClick={start}><Icon name="settings" /> Customise</button>;

  const slots = layout.map((x, i, all) => (
    <Slot key={x.id} entry={x} card={byId(x.id)} index={i} count={all.length} editing={editing} armed={armed} instant={instant} tools={tools} />
  ));

  const extras = (
    <>
      {editing && !layout.length && <p className="notice cust-empty">{emptyText}</p>}
      {editing && <AddSheet open={adding} onClose={() => setAdding(false)} cards={spare} onAdd={add} note={addNote} />}
      {createPortal(<p className="sr-only" aria-live="polite">{said}</p>, document.body)}
    </>
  );
  return { bar, slots, extras, editing };
}
