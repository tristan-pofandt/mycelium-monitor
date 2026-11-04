// Your systems: every guess the demo makes, in the order to answer them, with one primary action (answer the next one).
// Saving an answer opens the next unanswered guess, so a reviewer can go through them all without hunting.
import { useState } from "react";
import { Icon } from "../../icons.jsx";
import { AREAS, AREA_NOTES, ASSUMPTIONS } from "../assumptions.js";
import { AnswerForm, useAnswer } from "../feedback.jsx";
import { useDemo } from "../store.js";

const ORDERED = AREAS.flatMap((area) => ASSUMPTIONS.filter((a) => a.area === area));

function Row({ a, open, onToggle, onSaved }) {
  const ans = useAnswer(a.id);
  return (
    <li className={`sys-row ${ans ? "is-answered" : ""}`} id={`q-${a.id}`}>
      <details open={open} onToggle={(e) => onToggle(e.currentTarget.open)}>
        <summary>
          <span className="sys-topic">{ans && <Icon name="check" size={14} />}{a.topic}</span>
          <span className="sys-value">{ans ? ans.answer : a.assumed}</span>
          <span className="sys-action">{ans ? "Change" : "Answer"}<Icon name="chevron" size={14} /></span>
        </summary>
        {open && <AnswerForm id={a.id} onSaved={onSaved} />}
      </details>
    </li>
  );
}

export default function Systems() {
  const answers = useDemo((s) => s.answers);
  const [openId, setOpenId] = useState(null);
  const done = ORDERED.filter((a) => answers[a.id]).length;
  const nextAfter = (id) => {
    const from = ORDERED.findIndex((a) => a.id === id);
    return [...ORDERED.slice(from + 1), ...ORDERED.slice(0, from + 1)].find((a) => !answers[a.id] && a.id !== id);
  };
  const openQ = (q) => {
    setOpenId(q?.id || null);
    if (q) requestAnimationFrame(() => {
      const row = document.getElementById(`q-${q.id}`);
      row?.scrollIntoView({ block: "center" });
      row?.querySelector("input")?.focus({ preventScroll: true });
    });
  };
  const next = ORDERED.find((a) => !answers[a.id]);
  return (
    <>
      <section className="panel-card systems-intro">
        <div className="systems-intro-text">
          <h2>{done === ORDERED.length ? "Every guess answered. Thank you!" : `${ORDERED.length - done} guesses left to check`}</h2>
          <p className="muted">To build the demo we had to guess which systems you use and how the sites are organised. Tell us what's real: a product name,
            "a spreadsheet", "it differs by site" or "not sure" are all useful. It takes about 10 minutes, and you can stop any time.</p>
          <p className="muted small">Answers are visible to the others reviewing this demo, and go to Tristan.</p>
        </div>
        <div className="systems-intro-action">
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={ORDERED.length} aria-valuenow={done} aria-label="Guesses answered">
            <span style={{ transform: `scaleX(${done / ORDERED.length})` }} />
          </div>
          <p className="small"><strong>{done}</strong> of {ORDERED.length} answered</p>
          {next && <button type="button" className="button button-primary" onClick={() => openQ(next)}>{done ? "Answer the next one" : "Start with the first one"}</button>}
        </div>
      </section>
      {AREAS.map((area) => {
        const list = ORDERED.filter((a) => a.area === area);
        const left = list.filter((a) => !answers[a.id]).length;
        return (
          <section key={area} className={`panel-card systems-area ${area === "IT" ? "is-it" : ""}`} aria-labelledby={`area-${area}`}>
            <div className="card-head">
              <div>
                <h2 id={`area-${area}`}>{area}{area === "IT" && <span className="badge">For your IT team</span>}</h2>
                <p className="card-sub">{AREA_NOTES[area]}</p>
              </div>
              <span className="muted small">{left ? `${left} left` : "All answered"}</span>
            </div>
            <ul className="sys-rows" role="list">{list.map((a) => (
              <Row key={a.id} a={a} open={openId === a.id} onToggle={(o) => setOpenId(o ? a.id : openId === a.id ? null : openId)}
                onSaved={() => openQ(nextAfter(a.id))} />
            ))}</ul>
          </section>
        );
      })}
    </>
  );
}
