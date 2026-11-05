// What we hold about you: anyone sees their own record here, and only their own, whatever their role. Each part says where it
// came from, who can see it and how long it's kept (held.js). Plus who looked, what we never collect, a correction request
// to HR and a download of the whole (fictional) record.
import "../held.css";
import { Fragment, useState } from "react";
import { Icon } from "../../icons.jsx";
import { useToast } from "../../ui.jsx";
import { fmtDay, person } from "../data.js";
import { NEVER, fileName, heldAbout, myDataFile } from "../held.js";
import { SourceNote, SystemName } from "../feedback.jsx";
import { audit, getState, update, useDemo, usePersona } from "../store.js";

const GROUPS = [
  ["profile", "Profile from HR", "Your job, where you work and who you report to."],
  ["access", "Access card and door reads", "Which doors your card opened, from the access system."],
  ["time", "Shifts and leave", "Your roster and the leave you've asked for."],
  ["skills", "Skills and certificates", "Tickets and training, and the machines they let you run."],
  ["tasks", "Tasks", "Work handed to you, from the task tools."],
  ["devices", "Devices", "Where you're signed in to Mycelium."],
  ["permits", "Permits to work", "Permits you hold or issued."],
  ["rollcalls", "Roll calls", "Evacuation drills and roll calls at your site."],
  ["commute", "Route alerts", "Whether we warn you about floods and closed roads on your way in."],
  ["views", "Who looked at your record", "Each time someone else opened your record in Mycelium."],
];
const SHOW = 8;

function Part({ c, heading }) {
  return (
    <div className="held-part">
      {heading && <h3 className="held-h">{c.title}</h3>}
      {c.summary && <p className="small">{c.summary}</p>}
      {c.items.length ? (
        <dl className="facts">
          {c.items.slice(0, SHOW).map((i, k) => <Fragment key={k}><dt>{i.label}</dt><dd>{i.value}</dd></Fragment>)}
        </dl>
      ) : <p className="muted small">Nothing held.</p>}
      {c.items.length > SHOW && <p className="muted small">{c.items.length - SHOW} more in your download.</p>}
      {c.note && <p className="muted small">{c.note}</p>}
      <dl className="held-meta small">
        <div><dt>From</dt><dd><SystemName id={c.source} /></dd></div>
        <div><dt>Who can see it</dt><dd>{c.who[0].toUpperCase() + c.who.slice(1)}</dd></div>
        <div><dt>Kept</dt><dd>{c.kept}</dd></div>
      </dl>
    </div>
  );
}

function Correction({ me, cards }) {
  const toast = useToast();
  const [card, setCard] = useState(cards[0][1]);
  const [text, setText] = useState("");
  const mine = useDemo((s) => s.dataRequests).filter((r) => r.personId === me.id);
  const send = (e) => {
    e.preventDefault();
    const what = text.trim().slice(0, 500);
    if (!what) return;
    const req = { id: `dr${Date.now()}`, at: Date.now(), personId: me.id, card, text: what, status: "Sent to HR" };
    update((s) => ({ dataRequests: [req, ...s.dataRequests] }));
    audit(`asked HR to correct their record (${card.toLowerCase()})`);
    setText("");
    toast({ title: "Sent to HR. You'll see its status here and in Work.", tone: "good", action: { label: "Undo", onClick: () => {
      update((s) => ({ dataRequests: s.dataRequests.filter((r) => r.id !== req.id) }));
      audit(`withdrew a correction request (${card.toLowerCase()})`);
    } } });
  };
  return (
    <section className="panel-card held-wide" id="correction" aria-labelledby="fix-h">
      <h2 id="fix-h">Ask for a correction</h2>
      <p className="card-sub">Something wrong or out of date? Tell HR. They fix it in the system it came from, and the fix flows through to Mycelium.</p>
      <form className="form-grid" onSubmit={send}>
        <label className="field"><span>Which part</span>
          <select className="input" value={card} onChange={(e) => setCard(e.target.value)}>{cards.map(([id, title]) => <option key={id} value={title}>{title}</option>)}</select>
        </label>
        <label className="field"><span>What should it say?</span>
          <textarea className="input" rows={3} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} placeholder="For example: my forklift licence was renewed last week" />
        </label>
        <div className="actions"><button type="submit" className="button button-primary" disabled={!text.trim()}>Send to HR</button></div>
      </form>
      {mine.length > 0 && (
        <ul className="queue" role="list" aria-label="Your correction requests">
          {mine.map((r) => <li key={r.id} className="queue-item"><p><span className="badge">Data</span> {r.card}: {r.text}</p><p className="muted small">{r.status} · {fmtDay(new Date(r.at))}</p></li>)}
        </ul>
      )}
      <p className="muted small">Today: <SystemName id="privacy" />. Here it's one form, and it lands in the audit trail.</p>
      <SourceNote ids={["privacy", "hr"]} />
    </section>
  );
}

export default function MyData() {
  const persona = usePersona();
  const me = person(persona.person);
  const state = useDemo();
  const held = heldAbout(me.id, state);
  const toast = useToast();
  const groups = GROUPS.map(([id, title, sub]) => ({ id, title, sub, parts: held.filter((c) => c.group === id) })).filter((g) => g.parts.length);
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(myDataFile(me.id, getState()), null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: fileName(me) });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    audit("downloaded their own data from My data");
    toast({ title: `Saved ${fileName(me)}. Everything in it is fictional.`, tone: "good" });
  };
  return (
    <>
      <section className="panel-card held-intro" aria-labelledby="held-h">
        <div>
          <h2 id="held-h">Everything Mycelium holds about you, {me.name.split(" ")[0]}</h2>
          <p>Each part says where it came from, who can see it and how long it's kept. Only you see this page about you, whatever your role.</p>
        </div>
        <div className="actions">
          <button type="button" className="button button-primary" onClick={download}><Icon name="doc" />Download my data</button>
          <a className="button" href="#correction">Ask for a correction</a>
        </div>
      </section>
      {groups.map((g) => (
        <section key={g.id} className={`panel-card${g.id === "views" ? " span-2" : ""}`} aria-labelledby={`held-${g.id}`}>
          <div className="card-head"><div><h2 id={`held-${g.id}`}>{g.title}</h2><p className="card-sub">{g.sub}</p></div></div>
          {g.parts.map((c) => <Part key={c.id} c={c} heading={g.parts.length > 1} />)}
          <SourceNote ids={[...new Set(g.parts.map((c) => c.source))]} />
        </section>
      ))}
      <section className="panel-card" aria-labelledby="never-h">
        <h2 id="never-h">What we never collect</h2>
        <p className="card-sub">Workload comes from tasks, tickets and rosters. Never from watching you.</p>
        <ul className="held-never" role="list">{NEVER.map((n) => <li key={n}><Icon name="close" /><span>{n}</span></li>)}</ul>
        <SourceNote ids={["privacy"]} />
      </section>
      <Correction me={me} cards={groups.filter((g) => g.id !== "views").map((g) => [g.id, g.title])} />
    </>
  );
}
