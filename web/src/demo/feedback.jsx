// Feedback and guesses: the feedback box at the bottom of every page, the header Feedback dialog (for menus, the role
// switcher or anything else), and the dashed "Our guess" tags that let a reviewer say what their company really uses.
// Main pages keep tags out of the data: each page lists its data sources once, in the strip above the feedback box.
// Everything sent goes to demo/server.py, which appends it to demo/feedback/FEEDBACK.md (git-ignored) for Tristan to read.
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router";
import { assumption } from "./assumptions.js";
import { PERSONAS } from "./data.js";
import { getState, update, useDemo } from "./store.js";
import { Icon } from "../icons.jsx";
import { useToast } from "../ui.jsx";

const KINDS = ["Comment", "Something's wrong", "Something's missing", "Question", "I like this"];
let config = null;

async function getConfig() {
  if (!config) config = fetch("/api/config").then((r) => (r.ok ? r.json() : { offline: true })).catch(() => ({ offline: true }));
  return config;
}
export function useConfig() {
  const [c, setC] = useState(null);
  useEffect(() => { getConfig().then(setC); }, []);
  return c;
}

export async function post(path, body) {
  const s = getState();
  const r = await fetch(path, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Demo-Code": s.code || "" },
    body: JSON.stringify({ ...s.identity, role: PERSONAS.find((p) => p.id === s.viewer)?.label.replace(" (you)", ""), ...body }),
  });
  if (r.status === 401) throw new Error("code");
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export async function loadAnswers() {
  try {
    const r = await fetch("/api/systems");
    if (r.ok) { const answers = await r.json(); update((s) => ({ answers: { ...s.answers, ...answers } })); }
  } catch { /* opened without the demo server: answers stay local */ }
}

// Name, team and (when the server asks for one) the demo code, remembered in this browser.
function Who({ needCode }) {
  const { identity, code } = useDemo();
  const set = (k) => (e) => update((s) => ({ identity: { ...s.identity, [k]: e.target.value } }));
  return (
    <div className="fb-who">
      <label className="field"><span>Your name <span className="muted">(optional)</span></span>
        <input className="input" value={identity.name} onChange={set("name")} autoComplete="name" /></label>
      <label className="field"><span>Your team <span className="muted">(for example IT, Operations)</span></span>
        <input className="input" value={identity.team} onChange={set("team")} autoComplete="organization-title" /></label>
      {needCode && (
        <label className="field"><span>Demo code <span className="muted">(from the email)</span></span>
          <input className="input" value={code} onChange={(e) => update(() => ({ code: e.target.value.trim() }))} autoComplete="off" /></label>
      )}
    </div>
  );
}

function useSend() {
  const toast = useToast();
  const cfg = useConfig();
  const [busy, setBusy] = useState(false);
  const [needCode, setNeedCode] = useState(false);
  const send = async (path, body) => {
    if (cfg?.offline) { toast({ title: "The demo server isn't running, so this couldn't be sent.", tone: "bad" }); return false; }
    setBusy(true);
    try { const out = await post(path, body); setBusy(false); return out || true; }
    catch (e) {
      setBusy(false);
      if (e.message === "code") { setNeedCode(true); toast({ title: "Enter the demo code from the email, then send again.", tone: "bad" }); }
      else toast({ title: "Couldn't send. Please try again.", tone: "bad" });
      return false;
    }
  };
  return { send, busy, needCode: needCode || (cfg?.code_required && !getState().code) };
}

export const PRIVACY = "Only Tristan reads feedback. It's kept on his own server, never published, and your name is optional.";

// `compact`: one line until it's focused or has text, then the kind, name and team appear (the box under every page).
export function FeedbackForm({ where, onSent, autoFocus, compact = false }) {
  const location = useLocation();
  const [kind, setKind] = useState(KINDS[0]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(!compact);
  const [sent, setSent] = useState(false);
  const { send, busy, needCode } = useSend();
  const id = useId();
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (await send("/api/feedback", { text, kind, where, page: location.pathname })) {
      setText(""); setSent(true); setOpen(!compact);
      onSent?.();
    }
  };
  if (sent) {
    return (
      <div className="fb-thanks" role="status">
        <Icon name="check" />
        <p><strong>Thanks, that's with Tristan.</strong> He reads every note and will send a summary of what changed.</p>
        <button type="button" className="link" onClick={() => setSent(false)}>Send another</button>
      </div>
    );
  }
  return (
    <form className={`fb-form ${open ? "is-open" : ""}`} onSubmit={submit} onFocus={() => setOpen(true)}>
      <label className="sr-only" htmlFor={id}>Your feedback about {where}</label>
      <div className="fb-line">
        <textarea id={id} className="input fb-text" rows={open ? 3 : 1} value={text} onChange={(e) => setText(e.target.value)} autoFocus={autoFocus}
          placeholder="What's wrong, missing, confusing or useful here? Short notes are fine." maxLength={4000} />
        {!open && <button type="submit" className="button button-primary" disabled>Send</button>}
      </div>
      {open && (
        <>
          <div role="group" aria-label="Kind of feedback" className="chips">
            {KINDS.map((k) => <button key={k} type="button" className="chip fb-kind" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>)}
          </div>
          <Who needCode={needCode} />
          <div className="actions fb-actions">
            <button type="submit" className="button button-primary" disabled={busy || !text.trim()}>{busy ? "Sending…" : "Send feedback"}</button>
            <p className="muted small">{PRIVACY}</p>
          </div>
        </>
      )}
    </form>
  );
}

// The box at the bottom of every page.
export function FeedbackBox({ where }) {
  return (
    <section className="panel-card fb-card" aria-labelledby="fb-h">
      <h2 id="fb-h"><Icon name="message" /> Feedback on {where}</h2>
      <FeedbackForm where={where} compact />
    </section>
  );
}

// Open the feedback dialog from anywhere (a menu, a wizard step): openFeedback("Setup wizard, step 2")
export const openFeedback = (where) => dispatchEvent(new CustomEvent("demo-feedback", { detail: { where } }));

export function FeedbackDialog({ page }) {
  const ref = useRef(null);
  const [about, setAbout] = useState(null);
  useEffect(() => {
    const open = (e) => { setAbout(e.detail?.where || null); ref.current?.showModal?.(); };
    addEventListener("demo-feedback", open);
    return () => removeEventListener("demo-feedback", open);
  }, []);
  const options = [`This page: ${page}`, "The menus and navigation", "The \"Viewing as\" switcher", "The demo overall"];
  const where = about || options[0];
  const close = () => ref.current?.close();
  return (
    <dialog ref={ref} className="palette demo-dialog" aria-labelledby="fbd-h" onClick={(e) => e.target === ref.current && close()}>
      <div className="dialog-body">
        <div className="card-head">
          <h2 id="fbd-h">Send feedback</h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Close"><Icon name="close" /></button>
        </div>
        <label className="field"><span>About</span>
          <select className="input" value={where} onChange={(e) => setAbout(e.target.value)}>
            {[...(about && !options.includes(about) ? [about] : []), ...options].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <FeedbackForm where={where} onSent={close} autoFocus />
      </div>
    </dialog>
  );
}

// ── Assumptions ──
export const useAnswer = (id) => useDemo((s) => s.answers[id]);

export function AnswerForm({ id, onSaved }) {
  const a = assumption(id);
  const prior = useAnswer(id);
  const [value, setValue] = useState(prior?.answer || "");
  const [note, setNote] = useState("");
  const { send, busy, needCode } = useSend();
  const toast = useToast();
  const fid = useId();
  const save = async (answer) => {
    if (!answer.trim()) return;
    const out = await send("/api/systems", { id, answer, note, area: `${a.area}: ${a.topic}`, question: a.question, assumed: a.assumed });
    if (out) {
      update((s) => ({ answers: { ...s.answers, ...(out.answers || { [id]: { answer, by: s.identity.name || "You" } }) } }));
      setNote("");
      toast({ title: "Saved. The others reviewing this demo now see your answer, and Tristan gets it too.", tone: "good" });
      onSaved?.();
    }
  };
  return (
    <form className="answer-form" onSubmit={(e) => { e.preventDefault(); save(value); }}>
      <p className="answer-q">{a.question}</p>
      <p className="muted small">Our guess: <strong>{a.assumed}</strong>. {a.why}</p>
      <label className="field" htmlFor={fid}><span>What you actually use</span></label>
      <input id={fid} className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="For example: Salto Space at two sites, Gallagher at the rest" />
      <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything else about this (optional)" aria-label="Note (optional)" />
      <Who needCode={needCode} />
      <div className="actions">
        <button type="submit" className="button button-primary" disabled={busy || !value.trim()}>Save answer</button>
        <button type="button" className="button" disabled={busy} onClick={() => save(`Correct: ${a.assumed}`)}>That's right</button>
        <button type="button" className="button" disabled={busy} onClick={() => save("We don't use this")}>We don't use this</button>
        <button type="button" className="button" disabled={busy} onClick={() => save("Not sure")}>Not sure</button>
      </div>
      {prior && <p className="muted small">Last answer: "{prior.answer}"{prior.by ? `, from ${prior.by}` : ""}{prior.at ? ` (${prior.at})` : ""}.</p>}
    </form>
  );
}

// A dashed tag beside any value the demo guessed. Shows the reviewer's answer once there is one.
export function Assumed({ id, children }) {
  const a = assumption(id);
  const ans = useAnswer(id);
  const ref = useRef(null);
  const [open, setOpen] = useState(false); // mount the dialog only while it's open: pages carry dozens of tags
  if (!a) return children || null;
  return (
    <>
      <button type="button" className={`assumed ${ans ? "is-answered" : ""}`} onClick={() => { setOpen(true); requestAnimationFrame(() => ref.current?.showModal?.()); }}
        aria-label={`${children || a.assumed}: ${ans ? `answered, ${ans.answer}` : "our guess"}. Correct it`}>
        <span>{ans ? ans.answer : children || a.assumed}</span>
        <span className="assumed-tag">{ans ? "Your answer" : "Our guess"}</span>
      </button>
      {open && createPortal( // a dialog can't sit inside the paragraphs and table cells the tag appears in
        <dialog ref={ref} className="palette demo-dialog" aria-label={`Correct: ${a.topic}`} onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && ref.current.close()}>
          <div className="dialog-body">
            <div className="card-head">
              <h2>{a.topic}</h2>
              <button type="button" className="icon-button" onClick={() => ref.current.close()} aria-label="Close"><Icon name="close" /></button>
            </div>
            <AnswerForm id={id} onSaved={() => ref.current?.close()} />
          </div>
        </dialog>, document.body)}
    </>
  );
}

// What a system is called now: the reviewer's answer when there is a usable one, otherwise our guess. Used in plain text, so
// pages read like the real product while the tags themselves stay in one place per page.
export function useSystemName(id) {
  const ans = useAnswer(id);
  const a = assumption(id);
  if (!ans || /^(We don't use this|Not sure)$/.test(ans.answer)) return a?.assumed || id;
  return ans.answer.replace(/^Correct: /, "");
}

export const SystemName = ({ id }) => useSystemName(id);

// Each page collects the systems its cards draw on (SourceNote registers them) and lists them once, in PageSources.
const SourcesCtx = createContext(null);
export function SourcesScope({ children }) {
  const [ids, setIds] = useState([]);
  const add = useCallback((list) => setIds((cur) => { const next = [...new Set([...cur, ...list])]; return next.length === cur.length ? cur : next; }), []);
  return (
    <SourcesCtx.Provider value={add}>
      {children}
      <PageSources ids={ids} />
    </SourcesCtx.Provider>
  );
}
export function SourceNote({ ids }) {
  const add = useContext(SourcesCtx);
  const key = ids.join();
  useEffect(() => { add?.(ids); }, [key]);
  return null;
}

function PageSources({ ids }) {
  const answers = useDemo((s) => s.answers);
  if (!ids.length) return null;
  const open = ids.filter((id) => !answers[id]).length;
  return (
    <section className="panel-card sources-card" aria-labelledby="src-h">
      <h2 id="src-h">Where this page's data would come from</h2>
      <p className="muted small">{open ? `${open} of these ${ids.length} are our guesses about your systems. Click one to say what you really use, or ` : "You've answered all of these. You can still change any of them, or "}
        <Link to="/systems">go through every guess</Link>.</p>
      <ul className="sys-list" role="list">{ids.map((id) => <li key={id}><Assumed id={id} /></li>)}</ul>
    </section>
  );
}
