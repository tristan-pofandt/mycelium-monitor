// Rosters: plan this week and next for a team (Shift Supervisor) or a site (Site Manager), checked against the rules as you
// go, then handed to the rostering system, which stays the record. The GM sees coverage only. Data and rules: roster.js.
// The grid is a real table: arrow keys move between cells, Enter opens the shift list; with a mouse, drag a shift onto one
// of the same person's days off to add an extra shift (the keyboard path is the list).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CSS_EASE, IN_CURVE, fx } from "../../choreography.js";
import { Icon } from "../../icons.jsx";
import { TaskChip, useTask } from "../../tasks.jsx";
import { rovingKeys, useToast } from "../../ui.jsx";
import { PEOPLE, SITES, person, siteName } from "../data.js";
import { SourceNote, decide, useApprovals } from "../bits.jsx";
import { SystemName, useSystemName } from "../feedback.jsx";
import { audit, update, useCan, useDemo, usePersona } from "../store.js";
import { rosterWeatherRisks } from "../weather.js";
import { TEAMS, TODAY_INDEX, baseShift, cellKey, coverageOn, coveragePercent, dayDate, dayLabel, fillGaps, isWork, rosterDiff, rosterProblems, siteShifts, teamName, teamOf, useRoster } from "../roster.js";
import "../roster.css";

const WORD = { Day: "Day shift", Afternoon: "Afternoon shift", Night: "Night shift", Off: "Off", Leave: "On leave" };
const KIND = { weather: ["Weather", "badge-warn"], skill: ["Skills", "badge-bad"], leave: ["Leave", "badge-bad"], coverage: ["Short", "badge-warn"], rest: ["Rest", "badge-warn"], hours: ["Hours", "badge-warn"] };
const longDay = (d) => dayDate(d).toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" });
const coverWord = (c) => (c.have >= c.need ? ["Covered", "badge-ok"] : [`Short ${c.need - c.have}`, c.need - c.have > 2 ? "badge-bad" : "badge-warn"]);
const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

function WeekSwitch({ week, setWeek }) {
  return (
    <div role="group" aria-label="Week" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
      {[[0, "This week"], [7, "Next week"]].map(([w, label]) => (
        <button key={w} type="button" aria-pressed={week === w} onClick={() => setWeek(w)}>{label}<span className="sr-only">, from {dayLabel(w)}</span></button>
      ))}
    </div>
  );
}

function TeamSelect({ teams, team, setTeam }) {
  if (teams.length < 2) return null;
  return (
    <label>Team <select className="input" value={team} onChange={(e) => setTeam(e.target.value)}>
      <option value="all">All teams ({teams.reduce((n, t) => n + t.members.length, 0)} people)</option>
      {teams.map((t) => <option key={t.id} value={t.id}>{teamName(t)}</option>)}
    </select></label>
  );
}

// The shift list for one cell: a listbox like Picker's, opened from the cell (Picker can't be opened from outside).
function ShiftMenu({ cell, options, current, label, onPick, onClose }) {
  const list = useRef(null);
  const [i, setI] = useState(Math.max(0, options.indexOf(current)));
  const [, follow] = useState(0);
  const r = cell.el.getBoundingClientRect();
  const h = options.length * 40 + 14;
  useEffect(() => {
    list.current?.focus({ preventScroll: true });
    const down = (e) => { if (!list.current?.contains(e.target) && !cell.el.contains(e.target)) onClose(false); };
    // Scrolling or resizing moves the list with its cell; closing here would drop keyboard focus onto the page.
    const move = () => follow((n) => n + 1);
    addEventListener("pointerdown", down); addEventListener("scroll", move, true); addEventListener("resize", move);
    return () => { removeEventListener("pointerdown", down); removeEventListener("scroll", move, true); removeEventListener("resize", move); };
  }, []);
  const onKey = (e) => {
    const n = options.length;
    if (e.key === "ArrowDown") { e.preventDefault(); setI((k) => (k + 1) % n); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI((k) => (k - 1 + n) % n); }
    else if (e.key === "Home") { e.preventDefault(); setI(0); }
    else if (e.key === "End") { e.preventDefault(); setI(n - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(options[i]); }
    else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); onClose(true); }
  };
  const above = r.bottom + 4 + h > innerHeight;
  const top = above ? Math.max(8, r.top - 4 - h) : r.bottom + 4;
  return createPortal(
    <ul ref={list} className="popover shift-menu" role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`shift-opt-${i}`} onKeyDown={onKey}
      style={{ top, left: Math.max(8, Math.min(r.left, innerWidth - 216)), transformOrigin: above ? "bottom left" : "top left" }}>
      {options.map((o, k) => (
        <li key={o} id={`shift-opt-${k}`} role="option" aria-selected={o === current} className={k === i ? "is-active" : ""} onPointerMove={() => setI(k)} onClick={() => onPick(o)}>
          {WORD[o]}{o === current && <Icon name="check" size={14} />}
        </li>
      ))}
    </ul>, document.body);
}

// The week grid. readOnly: plain text cells (the GM's view). flagged: Map of cell key -> problem text.
function RosterGrid({ people, teams, roster, edits, leave, week, readOnly, onSet, flagged, caption }) {
  const days = Array.from({ length: 7 }, (_, i) => week + i);
  const [activeRaw, setActive] = useState([0, Math.max(0, Math.min(6, TODAY_INDEX - week))]);
  const active = [Math.min(activeRaw[0], people.length - 1), activeRaw[1]]; // a smaller team must still leave one cell in the Tab order
  const [menu, setMenu] = useState(null);
  const table = useRef(null);
  const drag = useRef(null);
  const settle = useRef(null);
  const leads = new Set(teams.map((t) => t.id));

  // A chip dropped into a cell settles from 0.96 (fx skips it under reduced motion). Keyboard changes never animate.
  useLayoutEffect(() => {
    const key = settle.current;
    if (!key) return;
    settle.current = null;
    const chip = table.current?.querySelector(`[data-cell="${key}"] .shift-chip`);
    if (chip) fx([chip], [{ scale: "0.96" }, { scale: "1" }], { duration: 180, easing: CSS_EASE, props: ["scale"] });
  });

  const editable = (d) => !readOnly && d >= TODAY_INDEX;
  const onKeyDown = (e) => {
    if (e.target.closest('[role="listbox"]')) return; // the shift list handles its own keys (it bubbles here through the portal)
    const b = e.target.closest("[data-r]");
    if (!b) return;
    let r = Number(b.dataset.r), c = Number(b.dataset.c);
    if (e.key === "ArrowRight") c++; else if (e.key === "ArrowLeft") c--; else if (e.key === "ArrowDown") r++; else if (e.key === "ArrowUp") r--;
    else if (e.key === "Home") { c = 0; if (e.ctrlKey) r = 0; } else if (e.key === "End") { c = 6; if (e.ctrlKey) r = people.length - 1; } else return;
    const next = table.current.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    if (!next) return;
    e.preventDefault();
    next.focus();
  };

  // Pointer drag (mouse and pen; touch keeps scrolling the table). A ghost of the chip follows the pointer; the source stays.
  const valid = (g, target) => {
    if (!target) return false;
    const [id, d] = target.dataset.cell.split("|");
    return id === g.id && Number(d) !== g.day && editable(Number(d)) && roster[id][Number(d)] === "Off";
  };
  const onPointerDown = (e) => {
    if (readOnly || e.button !== 0 || e.pointerType === "touch" || drag.current?.ghost) return;
    const b = e.target.closest("button[data-cell]");
    if (!b) return;
    const [id, d] = b.dataset.cell.split("|");
    if (!isWork(roster[id][Number(d)])) return;
    drag.current = { b, id, day: Number(d), shift: roster[id][Number(d)], x: e.clientX, y: e.clientY, pid: e.pointerId };
  };
  const onPointerMove = (e) => {
    const g = drag.current;
    if (!g?.b || g.pid !== e.pointerId) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.ghost) {
      if (Math.hypot(dx, dy) < 5) return; // a click, not a drag, until it travels
      const chip = g.b.querySelector(".shift-chip"), rect = chip.getBoundingClientRect();
      g.ghost = chip.cloneNode(true);
      g.ghost.classList.add("roster-ghost");
      Object.assign(g.ghost.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px` });
      document.body.append(g.ghost);
      fx([g.ghost], [{ scale: "1" }, { scale: "1.04" }], { duration: 120, easing: CSS_EASE, props: ["scale"] }); // the lift reads as "picked up"
      g.b.setPointerCapture(e.pointerId);
      g.b.classList.add("is-source");
      g.esc = (k) => { if (k.key === "Escape") end(null, true); };
      addEventListener("keydown", g.esc);
    }
    g.ghost.style.translate = `${dx}px ${dy}px`;
    g.dx = dx; g.dy = dy;
    const td = document.elementFromPoint(e.clientX, e.clientY)?.closest("td[data-day]");
    const target = td && table.current.contains(td) ? td.querySelector("button[data-cell]") : null;
    if (g.over !== target) {
      g.over?.classList.remove("is-drop-ok", "is-drop-no");
      g.ok = valid(g, target);
      target?.classList.add(g.ok ? "is-drop-ok" : "is-drop-no");
      g.over = target;
    }
  };
  function end(e, cancel = false) {
    const g = drag.current;
    if (g?.held && e) { drag.current = { suppress: true }; setTimeout(() => { if (drag.current?.suppress) drag.current = null; }, 0); return; } // release after Escape: swallow its click
    if (!g?.b || (e && g.pid !== e.pointerId)) return;
    if (!g.ghost) { drag.current = null; return; } // it was a click: the cell opens its list
    removeEventListener("keydown", g.esc);
    g.over?.classList.remove("is-drop-ok", "is-drop-no");
    g.b.classList.remove("is-source");
    if (!cancel && g.ok) {
      g.ghost.remove();
      const [id, d] = g.over.dataset.cell.split("|");
      settle.current = g.over.dataset.cell;
      onSet(id, Number(d), g.shift, "drag");
    } else { // rejected: the ghost springs home over 0.2 s, then goes
      const { ghost, dx, dy } = g;
      fx([ghost], IN_CURVE.map((v, i) => ({ offset: i / (IN_CURVE.length - 1), translate: `${(dx * (1 - v)).toFixed(1)}px ${(dy * (1 - v)).toFixed(1)}px` })),
        { duration: 200, props: ["translate"], done: (el) => el.remove() }).finished.then(() => ghost.remove());
    }
    if (!e) { drag.current = { held: true }; return; } // Escape: the button is still down, so wait for its release
    drag.current = { suppress: true }; // swallow the click that follows the pointerup
    setTimeout(() => { if (drag.current?.suppress) drag.current = null; }, 0);
  }

  const menuCell = menu && { p: person(menu.id), s: roster[menu.id][menu.day] };
  return (
    <div className="table-wrap roster-wrap">
      <table ref={table} className="table roster-grid" role={readOnly ? undefined : "grid"} aria-label={caption}
        onKeyDown={readOnly ? undefined : onKeyDown} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={(e) => end(e)} onPointerCancel={(e) => end(e, true)}>
        {readOnly && <caption className="sr-only">{caption}</caption>}
        <thead><tr>
          <th scope="col">Person</th>
          {days.map((d) => (
            <th key={d} scope="col" className={d === TODAY_INDEX ? "is-today" : ""}>
              {dayDate(d).toLocaleDateString([], { weekday: "short" })}<span className="muted small block">{dayDate(d).toLocaleDateString([], { day: "numeric", month: "short" })}{d === TODAY_INDEX ? ", today" : ""}</span>
            </th>
          ))}
        </tr></thead>
        <tbody>{people.map((p, r) => (
          <tr key={p.id}>
            <th scope="row"><span className="roster-name">{p.name}</span><span className="muted small block">{leads.has(p.id) ? "Supervisor" : p.title}</span></th>
            {days.map((d, c) => {
              const key = cellKey(p.id, d), s = roster[p.id][d], changed = key in edits, flag = flagged?.get(key);
              const chip = <span className={`shift-chip shift-${s.toLowerCase()}`} aria-hidden={!readOnly}>{s}</span>;
              return (
                <td key={d} data-day={d} className={d < TODAY_INDEX ? "is-past" : ""}>
                  {readOnly ? <>{chip}{s === "Leave" && <span className="sr-only"> (approved leave)</span>}</> : (
                    <button type="button" className="roster-cell" data-cell={key} data-r={r} data-c={c} tabIndex={active[0] === r && active[1] === c ? 0 : -1}
                      aria-label={`${p.name}, ${longDay(d)}, ${WORD[s]}${changed ? ", changed" : ""}${flag ? `. Problem: ${flag}` : ""}${editable(d) ? "" : ". Past day, can't change"}`}
                      aria-haspopup={editable(d) ? "listbox" : undefined} aria-disabled={editable(d) ? undefined : true}
                      onFocus={() => setActive([r, c])}
                      onClick={(e) => { if (drag.current?.suppress) { drag.current = null; return; } if (editable(d)) setMenu({ id: p.id, day: d, el: e.currentTarget }); }}>
                      {chip}
                      {changed && <span className="cell-mark" aria-hidden="true" />}
                      {flag && <span className="cell-flag" aria-hidden="true"><Icon name="errors" size={12} /></span>}
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        ))}</tbody>
        <tfoot><tr>
          <th scope="row">On shift<span className="muted small block">against need</span></th>
          {days.map((d) => (
            <td key={d} id={`cov-${d}`} tabIndex={-1} className="cov-cell">
              {coverageOn(roster, teams, d).map((c) => { const [word, tone] = coverWord(c); return (
                <span key={c.shift} className="cov-line"><span>{c.shift} {c.have} of {c.need}</span> <span className={`badge ${tone}`}>{word}</span></span>
              ); })}
            </td>
          ))}
        </tr></tfoot>
      </table>
      {menu && (
        <ShiftMenu cell={menu} current={menuCell.s} label={`${menuCell.p.name}, ${longDay(menu.day)}`}
          options={[...siteShifts(menuCell.p.site), "Off", ...((leave[menu.id] || []).includes(menu.day) ? ["Leave"] : [])]}
          onPick={(o) => { if (o !== menuCell.s) onSet(menu.id, menu.day, o, "list"); menu.el.focus(); setMenu(null); }}
          onClose={(refocus) => { if (refocus) menu.el.focus(); setMenu(null); }} />
      )}
    </div>
  );
}

function Problems({ problems, goTo }) {
  const [all, setAll] = useState(false);
  const shown = all ? problems : problems.slice(0, 8);
  return (
    <section className="panel-card roster-problems">
      <div className="card-head"><div><h2>Problems</h2>
        <p className="card-sub" role="status">{problems.length ? `${problems.length} from today to ${dayLabel(13)}, checked as you change the roster` : "None. The roster meets every rule."}</p></div></div>
      {problems.length > 0 && (
        <ul className="queue" role="list">{shown.map((x, i) => (
          <li key={`${x.kind}${x.cell || x.team || x.machine}${x.day}${i}`} className="queue-item">
            <p><span className={`badge ${KIND[x.kind][1]}`}>{KIND[x.kind][0]}</span> <button type="button" className="link" onClick={() => goTo(x)}>{x.text}<span className="sr-only"> Go to the cell.</span></button></p>
          </li>
        ))}</ul>
      )}
      {problems.length > 8 && <button type="button" className="link small" onClick={() => setAll((v) => !v)}>{all ? "Show fewer" : `Show all ${problems.length}`}</button>}
      <p className="muted small">The rules: at least 10 hours' rest between shifts, no more than 48 hours a week, approved leave kept, each team at its headcount, and a current ticket for every machine on every shift.</p>
      <SourceNote ids={["rostering", "training", "hr"]} />
    </section>
  );
}

function FillGaps({ roster, people, leave, onSet }) {
  const [list, setList] = useState(null);
  const open = list?.suggestions.filter((s) => roster[s.person]?.[s.day] === "Off") || [];
  return (
    <section className="panel-card roster-fill">
      <div className="card-head"><div><h2>Fill gaps</h2><p className="card-sub">Suggestions for short shifts and machines without a ticket holder. Nothing changes until you accept it.</p></div></div>
      <div className="actions"><button type="button" className="button" onClick={() => { setList(fillGaps(roster, { people, leave })); audit("asked for roster suggestions"); }}>{list ? "Suggest again" : "Suggest people"}</button></div>
      {list && (open.length ? (
        <ul className="queue" role="list" aria-label="Suggestions">{open.map((s) => (
          <li key={s.key} className="queue-item">
            <p><strong>{person(s.person).name}</strong> on the {s.shift.toLowerCase()} shift, {dayLabel(s.day)}</p>
            <p className="muted small">{s.why}</p>
            <div className="actions">
              <button type="button" className="button button-primary" onClick={() => onSet(s.person, s.day, s.shift, "suggestion")}>Accept<span className="sr-only"> {person(s.person).name}, {dayLabel(s.day)}</span></button>
              <button type="button" className="button" onClick={() => setList((l) => ({ ...l, suggestions: l.suggestions.filter((x) => x !== s) }))}>Skip<span className="sr-only"> {person(s.person).name}, {dayLabel(s.day)}</span></button>
            </div>
          </li>
        ))}</ul>
      ) : <p className="muted small" role="status">{list.suggestions.length || list.left.length ? "No more suggestions." : "Nothing to fill: every shift is at headcount and every machine has a ticket holder."}</p>)}
      {list?.left.length > 0 && <p className="notice small">{list.left.length === 1 ? "One gap has" : `${list.left.length} gaps have`} nobody suitable you can roster, for example: {list.left[0].text} Someone needs a ticket, or another team has to help.</p>}
      <SourceNote ids={["training"]} />
    </section>
  );
}

// "Send to UKG": the diff since the last hand-off, Site Manager approval for a supervisor's roster, then a simulated hand-off.
function SendCard({ persona, me, people, edits, leave, problems, scope }) {
  const sys = useSystemName("rostering");
  const toast = useToast();
  const sent = useDemo((s) => s.rosterSent);
  const approvals = useDemo((s) => s.approvals);
  const { pending } = useApprovals();
  const [task, run] = useTask();
  const [open, setOpen] = useState(false);
  const ids = useMemo(() => new Set(people.map((p) => p.id)), [people]);
  const published = (sent?.status === "sent" ? sent.edits : sent?.prev) || {};
  const verdict = sent?.status === "pending" ? approvals[sent.requestId] : null;
  const waitingOn = sent?.status === "pending" && verdict !== "Declined"; // what's with the Site Manager counts as sent
  const diff = rosterDiff(edits, waitingOn ? sent.edits : published, ids, leave);
  const sm = PEOPLE.find((p) => p.site === me.site && p.role === "site_manager");
  const waiting = pending.filter((a) => a.kind === "Roster" && a.roster);
  const snapshot = () => ({ ...Object.fromEntries(Object.entries(published).filter(([k]) => !ids.has(k.split("|")[0]))), ...Object.fromEntries(Object.entries(edits).filter(([k]) => ids.has(k.split("|")[0]))) });

  const handOff = async (snap, n) => {
    await run({ name: `Send to ${sys}`, arg: `${n} ${n === 1 ? "shift" : "shifts"}`, expectedMs: 1600, action: () => new Promise((r) => setTimeout(r, 1600)),
      done: () => `Published in ${sys} (simulated). ${sys} stays the record.` });
    update((s) => ({ rosterSent: { ...s.rosterSent, status: "sent", edits: snap, at: now(), by: persona.label.replace(" (you)", "") } }));
    audit(`handed ${n} roster ${n === 1 ? "change" : "changes"} to ${sys} (simulated)`);
    toast({ title: `Roster sent to ${sys}. Staff see it there and on their phones.`, tone: "good" });
  };
  const send = () => {
    const snap = snapshot(), n = diff.changes.length, m = diff.people;
    setOpen(false);
    if (persona.id === "site_manager") { update(() => ({ rosterSent: { status: "sending", prev: published, changes: n, people: m } })); handOff(snap, n); return; }
    const id = `r${Date.now()}`, before = sent;
    update((s) => ({
      requests: [...s.requests, { id, kind: "Roster", title: `Roster for ${scope}: ${n} ${n === 1 ? "shift" : "shifts"} changed for ${m} ${m === 1 ? "person" : "people"}`, from: me.id, site: me.site,
        approver: "site_manager", why: problems.length ? `Rosters go to the Site Manager before they're published. ${problems.length} problems are still open.` : "Rosters go to the Site Manager before they're published", roster: { edits: snap, changes: n, people: m } }],
      rosterSent: { status: "pending", requestId: id, edits: snap, prev: published, changes: n, people: m, at: now(), by: me.name },
    }));
    audit(`sent the roster for ${scope} to the Site Manager for approval (${n} shifts changed)`);
    toast({ title: `Sent to ${sm?.name || "the Site Manager"} for approval.`, tone: "good", action: { label: "Undo", onClick: () => {
      update((s) => ({ requests: s.requests.filter((r) => r.id !== id), rosterSent: before }));
      audit("withdrew the roster sent for approval");
    } } });
  };

  return (
    <section className="panel-card">
      <div className="card-head"><div><h2>Send to <SystemName id="rostering" /></h2>
        <p className="card-sub">{persona.id === "supervisor" ? "Your Site Manager approves it, then it's published there." : `${sys} publishes it to staff. It stays the record; Mycelium only drafts and checks.`}</p></div></div>
      {waiting.map((a) => (
        <div key={a.id} className="notice roster-waiting">
          <p><span className="badge">Roster</span> <strong>{a.title}</strong></p>
          <p className="muted small">From {person(a.from).name}. {a.why}</p>
          <div className="actions">
            <button type="button" className="button button-primary" onClick={() => { decide(a, "Approved", toast); handOff(a.roster.edits, a.roster.changes); }}>Approve and send</button>
            <button type="button" className="button" onClick={() => decide(a, "Declined", toast)}>Decline</button>
          </div>
        </div>
      ))}
      {sent?.status === "pending" && (verdict || persona.id !== "site_manager") && (
        <p className="small" role="status">
          {verdict === "Approved" ? <>Approved. </> : verdict === "Declined" ? <span className="late">Declined by the Site Manager. Change it and send again. </span> : <>Waiting for {sm?.name || "the Site Manager"} to approve {sent.changes} changed {sent.changes === 1 ? "shift" : "shifts"}. </>}
          {verdict === "Approved" && !task && <button type="button" className="button" onClick={() => handOff(sent.edits, sent.changes)}>Hand off now</button>}
        </p>
      )}
      {sent?.status === "sent" && !task && <p className="muted small">Last sent at {sent.at} by {sent.by}.</p>}
      {task && <TaskChip task={task} />}
      <p>{diff.changes.length ? <><strong>{diff.changes.length} {diff.changes.length === 1 ? "shift" : "shifts"} changed</strong> for {diff.people} {diff.people === 1 ? "person" : "people"} since the last send.</> : waitingOn ? "Nothing else has changed since it went for approval." : "Nothing has changed since the last send."}</p>
      {open && (
        <div className="roster-diff">
          <ul role="list" aria-label="Changes to send">{diff.changes.slice(0, 10).map((c) => (
            <li key={c.key}>{person(c.person).name}, {dayLabel(c.day)}: {WORD[c.from]} <span aria-hidden="true">→</span><span className="sr-only">to</span> {WORD[c.to]}</li>
          ))}</ul>
          {diff.changes.length > 10 && <p className="muted small">And {diff.changes.length - 10} more.</p>}
          {problems.length > 0 && <p className="notice small">{problems.length} {problems.length === 1 ? "problem is" : "problems are"} still open. {persona.id === "supervisor" ? "The Site Manager will see that." : "You can send anyway, but staff will be rostered against the rules."}</p>}
        </div>
      )}
      <div className="actions">
        {!open ? <button type="button" className="button button-primary" disabled={!diff.changes.length || sent?.status === "sending" || (sent?.status === "pending" && !verdict)} onClick={() => setOpen(true)}>Review changes</button> : <>
          <button type="button" className="button button-primary" onClick={send}>{persona.id === "supervisor" ? "Send for approval" : <>Send to <SystemName id="rostering" /></>}</button>
          <button type="button" className="button" onClick={() => setOpen(false)}>Cancel</button>
        </>}
      </div>
      <SourceNote ids={["rostering"]} />
    </section>
  );
}

function Planner({ persona, me }) {
  const toast = useToast();
  const { roster, leave, edits } = useRoster();
  const teams = useMemo(() => (persona.id === "supervisor" ? TEAMS.filter((t) => t.id === me.id) : TEAMS.filter((t) => t.site === me.site)), [persona.id, me]);
  const people = useMemo(() => teams.flatMap((t) => t.members), [teams]);
  const [week, setWeek] = useState(7);
  const [team, setTeam] = useState(teams[0]?.id || "all");
  const [jump, setJump] = useState(null);
  const shown = team === "all" || teams.length < 2 ? teams : teams.filter((t) => t.id === team);
  const optOut = useDemo((s) => s.commuteOptOut);
  const problems = useMemo(() => {
    // Floods and road closures in the next two days: only people who opted in to route alerts, one line per team (weather.js
    // counts the whole shift at the site, so two day-shift teams would otherwise repeat the same line).
    const weather = [1, 2].flatMap((d) => teams.flatMap((t) => rosterWeatherRisks(t.site, d, t.shift, optOut)
      .map((w) => ({ ...w, people: w.people.filter((id) => t.members.some((m) => m.id === id)) })).filter((w) => w.people.length)
      .map((w) => ({ kind: "weather", text: `${teams.length > 1 ? `${t.lead.name.split(" ")[0]}'s team, ` : ""}${w.text.replace(/^\d+/, String(w.people.length))}`, day: TODAY_INDEX + d, team: t.id, site: t.site, shift: t.shift }))));
    return [...weather, ...rosterProblems(roster, { people, leave }).filter((x) => x.kind !== "skill" || teams.some((t) => t.shift === x.shift))];
  }, [roster, leave, people, teams, optOut]);
  const flagged = useMemo(() => new Map(problems.filter((x) => x.cell).map((x) => [x.cell, x.text])), [problems]);

  useEffect(() => {
    if (!jump) return;
    const el = document.querySelector(`[data-cell="${jump.cell}"]`) || document.getElementById(`cov-${jump.day}`);
    el?.scrollIntoView?.({ block: "center", inline: "center" });
    el?.focus({ preventScroll: true });
  }, [jump]);
  const goTo = (x) => {
    setWeek(x.day >= 7 ? 7 : 0);
    const t = x.person ? teamOf(x.person) : x.team ? TEAMS.find((y) => y.id === x.team) : shown.some((y) => y.shift === x.shift) ? null : teams.find((y) => y.shift === x.shift);
    if (t && teams.length > 1 && team !== "all" && t.id !== team) setTeam(t.id);
    setJump({ cell: x.cell, day: x.day, at: Date.now() });
  };
  const setCell = (id, day, shift, how) => {
    const key = cellKey(id, day), base = baseShift(id, day, leave), prev = edits[key], who = person(id).name;
    update((s) => { const r = { ...s.roster }; if (shift === base) delete r[key]; else r[key] = shift; return { roster: r }; });
    audit(`${how === "drag" ? "added an extra shift" : how === "suggestion" ? "accepted a suggestion" : "changed a shift"} in the roster draft: ${who}, ${dayLabel(day)}, ${WORD[shift].toLowerCase()}`);
    toast({ key: "roster", title: `${who}, ${dayLabel(day)}: ${WORD[shift]}${how === "drag" ? " (extra shift)" : ""}.`, action: { label: "Undo", onClick: () => {
      update((s) => { const r = { ...s.roster }; if (prev) r[key] = prev; else delete r[key]; return { roster: r }; });
      audit(`undid a roster change for ${who}, ${dayLabel(day)}`);
    } } });
  };
  const scope = persona.id === "supervisor" ? teamName(teams[0]) : siteName(me.site);
  const rows = shown.flatMap((t) => t.members);
  return (
    <>
      <section className="panel-card roster-card">
        <div className="card-head">
          <div><h2>Roster, {scope}</h2>
            <p className="card-sub">{rows.length} {rows.length === 1 ? "person" : "people"}, {week ? "next week" : "this week"}. Pick a cell to change a shift. With a mouse, drag a shift onto one of the same person's days off to add an extra shift.</p></div>
        </div>
        <div className="toolbar roster-tools">
          <WeekSwitch week={week} setWeek={setWeek} />
          <TeamSelect teams={teams} team={team} setTeam={setTeam} />
        </div>
        <RosterGrid people={rows} teams={shown} roster={roster} edits={edits} leave={leave} week={week} onSet={setCell} flagged={flagged} caption={`Roster for ${scope}, week of ${dayLabel(week)}`} />
        <p className="muted small roster-legend"><span className="cell-mark is-inline" aria-hidden="true" /> changed since the last send · <span className="cell-flag is-inline" aria-hidden="true"><Icon name="errors" size={12} /></span> breaks a rule (see Problems) · arrow keys move, Enter changes a shift</p>
        <SourceNote ids={["rostering", "hr"]} />
      </section>
      <Problems problems={problems} goTo={goTo} />
      <FillGaps roster={roster} people={people} leave={leave} onSet={setCell} />
      <SendCard persona={persona} me={me} people={people} edits={edits} leave={leave} problems={problems} scope={scope} />
    </>
  );
}

// The GM (and anyone else with the permission but no team or site to plan): coverage across every site, and a site read-only.
function CoverageOnly() {
  const { roster, leave, edits } = useRoster();
  const [week, setWeek] = useState(7);
  const [site, setSite] = useState("");
  const [team, setTeam] = useState("all");
  const days = Array.from({ length: 7 }, (_, i) => week + i);
  const teams = TEAMS.filter((t) => t.site === site);
  const shown = team === "all" ? teams : teams.filter((t) => t.id === team);
  return (
    <>
      <section className="panel-card roster-card">
        <div className="card-head"><div><h2>Coverage, every site</h2>
          <p className="card-sub">People on shift against what each shift needs. Site Managers and Shift Supervisors plan the rosters; you see coverage.</p></div></div>
        <div className="toolbar"><WeekSwitch week={week} setWeek={setWeek} /></div>
        <div className="table-wrap">
          <table className="table roster-cover">
            <caption className="sr-only">Roster coverage by site and shift, week of {dayLabel(week)}</caption>
            <thead><tr><th scope="col">Site and shift</th>{days.map((d) => <th key={d} scope="col">{dayDate(d).toLocaleDateString([], { weekday: "short", day: "numeric" })}</th>)}<th scope="col">Week</th></tr></thead>
            <tbody>{SITES.flatMap((s) => siteShifts(s.id).map((shift) => {
              const ts = TEAMS.filter((t) => t.site === s.id && t.shift === shift);
              return (
                <tr key={s.id + shift}>
                  <th scope="row">{s.name}, {shift.toLowerCase()}</th>
                  {days.map((d) => { const c = coverageOn(roster, ts, d)[0]; const [word, tone] = coverWord(c); return <td key={d}>{c.have} of {c.need} <span className={`badge ${tone}`}>{word}</span></td>; })}
                  <td>{coveragePercent(roster, ts, week, week + 6)}%</td>
                </tr>
              );
            }))}</tbody>
          </table>
        </div>
        <div className="toolbar roster-tools roster-open">
          <label>Open a site, read-only <select className="input" value={site} onChange={(e) => { setSite(e.target.value); setTeam(TEAMS.find((t) => t.site === e.target.value)?.id || "all"); }}>
            <option value="">Choose a site</option>{SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          {site && <TeamSelect teams={teams} team={team} setTeam={setTeam} />}
        </div>
        {site && <RosterGrid readOnly people={shown.flatMap((t) => t.members)} teams={shown} roster={roster} edits={edits} leave={leave} week={week} caption={`Roster for ${siteName(site)}, week of ${dayLabel(week)}, read-only`} />}
        <SourceNote ids={["rostering", "hr"]} />
      </section>
    </>
  );
}

export default function Rosters() {
  const persona = usePersona();
  const can = useCan();
  const me = person(persona.person);
  const plans = can("roster") && (persona.id === "site_manager" || (persona.id === "supervisor" && TEAMS.some((t) => t.id === me.id)));
  return plans ? <Planner key={persona.id} persona={persona} me={me} /> : <CoverageOnly />;
}
