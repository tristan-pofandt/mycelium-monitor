// TV mode (feature 11): a full-screen floor screen at /tv?site=ips, outside the Shell (no header, banner or feedback box).
// Big type read from 5 m away, screens rotating every 15 s, nothing personal: anyone walking past can read it. A roll call
// running at the site (store `rollcall`, see rollcall.js) replaces every screen with the evacuation screen, counts only.
// Live updates are deliberately not announced (no aria-live): a wall screen shouldn't chatter to a screen reader.
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Bars } from "../../charts.jsx";
import { Icon } from "../../icons.jsx";
import { useReducedMotion } from "../../reduced.js";
import { OUTPUT, SITES, fmtDay, siteName } from "../data.js";
import { EVENTS, PLANS, stateAt } from "../plans.js";
import { TEAMS, coverageOn, useRoster } from "../roster.js";
import { activePermits, mergePermits, typeName } from "../permits.js";
import { rollCall, shiftAt, zoneTally } from "../rollcall.js";
import { WeatherScreen } from "../weather.jsx";
import { useDemo } from "../store.js";
import { ASSEMBLY, ROTATE_MS, SCREENS, daysSinceIncident, LAST_INCIDENT, nextIndex, outputToday, permitCounts, screenOrder } from "../screens.js";
import "../screens.css";

const timeOf = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
const WORD = { running: ["Running", "badge-ok", "check"], down: ["Down", "badge-bad", "stop"], maintenance: ["Maintenance", "badge-warn", "settings"] };

// Dark by default on the wall: set while mounted, the previous theme back on the way out. Not saved, unlike the header toggle.
function useDarkTheme() {
  useEffect(() => {
    const html = document.documentElement, was = html.dataset.theme;
    html.dataset.theme = "dark";
    return () => { if (was) html.dataset.theme = was; else delete html.dataset.theme; };
  }, []);
}

// The clock, ticking every 30 s, so time-based figures (output so far, the shift on now) move on their own.
function useNow(every = 30e3) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), every); return () => clearInterval(id); }, [every]);
  return now;
}

// Calls onDone `ms` after `key` last changed, counting only while running: pausing keeps the time left.
function useCountdown(key, running, ms, onDone) {
  const left = useRef(ms);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => { left.current = ms; }, [key, ms]);
  useEffect(() => {
    if (!running) return undefined;
    const start = Date.now();
    const id = setTimeout(() => done.current(), left.current);
    return () => { clearTimeout(id); left.current -= Date.now() - start; };
  }, [key, running]);
}

function Screen({ id, title, children }) {
  return (
    <section className="tv-screen" aria-labelledby={`tv-${id}`}>
      <h2 id={`tv-${id}`}>{title}</h2>
      {children}
    </section>
  );
}

function Safety({ site }) {
  const days = daysSinceIncident(site);
  const s = SITES.find((x) => x.id === site);
  return (
    <Screen id="safety" title="Days since the last recordable incident">
      <p className="tv-kpi">{days}<span className="tv-unit">{days === 1 ? "day" : "days"}</span></p>
      <p>The last one was on {fmtDay(new Date(LAST_INCIDENT[site]))}. {plural(s.kpi.nearMiss, "near miss", "near misses")} reported in the last 30 days.</p>
      <p className="tv-muted">Report every near miss to your supervisor. It's how the next incident doesn't happen.</p>
    </Screen>
  );
}

function Output({ site, now }) {
  const o = outputToday(site, now);
  const gap = o.units - o.due;
  const days = OUTPUT.find((x) => x.site === site).days.slice(-6);
  const rows = [...days.map((d) => ({ label: d.date.toLocaleDateString([], { weekday: "short" }), values: { u: d.units } })), { label: "Today so far", values: { u: o.units } }];
  return (
    <Screen id="output" title="Today's output against target">
      <div className="tv-split">
        <div>
          <p className="tv-kpi">{o.units.toLocaleString()}<span className="tv-unit">units so far</span></p>
          <p><strong>{gap >= 0 ? `${plural(gap, "unit")} ahead of plan` : `${plural(-gap, "unit")} behind plan`}</strong> ({o.due.toLocaleString()} due by now).</p>
          <p className="tv-muted">Today's target is {o.target.toLocaleString()} units.</p>
        </div>
        <Bars title={`${siteName(site)} units per day, last 6 days and today so far`} hideTitle height={300} format={(v) => Math.round(v).toLocaleString()}
          series={[{ key: "u", label: "Units", color: "var(--accent)" }]} rows={rows} />
      </div>
    </Screen>
  );
}

function Coverage({ site, now }) {
  const { roster } = useRoster();
  const { shift, day } = shiftAt(now);
  const c = coverageOn(roster, TEAMS.filter((t) => t.site === site), day).find((x) => x.shift === shift);
  return (
    <Screen id="coverage" title={`${shift} shift coverage`}>
      {c ? (
        <>
          <p className="tv-kpi">{c.have}<span className="tv-unit">of {c.need} rostered</span></p>
          <p>{c.have >= c.need
            ? <span className="badge badge-ok"><Icon name="check" size={26} />Covered</span>
            : <span className="badge badge-warn"><Icon name="errors" size={26} />Short {c.need - c.have}</span>}</p>
          <p className="tv-muted">From the roster. Supervisors fill any gaps.</p>
        </>
      ) : <p>No {shift.toLowerCase()} shift runs at {siteName(site)}.</p>}
    </Screen>
  );
}

function Machines({ site, now }) {
  const plan = PLANS[site];
  const states = stateAt(plan.machines, EVENTS[site] || [], now);
  return (
    <Screen id="machines" title="Machines">
      <ul className="tv-rows" role="list">
        {plan.machines.map((m) => {
          const s = states[m.id];
          const [word, badge, icon] = WORD[s.state] || [s.state, "badge-none", "unknown"];
          return (
            <li key={m.id}>
              <span>{m.name}</span>
              <span className={`badge ${badge}`}><Icon name={icon} size={26} />{word}{s.since && s.state !== "running" ? `, since ${timeOf(s.since)}` : ""}</span>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}

function Permits({ site, now }) {
  const permits = useDemo((s) => mergePermits(s.permits, s.permitEdits));
  const live = activePermits(site, now, permits);
  const rows = permitCounts(live);
  return (
    <Screen id="permits" title="Permits to work active now">
      <p className="tv-kpi">{live.length}<span className="tv-unit">{live.length === 1 ? "permit" : "permits"}</span></p>
      {rows.length ? (
        <ul className="tv-rows" role="list">
          {rows.map((r) => <li key={`${r.area}|${r.type}`}><span>{r.area}</span><span>{plural(r.n, `${typeName(r.type).toLowerCase()} permit`)}</span></li>)}
        </ul>
      ) : <p>No permit work under way.</p>}
      <p className="tv-muted">Only permit holders go into these areas until the permit is closed.</p>
    </Screen>
  );
}

function Announcement({ text }) {
  return (
    <Screen id="announcement" title="Announcement">
      <p className="tv-say">{text}</p>
    </Screen>
  );
}

function ScreenBody({ id, site, now, settings }) {
  if (id === "safety") return <Safety site={site} />;
  if (id === "output") return <Output site={site} now={now} />;
  if (id === "coverage") return <Coverage site={site} now={now} />;
  if (id === "machines") return <Machines site={site} now={now} />;
  if (id === "weather") return <WeatherScreen site={site} />;
  if (id === "permits") return <Permits site={site} now={now} />;
  return <Announcement text={settings.announcement} />;
}

function Rotation({ site, now }) {
  const settings = useDemo((s) => s.tv) || {};
  const order = screenOrder(settings);
  const n = order.length;
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  // prev: the screen fading out. Only the timer's own changes crossfade; a press or key changes screen at once.
  const [pos, setPos] = useState({ i: 0, prev: null });
  const i = Math.min(pos.i, n - 1);
  const go = (step, fade = false) => setPos((p) => ({ i: nextIndex(Math.min(p.i, n - 1), n, step), prev: fade && !reduced && n > 1 ? order[Math.min(p.i, n - 1)] : null }));
  useCountdown(i, !paused && n > 1, ROTATE_MS, () => go(1, true));

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, select")) return;
      if (e.key === " " && !e.target.closest?.("button, a")) { e.preventDefault(); setPaused((v) => !v); }
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const id = order[i];
  const label = SCREENS.find((s) => s.id === id)?.label;
  return (
    <>
      <div className="tv-stage">
        {pos.prev && pos.prev !== id && (
          <div key={`out-${pos.prev}`} className="tv-layer is-out" aria-hidden="true" inert="" onAnimationEnd={(e) => e.target === e.currentTarget && setPos((p) => ({ ...p, prev: null }))}>
            <ScreenBody id={pos.prev} site={site} now={now} settings={settings} />
          </div>
        )}
        <div key={id} className={`tv-layer ${pos.prev ? "is-in" : ""}`}>
          <ScreenBody id={id} site={site} now={now} settings={settings} />
        </div>
      </div>
      <footer className="tv-controls">
        {n > 1 && !reduced && (
          <div className="tv-progress" aria-hidden="true">
            <span key={`${i}-${n}`} style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? "paused" : "running" }} />
          </div>
        )}
        <p className="tv-where">Screen {i + 1} of {n}: {label}{paused ? ". Paused" : ""}</p>
        <div className="tv-buttons">
          <button type="button" className="icon-button" onClick={() => go(-1)} aria-label="Previous screen" disabled={n < 2}><Icon name="chevron" className="tv-back" size={20} /></button>
          <button type="button" className="icon-button" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Play" : "Pause"} disabled={n < 2}>
            <Icon name={paused ? "play" : "pause"} size={20} />
          </button>
          <button type="button" className="icon-button" onClick={() => go(1)} aria-label="Next screen" disabled={n < 2}><Icon name="chevron" className="tv-next" size={20} /></button>
          <FullscreenButton />
        </div>
      </footer>
    </>
  );
}

function FullscreenButton() {
  const [on, setOn] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const f = () => setOn(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);
  if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return null;
  const toggle = () => (on ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => { /* refused: stays windowed */ });
  return <button type="button" className="button tv-full" onClick={toggle}><Icon name="tv" /><span>{on ? "Leave full screen" : "Full screen"}</span></button>;
}

// A roll call at this site takes over: where to go, and live counts. Never names.
function Evacuate({ rc, site }) {
  const result = rollCall(site, rc.startedAt, { ticks: rc.ticks });
  const c = result.counts;
  const zones = Object.entries(zoneTally(result)).filter(([, v]) => v > 0);
  const zoneName = (z) => PLANS[site].zones.find((x) => x.id === z)?.name || z;
  const [letter, where] = ASSEMBLY[site] || ["", "the assembly area"];
  return (
    <section className="tv-evac" aria-labelledby="tv-evac-h">
      {rc.mode === "drill" && <p className="tv-drill">Drill</p>}
      <h2 id="tv-evac-h"><Icon name="siren" size={64} />Evacuate to assembly area {letter}</h2>
      <p className="tv-say">Go to {where} by the nearest exit. Don't stop for belongings. Wait for a warden to tick you off.</p>
      <div className="tv-evac-counts">
        <p className="tv-kpi">{c.safe}<span className="tv-unit">of {c.onSite} accounted for</span></p>
        <p className="tv-kpi">{c.notYet}<span className="tv-unit">not yet</span></p>
      </div>
      {zones.length > 0 && <p>Still to find, by the area of their last card read: {zones.map(([z, v]) => `${zoneName(z)} ${v}`).join(", ")}.</p>}
      <p className="tv-muted">Started {timeOf(rc.startedAt)}.</p>
    </section>
  );
}

function SitePicker() {
  return (
    <section className="tv-screen" aria-labelledby="tv-pick">
      <h2 id="tv-pick">Which site is this screen at?</h2>
      <ul className="tv-pick" role="list">
        {SITES.map((s) => <li key={s.id}><Link className="button" to={`/tv?site=${s.id}`}>{s.name}</Link></li>)}
      </ul>
      <p className="tv-muted">A floor screen shows output, coverage, machines, weather and permits for one site. It never shows names.</p>
    </section>
  );
}

export default function Tv() {
  const [params] = useSearchParams();
  const site = SITES.some((s) => s.id === params.get("site")) ? params.get("site") : null;
  const rc = useDemo((s) => s.rollcall);
  const now = useNow();
  useDarkTheme();
  useEffect(() => { document.title = `${site ? `${siteName(site)} floor screen` : "Floor screen"} · Mycelium demo`; }, [site]);
  return (
    <div className={`tv ${rc?.site === site ? "is-evac" : ""}`}>
      <Link to="/sites" className="skip-link tv-exit">Exit TV mode</Link>
      <header className="tv-top">
        <h1>{site ? siteName(site) : "Floor screen"}</h1>
        <p className="tv-clock">{timeOf(now)}</p>
      </header>
      <main className="tv-main">
        {!site ? <SitePicker /> : rc?.site === site ? <Evacuate rc={rc} site={site} /> : <Rotation site={site} now={now} />}
      </main>
    </div>
  );
}
