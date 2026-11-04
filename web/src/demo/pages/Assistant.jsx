// Assistant: a simulated chat. No AI is connected in the demo; answers are worked out from the demo's own data, and each one
// lists the systems it would draw on. In a real deployment answers respect the asker's role, as they do here.
import { useRef, useState } from "react";
import { Icon } from "../../icons.jsx";
import { CAMERAS, INSPECTIONS, LEAVERS, SITES, dayOffset, person, under } from "../data.js";
import { SourceNote, SystemName } from "../feedback.jsx";
import { useApprovals, useTasks } from "../bits.jsx";
import { usePersona } from "../store.js";

function useAnswers() {
  const p = usePersona();
  const me = person(p.person);
  const { pending } = useApprovals();
  const tasks = useTasks().filter((t) => t.status !== "done");
  const sites = p.id === "site_manager" ? SITES.filter((s) => s.id === me.site) : SITES;
  const worst = (k, dir = 1) => [...sites].sort((a, b) => dir * (b.kpi[k] - a.kpi[k]))[0];
  const limited = ["employee", "supervisor"].includes(p.id);
  return [
    { q: "What needs my attention today?", src: ["maintenance", "rostering", "access_control"], a: () => limited
      ? `${tasks.length} open tasks${p.id === "supervisor" ? ` across your team of ${under(me.id).length}` : ""}, and ${pending.length} approvals waiting. Your next shift starts at ${me.shift === "Day" ? "6:00" : "14:00"}.`
      : `${pending.length} approvals are waiting for you. ${worst("overdue").name} has ${worst("overdue").kpi.overdue} overdue work orders. ${LEAVERS.length} former employees still have active cards, and ${INSPECTIONS.filter((i) => i.due < dayOffset(0)).length} security inspections are overdue.` },
    { q: "Which site has the most overdue maintenance?", src: ["maintenance"], a: () => limited ? "That's outside your view. Your Site Manager sees maintenance across the site."
      : `${worst("overdue").name}: ${worst("overdue").kpi.overdue} overdue work orders. ${sites.length > 1 ? `Next is ${[...sites].sort((a, b) => b.kpi.overdue - a.kpi.overdue)[1].name} with ${[...sites].sort((a, b) => b.kpi.overdue - a.kpi.overdue)[1].kpi.overdue}.` : ""}` },
    { q: "Where are we short-staffed next week?", src: ["rostering", "hr"], a: () => limited ? "Your team's roster for next week is fully covered." : `${worst("coverage", -1).name} is ${worst("coverage", -1).kpi.coverage}% covered: 9 night shifts have nobody yet. Every other site is above 90%.` },
    { q: "Any security issues I should know about?", src: ["access_control", "cctv", "hr"], a: () => limited ? "Nothing that involves your team." : `Two need action: a former employee's card opened Gate 2 at Ipswich 5 hours ago, and Toowoomba's comms room was held open for 14 minutes. ${CAMERAS.reduce((n, c) => n + c.offline.length, 0)} cameras are offline.` },
    { q: "Summarise last week for the leadership meeting", src: ["plantdata", "whs", "erp"], a: () => limited ? "Only managers can ask for site summaries." : `Average OEE ${Math.round(sites.reduce((n, s) => n + s.kpi.oee, 0) / sites.length)}%, ${sites.reduce((n, s) => n + s.kpi.incidents, 0)} recordable incidents, on-time delivery between ${Math.min(...sites.map((s) => s.kpi.otif))}% and ${Math.max(...sites.map((s) => s.kpi.otif))}%. Biggest risk: maintenance backlog at ${worst("overdue").name}. A draft slide is ready to review.` },
  ];
}

export default function Assistant() {
  const answers = useAnswers();
  const p = usePersona();
  const [chat, setChat] = useState([]);
  const [text, setText] = useState("");
  const end = useRef(null);
  const ask = (q) => {
    const hit = answers.find((x) => x.q.toLowerCase() === q.toLowerCase()) || answers.find((x) => q.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => x.q.toLowerCase().includes(w)));
    setChat((c) => [...c, { who: "you", text: q }, hit ? { who: "ai", text: hit.a(), src: hit.src } : { who: "ai", text: "In this demo I can only answer the suggested questions. Tell Tristan what you'd ask in the feedback box below: that's exactly what he needs to know." }]);
    setText("");
    requestAnimationFrame(() => end.current?.scrollIntoView?.({ block: "nearest" }));
  };
  return (
    <section className="panel-card span-2">
      <div className="card-head"><div><h2>Ask about your sites</h2><p className="card-sub">Simulated: no AI is connected in this demo. Answers use the demo's data and only what {p.label} may see.</p></div></div>
      <div className="chat" aria-live="polite">
        {!chat.length && <p className="muted">Try one of these:</p>}
        {chat.map((m, i) => (
          <div key={i} className={`msg msg-${m.who}`}>
            <p>{m.text}</p>
            {m.src && <p className="muted small">Sources: {m.src.map((s, k) => <span key={s}>{k ? ", " : ""}<SystemName id={s} /></span>)}<SourceNote ids={m.src} /></p>}
          </div>
        ))}
        <span ref={end} />
      </div>
      <ul className="chips" role="list">{answers.map((x) => <li key={x.q}><button type="button" className="chip" onClick={() => ask(x.q)}>{x.q}</button></li>)}</ul>
      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); if (text.trim()) ask(text.trim()); }}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask a question" aria-label="Ask a question" />
        <button type="submit" className="button button-primary" disabled={!text.trim()}><Icon name="arrow" /> Ask</button>
      </form>
      <p className="muted small">In a real version the assistant would be off until IT turns it on, every answer would cite its sources, and emails or documents could never make it take an action.</p>
    </section>
  );
}
