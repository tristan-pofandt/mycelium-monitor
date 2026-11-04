// Work and approvals: one inbox for everything waiting on you, the tasks in your scope (from whichever tools hold them),
// a quick way to hand out a task, and your own requests and tickets.
import { useState } from "react";
import { rovingKeys, useToast } from "../../ui.jsx";
import { SITES, TICKETS, dayOffset, fmtDay, inScope, person } from "../data.js";
import { ApprovalsList, PersonSearch, SourceNote, TaskRow, isLate, useApprovals, useTasks } from "../bits.jsx";
import { SystemName } from "../feedback.jsx";
import { update, useCan, usePersona } from "../store.js";

function NewTask() {
  const p = usePersona();
  const toast = useToast();
  const people = inScope(p).filter((x) => x.status === "active");
  const [title, setTitle] = useState(""), [to, setTo] = useState(null), [due, setDue] = useState(3);
  const add = (e) => {
    e.preventDefault();
    if (!title.trim() || !to) return;
    const who = person(to);
    update((s) => ({ newTasks: [...s.newTasks, { id: `n${Date.now()}`, title, assignee: to, site: who.site, due: dayOffset(Number(due)), status: "todo", source: "tasks" }] }));
    toast({ title: `Task sent to ${who.name}. It would also appear in their copy of the task tool.`, tone: "good" });
    setTitle(""); setTo(null);
  };
  return (
    <form className="form-grid" onSubmit={add}>
      <label className="field"><span>Task</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="For example: check the spare parts for press line 2" /></label>
      <PersonSearch label="Give it to" people={people} value={to} onChange={setTo} />
      <label className="field"><span>Due in</span>
        <select className="input" value={due} onChange={(e) => setDue(e.target.value)}>{[1, 2, 3, 5, 7, 14].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""} ({fmtDay(dayOffset(d))})</option>)}</select>
      </label>
      <div className="actions"><button type="submit" className="button button-primary" disabled={!title.trim() || !to}>Assign task</button></div>
      <p className="muted small">The task also appears in their <SystemName id="tasks" />.</p>
    </form>
  );
}

export default function Work() {
  const p = usePersona();
  const can = useCan();
  const [filter, setFilter] = useState(p.id === "employee" ? "mine" : "scope");
  const tasks = useTasks(filter);
  const [site, setSite] = useState("all");
  const shown = tasks.filter((t) => site === "all" || t.site === site);
  const { sent, status } = useApprovals();
  const cols = [["todo", "To do"], ["doing", "In progress"], ["done", "Done"]];
  const toast = useToast();
  const requestDayOff = () => {
    const me = person(p.person);
    update((st) => ({ requests: [...st.requests, { id: `r${Date.now()}`, kind: "Leave", title: "Annual leave, next Friday", from: me.id, site: me.site,
      approver: p.id === "employee" ? "supervisor" : p.id === "supervisor" ? "site_manager" : "gm", why: "Leave up to 5 days goes to the next level up" }] }));
    toast({ title: "Request sent. It's waiting in your approver's inbox; switch \"Viewing as\" to see it there.", tone: "good" });
  };
  return (
    <>
      {["gm", "site_manager", "supervisor"].includes(p.id) && (
        <section className="panel-card span-2">
          <div className="card-head"><div><h2>Waiting for your approval</h2><p className="card-sub">Leave, events, overtime and access, from everyone in your scope. Rules decide who approves what.</p></div></div>
          <ApprovalsList />
          <SourceNote ids={["s_leave", "s_events"]} />
        </section>
      )}
      <section className="panel-card span-2">
        <div className="card-head">
          <div><h2>Tasks</h2><p className="card-sub">{shown.filter(isLate).length} overdue · {shown.filter((t) => t.status !== "done").length} open</p></div>
          <div className="card-tools">
            <div role="group" aria-label="Whose tasks" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
              <button type="button" aria-pressed={filter === "mine"} onClick={() => setFilter("mine")}>Mine</button>
              {p.id !== "employee" && <button type="button" aria-pressed={filter === "scope"} onClick={() => setFilter("scope")}>Everyone in my view</button>}
            </div>
            {p.id === "gm" && <select className="input" aria-label="Site" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="all">All sites</option>{SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}<option value="hq">Brisbane office</option></select>}
          </div>
        </div>
        <div className="board">
          {cols.map(([id, label]) => (
            <div key={id} className="board-col">
              <h3>{label} <span className="muted">{shown.filter((t) => t.status === id).length}</span></h3>
              <ul className="tasks" role="list">{shown.filter((t) => t.status === id).map((t) => <TaskRow key={t.id} t={t} />)}</ul>
            </div>
          ))}
        </div>
        <SourceNote ids={["tasks", "maintenance", "itsm", "whs"]} />
      </section>
      {can("assign") && <section className="panel-card"><h2>Hand out a task</h2><NewTask /></section>}
      <section className="panel-card">
        <h2>My requests</h2>
        {sent.length ? <ul className="queue" role="list">{sent.map((a) => <li key={a.id} className="queue-item"><p>{a.title}</p><p className="muted small">{status(a) || "Waiting"} · approver: {a.approver.replace("_", " ")}</p></li>)}</ul>
          : <p className="muted">You have no open requests. Leave, shift swaps and change requests you send show here with their status.</p>}
        {p.id !== "gm" && <button type="button" className="button" onClick={requestDayOff}>Request a day off next Friday</button>}
      </section>
      {p.id === "employee" && (
        <section className="panel-card">
          <h2>My IT tickets</h2>
          <ul className="queue" role="list">{TICKETS.map((t) => <li key={t.id} className="queue-item"><p><strong>{t.title}</strong></p><p className="muted small">{t.id} · {t.status}</p></li>)}</ul>
          <SourceNote ids={["itsm"]} />
        </section>
      )}
    </>
  );
}
