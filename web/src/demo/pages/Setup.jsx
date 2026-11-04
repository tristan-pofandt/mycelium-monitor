// Setup wizard: the first question (how big?) decides the rest. A small business answers three questions and connects a few
// accounts; a multi-site company starts from its directory, confirms the structure, sets policies, then hands each site's
// part to that site's manager. Nothing connects in the demo; each step says what it would do.
import { useState } from "react";
import { Icon } from "../../icons.jsx";
import { Switch, useToast } from "../../ui.jsx";
import { ENTITIES, PEOPLE, SITES } from "../data.js";
import { Assumed, openFeedback } from "../feedback.jsx";

const SIZES = [
  { id: "small", label: "Just me or a small team", sub: "Under 20 people, one place" },
  { id: "medium", label: "One site", sub: "20 to 200 people" },
  { id: "large", label: "Several sites or entities", sub: "Hundreds of people, many systems" },
];
const SYSTEM_STEPS = ["access_control", "cctv", "visitors", "alarms", "rostering", "maintenance", "plantdata", "whs", "tasks", "itsm"];

function Choice({ value, options, onChange, name }) {
  return (
    <div className="choices" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <label key={o.id} className={`choice ${value === o.id ? "is-on" : ""}`}>
          <input type="radio" name={name} checked={value === o.id} onChange={() => onChange(o.id)} />
          <span><strong>{o.label}</strong>{o.sub && <span className="muted small block">{o.sub}</span>}</span>
        </label>
      ))}
    </div>
  );
}

export default function Setup() {
  const toast = useToast();
  const [size, setSize] = useState("large");
  const [step, setStep] = useState(0);
  const [connected, setConnected] = useState({});
  const [delegated, setDelegated] = useState({});
  const [mail, setMail] = useState("metadata");
  const [ai, setAi] = useState(false);
  const [confirmed, setConfirmed] = useState({});
  const [small, setSmall] = useState({ sell: "", how: "shop" });

  const large = size !== "small";
  const steps = large
    ? ["Size", "Sign-in and directory", "Confirm your structure", "Policies", "Connect systems", "Review"]
    : ["Size", "About your business", "Connect accounts", "Review"];
  const total = SYSTEM_STEPS.length * (size === "large" ? SITES.length : 1);
  const done = Object.values(connected).filter(Boolean).length + Object.values(delegated).filter(Boolean).length * SYSTEM_STEPS.length;
  const score = Math.min(100, Math.round(20 + (connected.sso ? 25 : 0) + (Object.keys(confirmed).length / SITES.length) * 15 + (done / total) * 40));
  const name = steps[step];

  const body = {
    "Size": <><p>The first answer shapes everything after it. A small business sees four short steps; a company with several sites sees the full setup, with each site's part handed to its manager.</p>
      <Choice name="Business size" value={size} onChange={setSize} options={SIZES} /></>,
    "About your business": <div className="form-grid">
      <label className="field"><span>What do you sell?</span><input className="input" value={small.sell} onChange={(e) => setSmall({ ...small, sell: e.target.value })} placeholder="For example: coffee and pastries" /></label>
      <Choice name="How you sell" value={small.how} onChange={(how) => setSmall({ ...small, how })} options={[{ id: "shop", label: "In person" }, { id: "online", label: "Online" }, { id: "both", label: "Both" }]} />
    </div>,
    "Connect accounts": <ul className="connect" role="list">{["Xero", "Square", "Google Workspace"].map((x) => (
      <li key={x}><span>{x}</span><Switch checked={!!connected[x]} onChange={(on) => setConnected({ ...connected, [x]: on })} label={connected[x] ? "Connected (simulated)" : "Connect"} /></li>))}</ul>,
    "Sign-in and directory": <>
      <p>Mycelium starts from the directory you already have, so people, managers and departments come in by themselves and stay up to date.</p>
      <div className="connect-one">
        <span>Connect <Assumed id="sso" /></span>
        <button type="button" className={`button ${connected.sso ? "" : "button-primary"}`} onClick={() => { setConnected({ ...connected, sso: true }); toast({ title: `Found ${PEOPLE.length} people, ${SITES.length + 1} locations and 41 groups (simulated).`, tone: "good" }); }}>
          {connected.sso ? <><Icon name="check" /> Connected</> : "Connect"}</button>
      </div>
      <p className="muted small">IT approves this once, with read-only permissions. Staff then sign in with their normal work account.</p>
    </>,
    "Confirm your structure": <>
      <p>This is what the directory suggests. Fix anything that's wrong; the rest of setup uses it.</p>
      <ul className="queue" role="list">{SITES.map((s) => (
        <li key={s.id} className="queue-item">
          <p><strong>{s.name}</strong> · {s.kind} · {s.staff} people · {ENTITIES.find((e) => e.id === s.entity).name}</p>
          <label className="check"><input type="checkbox" checked={!!confirmed[s.id]} onChange={(e) => setConfirmed({ ...confirmed, [s.id]: e.target.checked })} /> Looks right</label>
        </li>))}</ul>
      <p className="source muted small"><Assumed id="s_sites" /> <Assumed id="s_entities" /> <Assumed id="s_levels" /></p>
    </>,
    "Policies": <>
      <p>Company-wide rules, set once by the owner. Each can be changed later.</p>
      <h3>Email assistant</h3>
      <Choice name="Email sharing level" value={mail} onChange={setMail} options={[
        { id: "off", label: "Off", sub: "Mycelium never reads email" },
        { id: "metadata", label: "Sender and subject only", sub: "To spot deadlines and supplier commitments" },
        { id: "summary", label: "Subject and a short summary", sub: "Summaries are stored, never the email" },
        { id: "full", label: "Full email, for chosen folders only", sub: "Emails marked confidential are always skipped" },
      ]} />
      <Switch checked={ai} onChange={setAi} label="Turn on the AI assistant for managers" hint="(off by default)" />
      <p className="muted small">Approval rules and lock levels are set on the Calendar page.</p>
    </>,
    "Connect systems": <>
      <p>{size === "large" ? "Connect what you can centrally, or hand a site's section to its Site Manager. You see progress per site." : "Connect the systems you use."}</p>
      <ul className="connect" role="list">{SYSTEM_STEPS.map((id) => (
        <li key={id}><Assumed id={id} /><Switch checked={!!connected[id]} onChange={(on) => setConnected({ ...connected, [id]: on })} label={connected[id] ? "Connected (simulated)" : "Connect"} /></li>))}</ul>
      {size === "large" && <>
        <h3>Hand a site to its manager</h3>
        <ul className="connect" role="list">{SITES.map((s) => {
          const sm = PEOPLE.find((p) => p.site === s.id && p.role === "site_manager");
          return <li key={s.id}><span>{s.name} <span className="muted small">({sm.name})</span></span>
            <button type="button" className="button" disabled={delegated[s.id]} onClick={() => { setDelegated({ ...delegated, [s.id]: true }); toast({ title: `${sm.name} has been asked to finish ${s.name}'s setup.`, tone: "good" }); }}>
              {delegated[s.id] ? "Sent" : "Send to Site Manager"}</button></li>;
        })}</ul>
      </>}
    </>,
    "Review": <>
      <p className="setup-score"><strong>{large ? score : Math.min(100, 40 + Object.values(connected).filter(Boolean).length * 20)}%</strong> of the picture is set up.</p>
      <p>What each missing piece would add:</p>
      <ul>
        {!connected.sso && large && <li>The directory: the people, managers and teams behind every page.</li>}
        {!connected.access_control && large && <li>Door access: leavers with active cards, comms room alerts.</li>}
        {!connected.rostering && <li>Rosters: staffing gaps before they happen.</li>}
        {!connected.plantdata && large && <li>Production data: OEE and downtime per site.</li>}
      </ul>
      <p className="muted small">You can come back to any step, or hand any step to someone else.</p>
    </>,
  };

  return (
    <section className="panel-card span-2 wizard">
      <ol className="steps" role="list">{steps.map((s, i) => (
        <li key={s} className={i === step ? "is-current" : i < step ? "is-done" : ""}>
          <button type="button" onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined}><span className="step-n">{i < step ? <Icon name="check" size={12} /> : i + 1}</span>{s}</button>
        </li>))}</ol>
      <div className="step-body">
        <h2>{name}</h2>
        {body[name]}
      </div>
      <div className="actions wizard-nav">
        <button type="button" className="button" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        {step < steps.length - 1
          ? <button type="button" className="button button-primary" onClick={() => setStep(step + 1)}>Next</button>
          : <button type="button" className="button button-primary" onClick={() => toast({ title: "Setup saved (simulated).", tone: "good" })}>Finish</button>}
        <button type="button" className="link" onClick={() => openFeedback(`Setup wizard: ${name}`)}>Feedback on this step</button>
      </div>
    </section>
  );
}
