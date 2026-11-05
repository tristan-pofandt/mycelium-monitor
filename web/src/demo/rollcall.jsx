// Emergency roll call pieces shared outside its page (feature 5): the useRollCall() hook, the start form and its dialog (opened
// from the header with openRollCall()), the header button, the red banner line shown on every page while one runs, a polite
// live region for the counts, and RollCallCard for the customisable Home.
//
// <RollCallCard />   Home tile: what's running (with a link), or a start button and the last drill. Null without `emergency`.
// useRollCall()      { rc, running, result, sites, canRun(site), reports, start(site, mode), tick(id, "safe"|"missing"|null), end() }
// TV mode reads store `rollcall` directly; see the contract at the top of rollcall.js.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Icon } from "../icons.jsx";
import { HoldButton, rovingKeys } from "../ui.jsx";
import { person, siteName } from "./data.js";
import { SourceNote } from "./bits.jsx";
import { audit, update, useCan, useDemo, usePersona } from "./store.js";
import { PAST_ROLLCALLS, reportOf, rollCall, rollCallSites } from "./rollcall.js";
import "./rollcall.css";

export const timeOf = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
export const MODE = { drill: "Drill", real: "Real roll call" };
export const REAL_WHY = "In the demo only drills run. A real roll call would also alert every phone and floor screen at the site.";

export function useRollCall() {
  const rc = useDemo((s) => s.rollcall);
  const saved = useDemo((s) => s.rollcalls);
  const persona = usePersona();
  const can = useCan();
  const sites = can("emergency") ? rollCallSites(persona) : [];
  const result = useMemo(() => rc && rollCall(rc.site, rc.startedAt, { ticks: rc.ticks }), [rc]);
  const by = persona.label.replace(" (you)", "");
  return {
    rc, running: !!rc, result, sites, canRun: (site) => sites.includes(site),
    reports: [...saved, ...PAST_ROLLCALLS],
    start(site, mode = "drill") {
      update(() => ({ rollcall: { site, mode, startedAt: Date.now(), ticks: {}, by } }));
      audit(`Started a ${mode} roll call at ${siteName(site)}`);
    },
    tick(id, value) {
      update((s) => {
        if (!s.rollcall) return {};
        const ticks = { ...s.rollcall.ticks };
        if (value) ticks[id] = value; else delete ticks[id];
        return { rollcall: { ...s.rollcall, ticks } };
      });
    },
    end() {
      if (!rc) return;
      const report = reportOf(rc, Date.now(), result);
      update((s) => ({ rollcall: null, rollcalls: [report, ...s.rollcalls] }));
      const mins = Math.max(1, Math.round((report.endedAt - report.startedAt) / 60e3));
      audit(`Ended the ${rc.mode} roll call at ${siteName(rc.site)} after ${mins} min: ${report.total - report.missing.length} of ${report.total} accounted for`);
    },
  };
}

// Counts read out politely, at most once every `every` ms, so a run of ticks doesn't flood a screen reader.
export function LiveCounts({ text, every = 5000 }) {
  const [said, setSaid] = useState(text);
  const last = useRef(Date.now());
  useEffect(() => {
    if (text === said) return undefined;
    const wait = Math.max(0, every - (Date.now() - last.current));
    const id = setTimeout(() => { last.current = Date.now(); setSaid(text); }, wait);
    return () => clearTimeout(id);
  }, [text, said, every]);
  return <p className="sr-only" aria-live="polite">{said}</p>;
}

// Choose a site and the mode, then hold to start. Used in the header dialog and on the page when nothing runs.
export function StartForm({ onDone }) {
  const { rc, sites, start } = useRollCall();
  const navigate = useNavigate();
  const [site, setSite] = useState(sites.includes("ips") ? "ips" : sites[0]);
  const preview = useMemo(() => site && rollCall(site).counts, [site]);
  if (rc) return <p>A {MODE[rc.mode].toLowerCase()} is already running at {siteName(rc.site)}. <Link to="/emergency" onClick={onDone}>Open the roll call</Link></p>;
  if (!sites.length) return <p className="muted">This role can't start a roll call.</p>;
  return (
    <div className="rc-start">
      {sites.length > 1 ? (
        <div className="field"><span id="rc-site-l">Site</span>
          <div role="group" aria-labelledby="rc-site-l" className="segmented rc-seg" onKeyDown={(e) => rovingKeys(e, "button")}>
            {sites.map((s) => <button key={s} type="button" aria-pressed={site === s} onClick={() => setSite(s)}>{siteName(s)}</button>)}
          </div>
        </div>
      ) : <p className="rc-one-site"><strong>Site:</strong> {siteName(site)} (your site)</p>}
      <div className="field"><span id="rc-mode-l">Type</span>
        <div role="group" aria-labelledby="rc-mode-l" className="segmented rc-seg">
          <button type="button" aria-pressed="true">Drill</button>
          <button type="button" disabled aria-describedby="rc-real-why">Real</button>
        </div>
        <p id="rc-real-why" className="muted small">Real is turned off. {REAL_WHY}</p>
      </div>
      <p className="rc-preview">On site at {siteName(site)} now: <strong>{preview.people} staff</strong> from card reads
        {preview.visitors ? <> and <strong>{preview.visitors} {preview.visitors === 1 ? "visitor" : "visitors"}</strong> from the visitor book</> : null}.
        {preview.noBadge ? ` ${preview.noBadge} more are rostered but haven't badged in.` : ""}</p>
      {preview.onSite === 0 && <p className="muted small">Nobody is badged in at {siteName(site)} at this hour, so the list would be empty. Try a site with a shift on.</p>}
      <div className="actions">
        <HoldButton className="button-primary" onConfirm={() => { start(site, "drill"); onDone?.(); navigate("/emergency"); }}>Hold to start the drill</HoldButton>
      </div>
    </div>
  );
}

export const openRollCall = () => dispatchEvent(new CustomEvent("demo-rollcall"));

// The start dialog, mounted once in the shell.
export function RollCallDialog() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => { setOpen(true); ref.current?.showModal?.(); };
    addEventListener("demo-rollcall", show);
    return () => removeEventListener("demo-rollcall", show);
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog ref={ref} className="palette demo-dialog" aria-labelledby="rcd-h" onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && close()}>
      <div className="dialog-body">
        <div className="card-head">
          <h2 id="rcd-h">Start a roll call</h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Close"><Icon name="close" /></button>
        </div>
        <p className="muted small">Lists everyone at the site from door reads, the visitor book, permits and the roster, so wardens can tick them off.</p>
        {open && <StartForm onDone={close} />}
      </div>
    </dialog>
  );
}

// "Roll call" in the header (and in the banner on phones) for roles with `emergency`.
export function RollCallButton({ className = "" }) {
  const can = useCan();
  const { rc, result } = useRollCall();
  if (!can("emergency")) return null;
  if (rc) return (
    <NavLink to="/emergency" className={`button rollcall-button is-running ${className}`} aria-label={`Roll call running: ${result.counts.notYet} not yet accounted for`}>
      <Icon name="siren" /><span>Roll call</span><span className="count">{result.counts.notYet}</span>
    </NavLink>
  );
  return <button type="button" className={`button rollcall-button ${className}`} onClick={openRollCall}><Icon name="siren" /><span>Roll call</span></button>;
}

// The banner line while a roll call runs, on every page. Numbers only, never names.
export function RollCallLine() {
  const can = useCan();
  const persona = usePersona();
  const { rc, result } = useRollCall();
  if (!rc) return null;
  const text = `${MODE[rc.mode]} at ${siteName(rc.site)}: ${result.counts.notYet} not yet accounted for`;
  // Only people at that site are told to go to the assembly point; elsewhere it's news, not an instruction.
  const here = person(persona.person)?.site === rc.site;
  return (
    <p className="rc-line"><Icon name="siren" />
      {can("emergency") ? <Link to="/emergency">{text}</Link>
        : here ? <span>{text}. Go to your assembly point; wardens are checking everyone is out.</span>
        : <span>{MODE[rc.mode]} under way at {siteName(rc.site)}. Nothing for you to do at your site.</span>}
    </p>
  );
}

// Home tile (feature 10).
export function RollCallCard() {
  const can = useCan();
  const { rc, result, sites, reports } = useRollCall();
  if (!can("emergency")) return null;
  const last = reports.find((r) => sites.includes(r.site));
  return (
    <section className="panel-card rc-card" aria-labelledby="rc-card-h">
      <div className="card-head"><div><h2 id="rc-card-h">Roll call</h2>
        <p className="card-sub">{rc ? `${MODE[rc.mode]} at ${siteName(rc.site)}, started ${timeOf(rc.startedAt)}` : "Check everyone is out in a drill or evacuation"}</p></div></div>
      {rc ? (
        <>
          <p className="rc-card-count"><strong>{result.counts.notYet}</strong> of {result.counts.onSite} not yet accounted for</p>
          <div className="actions"><Link to="/emergency" className="button button-primary">Open the roll call</Link></div>
        </>
      ) : (
        <>
          {last && <p className="muted small">Last {MODE[last.mode].toLowerCase()}: {siteName(last.site)}, {new Date(last.startedAt).toLocaleDateString([], { day: "numeric", month: "short" })}, all clear after {Math.round((last.endedAt - last.startedAt) / 60e3)} minutes, {last.missing.length ? `${last.missing.length} not accounted for` : "everyone found"}.</p>}
          <div className="actions"><button type="button" className="button" onClick={openRollCall}><Icon name="siren" /><span>Start a drill</span></button></div>
        </>
      )}
      <SourceNote ids={["access_control", "visitors", "rostering", "permits", "evac"]} />
    </section>
  );
}
