// About this demo: what it is, what to try, and how feedback works.
import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { COMPANY, PERSONAS } from "../data.js";
import { resetDemo, update } from "../store.js";
import { useToast } from "../../ui.jsx";
import { PRIVACY } from "../feedback.jsx";

export default function About() {
  const toast = useToast();
  const { hash } = useLocation();
  useEffect(() => { if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ block: "start" })); }, [hash]);
  return (
    <>
      <section className="panel-card span-2">
        <h2>What this is</h2>
        <p>An early prototype of Mycelium: one place to see and run every site, for everyone from the GM to the shop floor. {COMPANY.name} is {COMPANY.what};
          every name and number is made up. Nothing is connected to a real system, and nothing you click changes anything outside this demo.</p>
      </section>
      <section className="panel-card">
        <h2>Try this</h2>
        <ol className="steps-list">
          <li>On <Link to="/">Home</Link>, read the brief, then approve Saturday's shutdown.</li>
          <li>Use <strong>Viewing as</strong> (top left) to see the same app as a Site Manager, a Supervisor and an Employee.</li>
          <li>On <Link to="/people">People</Link>, drag a task onto someone in the team map.</li>
          <li>On <Link to="/calendar">Calendar</Link>, as a Supervisor, try to move the locked ISO audit, then request a change.</li>
          <li>On <Link to="/security">Security</Link>, hold to cancel the former employee's card, then open the Cyber security tab.</li>
          <li>Walk through the <Link to="/setup">Setup wizard</Link>.</li>
        </ol>
        <h3 className="about-sub">New this week</h3>
        <ol className="steps-list">
          <li>As the Shift Supervisor, open <Link to="/rosters">Rosters</Link>, add a shift on someone's day off and watch Problems flag the 48-hour week. Send it, then approve it as the Site Manager.</li>
          <li>On <Link to="/people">People</Link>, open Skills: Toowoomba's afternoon shift loses its last crane ticket in two days.</li>
          <li>As the Site Manager, open <Link to="/work">Work</Link> and issue a permit: only people with a current ticket can be picked. Security's door activity shows whether each read at a restricted door had a permit.</li>
          <li>On <Link to="/sites?site=ips&view=map">Sites, Ipswich, Map</Link>, jump to "Former employee's card at Gate 2", then press Play to replay the door reads.</li>
          <li>As the Shift Supervisor, read Weather and roads on Home. Then, as the Employee, turn route alerts off: you drop out of the supervisor's list.</li>
          <li>On <Link to="/documents?tab=review">Documents</Link>, see why the Moorvale invoice is flagged, accept a corrected one, and export the tax pack.</li>
          <li>Press <strong>Roll call</strong> in the header and hold to start a drill at Ipswich. Tick people Safe or Not found as a warden would on a phone; every page's banner stays red until you hold End roll call.</li>
          <li>Open <Link to="/audit?framework=iso27001">Audit evidence</Link>, ISO 27001. Cancel the leaver's card on Security or run a drill, and watch a gap turn into evidence. Then build the pack an auditor would take away.</li>
          <li>As the Shift Supervisor, open someone's record on People. Then switch to Employee, Ipswich and open <Link to="/my-data">What we hold about you</Link>: the view is listed, with where each part came from and who can see it.</li>
        </ol>
      </section>
      <section className="panel-card">
        <h2>Feedback, please</h2>
        <p>There's a feedback box at the bottom of every page, and a Feedback button in the header for menus or anything else. Short notes are perfect:
          "we'd never use this", "this is what I check every morning", "this would need X before IT says yes".</p>
        <p>{PRIVACY}</p>
      </section>
      <section className="panel-card">
        <h2>Correct our guesses</h2>
        <p>Each page lists the systems its data would come from, near the bottom. A dashed <span className="assumed-tag">Our guess</span> tag is a guess about your
          systems or structure: click one to correct it, or open <Link to="/systems">Your systems</Link> to go through them all in order. Answers are visible to the others
          reviewing this demo, and go to Tristan.</p>
      </section>
      <section className="panel-card it-card" id="it" aria-labelledby="it-h">
        <h2 id="it-h">For IT: how a real deployment would work</h2>
        <p className="muted small">The plan, open to your team's input. Nothing here is final, and no real company data is used before IT approves a pilot.</p>
        <dl className="facts it-facts">
          <dt>Hosting</dt><dd>Runs in your own cloud tenant (for example Azure) as containers. Data stays in your environment.</dd>
          <dt>Sign-in</dt><dd>Your existing single sign-on, with directory sync, so joiners and leavers update by themselves.</dd>
          <dt>Connections</dt><dd>Read-only connections to each system first. Systems without a cloud connection go through one small gateway per site that only connects outwards: no inbound ports.</dd>
          <dt>Computers</dt><dd>No new agent where a system already knows the answer: screen-lock and encryption status come from your device management.</dd>
          <dt>Actions</dt><dd>Read-only by default. An action such as cancelling a lost card comes from a short fixed list, uses a restricted service account, needs approval, and is logged.</dd>
          <dt>Cameras</dt><dd>Health and events only (offline, tamper, motion in a restricted zone). Video never passes through Mycelium.</dd>
          <dt>Audit</dt><dd>Every view of sensitive data and every change is recorded in a log that can't be edited, and can be exported.</dd>
          <dt>Rosters</dt><dd>Reads shifts, teams and leave from your rostering system and HR, and tickets from training records. It writes a roster back only through one fixed "publish draft" action after a person approves it; the rostering system stays the record. Stores draft changes and who approved them, not timesheets or pay.</dd>
          <dt>Permits</dt><dd>Reads permits from where they're written today, tickets from training records and card reads from access control. By default it only alerts. Adding holders' cards to an area's access group for the permit window would be a fixed, approved action.</dd>
          <dt>Site map</dt><dd>Reads door events, camera health (never video), alarm states and machine states, all read-only. Stores one floor plan per site, drawn once in setup from a PDF. People per area are counted from card reads, not named.</dd>
          <dt>Weather and roads</dt><dd>Would read the Bureau of Meteorology's public warnings and QLDTraffic's open data (their terms of reuse to be checked). Home postcodes come from HR only for staff who opted in; addresses are never read. The demo fetches nothing.</dd>
          <dt>Documents</dt><dd>Reads only nominated locations (an accounts payable mailbox, one SharePoint library, a scanned-receipts folder), never whole drives. Extraction runs in your own tenant. Stores the extracted fields, review decisions and a link to each file. Never pays, never changes the finance system, never lodges anything.</dd>
          <dt>Roll call</dt><dd>Reads door events, visitor sign-ins, the roster and live permits. It never opens doors; a real roll call would also push to phones and floor screens. Stores the ticks while it runs and a report (site, times, who wasn't accounted for) in the audit trail.</dd>
          <dt>Audit evidence</dt><dd>The compliance plug-in reads, read-only, what Mycelium already collects: door logs, inspections, permits, roll calls, training, device state, approvals and the audit trail. It stores only which packs were built and guest-auditor access with its expiry. Real packs would be signed and checked against the tamper-evident log.</dd>
          <dt>Staff data</dt><dd>Everyone can see what Mycelium holds about them, where it came from, who can see it and how long it's kept, and who opened their record. Nothing new is collected; correction requests go to HR.</dd>
          <dt>AI</dt><dd>Off unless you turn it on. Answers cite their sources, and emails or documents can never make it take an action.</dd>
          <dt>This demo</dt><dd>Runs on Tristan's own server with made-up data. Feedback and answers are stored there, only Tristan reads the feedback, and names are optional.</dd>
        </dl>
      </section>
      <section className="panel-card">
        <h2>The six views</h2>
        <ul className="queue" role="list">{PERSONAS.map((p) => (
          <li key={p.id} className="queue-item"><p><button type="button" className="link" onClick={() => update(() => ({ viewer: p.id }))}>{p.label}</button></p></li>
        ))}</ul>
        <button type="button" className="button" onClick={() => { resetDemo(); toast({ title: "Demo reset. Your answers and feedback are kept." }); }}>Reset what I've clicked</button>
      </section>
    </>
  );
}
