// The site map (feature 4): a schematic floor plan of one site as SVG, with doors, cameras, alarm points and machines as
// focusable buttons, people per zone as text, a legend and a zones table as its equivalent. SiteMapReplay adds a 24-hour
// scrubber, play and step buttons, preset incidents and a "What happened" list. Roll call (feature 5) and TV mode reuse SiteMap.
//
// <SiteMap site at highlight mode counts onSelect compact playing controls />
//   site       plan id: "acr" | "ips" | "twb" | "tsv" | "hq" (PLANS in plans.js)
//   at         time shown, ms (default NOW); states, counts and the detail panel's events are as of then
//   highlight  object id to ring in the accent and open (e.g. from ?focus=); changes re-open it
//   mode       "live" (default) | "replay" (door reads pulse as `at` moves forward) | "rollcall" (counts come from `counts`)
//   counts     { zoneId: number } overriding the door-read counts, e.g. roll call's "at last door read"
//   onSelect   (objectId | null) => void, when a person opens or closes an object's panel
//   compact    true: no legend, and the zones table folds into "Show as table" (TV, Home tiles, roll call)
//   playing    true while a replay plays: pulses are shorter (0.3 s instead of 0.6 s)
//   controls   a node rendered straight under the plan (SiteMapReplay's scrubber)
// Camera objects carry health and events only, never video; counts are numbers, never names.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Table } from "../charts.jsx";
import { Icon } from "../icons.jsx";
import { useReducedMotion } from "../reduced.js";
import { Sev } from "./bits.jsx";
import { CAMERAS } from "./data.js";
import { EVENTS, INCIDENTS, NOW, PLANS, REPLAY_START, REPLAY_STEPS, STEP, fmtTime, mapHref, objectsOf, stateAt, zoneCounts } from "./plans.js";
import "./sitemap.css";

const KIND = { door: "door", camera: "camera", alarm: "alarm point", machine: "machine" };
const WORD = { closed: "Closed", held: "Held open", forced: "Forced", online: "Online", offline: "Offline", armed: "Armed", alarm: "In alarm", running: "Running", down: "Down", maintenance: "Maintenance" };
const BAD = new Set(["held", "forced", "offline", "alarm", "down"]);
const tone = (state) => (BAD.has(state) ? "is-bad" : state === "maintenance" ? "is-warn" : "is-ok");
const dur = (ms) => { const m = Math.max(1, Math.round(ms / 60e3)); return m < 90 ? `${m} minute${m === 1 ? "" : "s"}` : `${Math.round(m / 60)} hours`; };
const zoneName = (plan, id) => (id === "outside" ? "outside" : plan.zones.find((z) => z.id === id)?.name || "an unplaced area");

function stateText(o, s, at) {
  const word = WORD[s.state] || s.state;
  if (s.since && BAD.has(s.state)) return `${word.toLowerCase()} ${o.kind === "door" ? "" : "for "}${dur(at - s.since)}`;
  return word.toLowerCase();
}

// The symbol for each kind: a shape that differs per kind, and a fill or outline that changes with the state.
export function Glyph({ kind, state, o = "h" }) {
  const t = tone(state);
  if (kind === "door") return o === "v" ? <rect className={`sm-g sm-door ${t}`} x="-5" y="-16" width="10" height="32" rx="2" /> : <rect className={`sm-g sm-door ${t}`} x="-16" y="-5" width="32" height="10" rx="2" />;
  if (kind === "camera") return (
    <g className={`sm-g sm-camera ${t}`}>
      <circle r="9" /><path d="M8 -5 17 -9 17 9 8 5Z" />
      {state === "offline" && <path className="sm-slash" d="M-11 11 11 -11" />}
    </g>
  );
  if (kind === "alarm") return <path className={`sm-g sm-alarm ${t}`} d="M0 -12 11.5 9H-11.5Z" />;
  return <path className={`sm-g sm-machine ${t}`} d="M0 -13 13 0 0 13 -13 0Z" />;
}

function Label({ o, s }) {
  const bad = BAD.has(s.state) || s.state === "maintenance";
  const lines = o.kind === "door" ? [o.name, bad && WORD[s.state]] : o.kind === "machine" ? [o.name, WORD[s.state]] : bad ? [o.name, WORD[s.state]] : [];
  if (!lines.filter(Boolean).length) return null;
  const side = o.kind === "door" ? o.side : "b";
  const [x, y, anchor] = side === "r" ? [20, -2, "start"] : side === "l" ? [-20, -2, "end"] : side === "t" ? [0, -30, "middle"] : [0, 30, "middle"];
  return (
    <text className={`sm-label ${bad ? "" : "is-plain"}`} x={x} y={y} textAnchor={anchor} aria-hidden="true">
      {lines.filter(Boolean).map((l, i) => <tspan key={i} x={x} dy={i ? 16 : 0} className={i ? `sm-state ${tone(s.state)}` : ""}>{l}</tspan>)}
    </text>
  );
}

export function SiteMap({ site, at = NOW, highlight = null, mode = "live", counts, onSelect, compact = false, playing = false, controls = null }) {
  const plan = PLANS[site];
  const events = EVENTS[site] || [];
  const reduced = useReducedMotion();
  const objects = useMemo(() => objectsOf(plan), [plan]);
  const states = useMemo(() => stateAt(objects, events, at), [objects, events, at]);
  const people = useMemo(() => counts || zoneCounts(events, plan, at), [counts, events, plan, at]);
  const [selected, setSelected] = useState(highlight);
  const refs = useRef({});
  useEffect(() => { if (highlight) setSelected(highlight); }, [highlight]);
  const choose = (id) => { setSelected(id); onSelect?.(id); };
  const close = () => { const id = selected; choose(null); refs.current[id]?.focus(); };

  // Door reads between the last time shown and this one pulse once (only the newest three). Reduced motion: state change only.
  const [pulses, setPulses] = useState([]);
  const prev = useRef(at);
  useEffect(() => {
    const p = prev.current; prev.current = at;
    setPulses(mode === "replay" && at > p && at - p <= 2 * 3600e3 ? events.filter((e) => e.kind === "door" && e.at > p && e.at <= at).slice(-3) : []);
  }, [at, events, mode]);

  if (!plan) return <p className="muted">No plan for this site yet.</p>;
  const sel = objects.find((o) => o.id === selected);
  const total = Object.values(people).reduce((a, b) => a + b, 0);
  const cams = CAMERAS.find((c) => c.site === site);
  const camOff = plan.cameras.filter((c) => states[c.id].state === "offline");
  const doorsOf = (z) => plan.doors.filter((d) => d.to === z.id || d.from === z.id);

  return (
    <div className={`sitemap ${compact ? "is-compact" : ""}`}>
      <div className="sm-canvas">
        <svg viewBox={`0 0 ${plan.w} ${plan.h}`} role="group" aria-label={`${plan.name} site plan at ${fmtTime(at)}: ${total} people in counted areas. Each door, camera, alarm point and machine is a button.`}>
          <rect className="sm-fence" x="20" y="20" width="960" height="560" rx="16" aria-hidden="true" />
          <g aria-hidden="true">
            {plan.zones.map((z) => {
              const alarm = plan.alarms.some((a) => a.zone === z.id && states[a.id].state === "alarm");
              return (
                <g key={z.id} className={`sm-zone ${z.parent ? "is-inner" : ""} ${alarm ? "is-alarm" : ""}`}>
                  <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={z.parent ? 8 : 12} />
                  <text className="sm-zone-name" x={z.x + 16} y={z.y + 30}>{z.name}</text>
                  {z.counted || counts?.[z.id] !== undefined
                    ? <text className="sm-count" x={z.x + 16} y={z.y + z.h - 18}>{people[z.id] ?? 0}<tspan className="sm-count-unit" dx="6">{(people[z.id] ?? 0) === 1 ? "person" : "people"}</tspan></text>
                    : <text className="sm-uncounted" x={z.x + 16} y={z.y + z.h - 18}>Not counted</text>}
                </g>
              );
            })}
          </g>
          {objects.map((o) => {
            const s = states[o.id];
            const name = `${o.name}, ${KIND[o.kind]}, ${stateText(o, s, at)}`;
            return (
              <g key={o.id} ref={(el) => { refs.current[o.id] = el; }} transform={`translate(${o.x} ${o.y})`} role="button" tabIndex={0} aria-label={name}
                aria-pressed={selected === o.id} className={`sm-obj ${o.id === highlight ? "is-highlight" : ""} ${selected === o.id ? "is-selected" : ""}`}
                onClick={() => choose(selected === o.id ? null : o.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(selected === o.id ? null : o.id); } else if (e.key === "Escape" && selected) close(); }}>
                <title>{name}</title>
                <circle className="sm-hit" r="22" />
                <circle className="sm-ring" r="22" />
                <Glyph kind={o.kind} state={s.state} o={o.o} />
                <Label o={o} s={s} />
              </g>
            );
          })}
          {!reduced && pulses.map((e) => {
            const d = plan.doors.find((x) => x.id === e.object);
            return d && <circle key={e.id} className={`sm-pulse ${e.result === "Denied" || e.sev === "high" ? "is-bad" : ""}`} cx={d.x} cy={d.y} r="16" aria-hidden="true" style={{ animationDuration: playing ? "0.3s" : "0.6s" }} />;
          })}
        </svg>
      </div>
      {controls}
      {sel && <Detail plan={plan} o={sel} s={states[sel.id]} events={events} at={at} onClose={close} />}
      {!compact && <Legend />}
      <Zones plan={plan} people={people} states={states} doorsOf={doorsOf} compact={compact} mode={mode} />
      <p className="muted small">Cameras on this plan: {plan.cameras.length}{cams ? ` of ${cams.total} on site` : ""}. {camOff.length ? `Offline: ${camOff.map((c) => c.name).join(", ")}.` : "All online."} Health and events only; video stays in the camera system.</p>
    </div>
  );
}

function Detail({ plan, o, s, events, at, onClose }) {
  const mine = events.filter((e) => e.object === o.id && e.at <= at);
  const recent = mine.slice(-6).reverse();
  const hour = mine.filter((e) => e.at > at - 3600e3 && e.dir);
  const where = o.kind === "door" ? (o.to ? `From ${zoneName(plan, o.from)} into ${zoneName(plan, o.to)}.` : "Not placed on the plan yet, so it counts nobody.")
    : o.kind === "alarm" ? (o.zone ? `Covers ${zoneName(plan, o.zone)}.` : "Covers the site fence.")
    : o.kind === "machine" ? `In ${zoneName(plan, o.zone)}. State from plant data.` : "Health and events only. Video stays in the camera system.";
  const line = (e) => e.text || `${e.dir === "in" ? "In" : "Out"}, ${e.result.toLowerCase()}`;
  return (
    <section className="sm-detail" aria-label={`${o.name} details`} onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="card-head">
        <div>
          <h3>{o.name}</h3>
          <p className="card-sub"><span className={`badge sm-badge ${tone(s.state)}`}><svg viewBox="-20 -20 40 40" width="16" height="16" aria-hidden="true"><Glyph kind={o.kind} state={s.state} /></svg>{WORD[s.state]}</span>{" "}
            {o.kind[0].toUpperCase() + o.kind.slice(1)}{s.since ? ` · since ${fmtTime(s.since)}` : ""}{o.kind === "door" ? ` · ${hour.length} card reads in the hour to ${fmtTime(at)}` : ""}</p>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label={`Close ${o.name} details`}><Icon name="close" /></button>
      </div>
      <p className="muted small">{where}</p>
      {recent.length ? (
        <ol className="sm-recent" role="list">{recent.map((e) => <li key={e.id}><time>{fmtTime(e.at)}</time><span>{line(e)}</span>{e.sev && <Sev sev={e.sev} />}</li>)}</ol>
      ) : <p className="muted small">No events up to {fmtTime(at)}.</p>}
    </section>
  );
}

export function Legend() {
  const items = [["door", "closed", "Door, closed"], ["door", "held", "Door held open or forced"], ["camera", "online", "Camera"], ["camera", "offline", "Camera offline"],
    ["alarm", "armed", "Alarm point, armed"], ["alarm", "alarm", "Alarm point, in alarm"], ["machine", "running", "Machine running"], ["machine", "down", "Machine down"], ["machine", "maintenance", "Machine in maintenance"]];
  return (
    <ul className="sm-legend" role="list" aria-label="Map legend">
      {items.map(([k, st, label]) => <li key={label}><svg viewBox="-20 -20 40 40" width="22" height="22" aria-hidden="true"><Glyph kind={k} state={st} /></svg>{label}</li>)}
      <li><span className="sm-legend-count">12</span>People in an area, from card reads in and out</li>
    </ul>
  );
}

function Zones({ plan, people, states, doorsOf, compact, mode }) {
  const st = (o) => `${o.name} (${WORD[states[o.id].state].toLowerCase()})`;
  const fence = plan.alarms.filter((a) => !a.zone);
  const rows = plan.zones.map((z) => [z.name, z.counted || people[z.id] !== undefined ? people[z.id] ?? 0 : "Not counted",
    doorsOf(z).map(st).join(", ") || "None", plan.alarms.filter((a) => a.zone === z.id).map(st).join(", ") || "None",
    plan.machines.filter((m) => m.zone === z.id).map(st).join(", ") || "None"]);
  if (fence.length) rows.push(["Site fence", "Not counted", plan.doors.filter((d) => d.from === "outside").map((d) => d.name).join(", "), fence.map(st).join(", "), "None"]);
  const table = <Table caption={`${plan.name} areas${mode === "rollcall" ? ", people at last door read" : ""}`} head={["Area", "People", "Doors", "Alarms", "Machines"]} rows={rows}
    keys={rows.map((r) => [r[0], typeof r[1] === "number" ? r[1] : -1, r[2], r[3], r[4]])} />;
  return compact ? <details className="table-toggle"><summary>Show as table</summary>{table}</details> : <div className="sm-zones"><h3 className="small-head">Areas</h3>{table}</div>;
}

// SiteMap with a 24-hour replay: range input in 5-minute steps, play, pause and step, jumps to preset incidents and a
// "What happened" list up to the time shown. `focus` (an object id) opens that object, e.g. from Security's "Show on map".
export function SiteMapReplay({ site, focus = null }) {
  const events = EVENTS[site] || [];
  const [step, setStep] = useState(REPLAY_STEPS);
  const [playing, setPlaying] = useState(false);
  const [sel, setSel] = useState(focus);
  const box = useRef(null);
  const at = REPLAY_START + step * STEP;
  const live = step === REPLAY_STEPS;
  useEffect(() => { setSel(focus); if (focus) box.current?.scrollIntoView?.({ block: "start" }); }, [focus, site]);
  useEffect(() => { if (!playing) return undefined; const t = setInterval(() => setStep((s) => Math.min(REPLAY_STEPS, s + 1)), 300); return () => clearInterval(t); }, [playing]);
  useEffect(() => { if (live) setPlaying(false); }, [live]);
  const go = (s) => { setStep(Math.max(0, Math.min(REPLAY_STEPS, s))); };
  const jump = (t, object) => { setPlaying(false); go(Math.round((t - REPLAY_START) / STEP)); if (object) setSel(object); };
  const happened = events.filter((e) => e.text && e.at >= REPLAY_START && e.at <= at).reverse();
  const presets = INCIDENTS.filter((i) => i.site === site);

  const controls = (
    <div className="sm-controls">
      <div className="sm-buttons">
        <button type="button" className="button" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Back 5 minutes">−5 min</button>
        <button type="button" className="button button-primary" onClick={() => { if (live) setStep(0); setPlaying(!playing); }}>
          <Icon name={playing ? "pause" : "play"} />{playing ? "Pause" : live ? "Replay 24 h" : "Play"}</button>
        <button type="button" className="button" onClick={() => go(step + 1)} disabled={live} aria-label="Forward 5 minutes">+5 min</button>
        <button type="button" className="button" onClick={() => { setPlaying(false); go(REPLAY_STEPS); }} disabled={live}>Now</button>
        <p className="sm-time" aria-live={playing ? "off" : "polite"}><strong>{fmtTime(at)}</strong> {live ? <span className="badge badge-ok">Live</span> : <span className="badge">Replay</span>}</p>
      </div>
      <label className="sm-range">
        <span className="sr-only">Replay time, last 24 hours in 5-minute steps</span>
        <input type="range" min="0" max={REPLAY_STEPS} step="1" value={step} aria-valuetext={fmtTime(at)} onChange={(e) => { setPlaying(false); go(Number(e.target.value)); }} />
        <span className="sm-range-ends" aria-hidden="true"><span>{fmtTime(REPLAY_START)}</span><span>Now</span></span>
      </label>
      {presets.length > 0 && (
        <div className="sm-presets"><span className="muted small">Jump to</span>
          {presets.map((i) => <button key={i.id} type="button" className="button sm-preset" onClick={() => jump(i.at, i.focus)}>{i.label}</button>)}
        </div>
      )}
    </div>
  );

  return (
    <div className="sm-replay" ref={box}>
      <SiteMap site={site} at={at} highlight={sel} mode="replay" onSelect={setSel} playing={playing} controls={controls} />
      <section className="sm-log" aria-label="What happened">
        <h3>What happened</h3>
        <p className="muted small">{happened.length ? `${happened.length} things from ${fmtTime(REPLAY_START)} to ${fmtTime(at)}, newest first.` : `Nothing notable from ${fmtTime(REPLAY_START)} to ${fmtTime(at)}.`}</p>
        <ol role="list">
          {happened.map((e) => (
            <li key={e.id}>
              <button type="button" className="sm-log-item" onClick={() => jump(e.at, e.object)}>
                <time>{fmtTime(e.at)}</time><span>{e.text}</span>{e.sev && e.sev !== "low" && <Sev sev={e.sev} />}
              </button>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

// "Show on map" for Security's alerts: <SiteMapLink site="ips" focus="ips-gate-2" />. ALERT_FOCUS in plans.js maps alert ids.
export function SiteMapLink({ site, focus, children = "Show on map", className = "link small" }) {
  return <Link to={mapHref(site, focus)} className={className}>{children}</Link>;
}
