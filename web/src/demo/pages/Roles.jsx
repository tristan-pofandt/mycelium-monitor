// Roles and permissions: what each role can do (ticked by the owner), which directory groups give which role, giving one person
// a different role, and handing your approvals to someone else for a set time.
import { Fragment, useState } from "react";
import { Link } from "react-router";
import { useToast } from "../../ui.jsx";
import { CAPS, DEFAULT_GRANTS, PEOPLE, ROLES, dayOffset, fmtDay, inScope, person, siteName } from "../data.js";
import { PersonButton, PersonSearch, SourceNote } from "../bits.jsx";
import { Assumed } from "../feedback.jsx";
import { audit, update, useDemo, usePersona } from "../store.js";

const GROUPS = [["SG-QLD-Ops-Leadership", "gm"], ["SG-QLD-SiteManagers", "site_manager"], ["SG-QLD-Supervisors", "supervisor"], ["SG-QLD-Security", "security"],
  ["SG-QLD-HR", "hr"], ["SG-IT-Admins", "it"], ["All QLD staff", "employee"]];
const roleName = (id) => ROLES.find((r) => r.id === id)?.name || id;

function Delegation() {
  const p = usePersona();
  const me = person(p.person);
  const toast = useToast();
  const list = useDemo((s) => s.delegations);
  const people = inScope(p).filter((x) => x.status === "active" && x.id !== me.id);
  const [to, setTo] = useState(null), [what, setWhat] = useState("All my approvals"), [days, setDays] = useState(7);
  const add = () => {
    update((s) => ({ delegations: [...s.delegations, { id: Date.now(), from: me.id, to, what, until: dayOffset(Number(days)).toISOString() }] }));
    audit(`gave ${person(to).name} ${what.toLowerCase()} for ${days} days`);
    toast({ title: `${person(to).name} can act for you until ${fmtDay(dayOffset(Number(days)))}. It ends by itself.`, tone: "good" });
    setTo(null);
  };
  return (
    <>
      <div className="form-grid">
        <PersonSearch label="Hand over to" people={people} value={to} onChange={setTo} />
        <div className="toolbar">
          <label>What <select className="input" value={what} onChange={(e) => setWhat(e.target.value)}>{["All my approvals", "Leave approvals", "Event approvals", "Access requests"].map((w) => <option key={w}>{w}</option>)}</select></label>
          <label>For <select className="input" value={days} onChange={(e) => setDays(e.target.value)}>{[1, 3, 7, 14, 28].map((d) => <option key={d} value={d}>{d} days</option>)}</select></label>
          <button type="button" className="button button-primary" disabled={!to} onClick={add}>Delegate</button>
        </div>
      </div>
      {list.length > 0 && <ul className="queue" role="list">{list.map((d) => (
        <li key={d.id} className="queue-item">
          <p><strong>{person(d.to).name}</strong> has {d.what.toLowerCase()} from {person(d.from).name}</p>
          <p className="muted small">Until {fmtDay(new Date(d.until))}, then it ends by itself. Every action they take is logged as "on behalf of".</p>
          <button type="button" className="link small" onClick={() => { update((s) => ({ delegations: s.delegations.filter((x) => x.id !== d.id) })); audit(`ended ${person(d.to).name}'s delegation`); }}>End now</button>
        </li>
      ))}</ul>}
    </>
  );
}

// Find anyone by name, job or site and give them a role. Changes are listed underneath (and would be audited).
function GiveRole({ editable }) {
  const toast = useToast();
  const roleOf = useDemo((s) => s.roleOf);
  const [who, setWho] = useState(null), [role, setRole] = useState("supervisor");
  const chosen = who && person(who);
  const changed = Object.entries(roleOf);
  const give = () => {
    update((s) => ({ roleOf: { ...s.roleOf, [who]: roleName(role) } }));
    audit(`gave ${chosen.name} the role ${roleName(role)}`);
    toast({ title: `${chosen.name} is now ${roleName(role)}. Logged in the audit trail.`, tone: "good" });
    setWho(null);
  };
  return (
    <section className="panel-card span-2">
      <div className="card-head"><div><h2>Give someone a role</h2><p className="card-sub">Search for a person, pick a role, done. Their pages and data change straight away.</p></div></div>
      <div className="give-role">
        <PersonSearch label="Person" people={PEOPLE.filter((x) => x.status === "active")} value={who} onChange={setWho} />
        {chosen && (
          <div className="form-grid">
            <p className="muted small">Now: <strong>{roleOf[who] || roleName(chosen.role)}</strong>, {ROLES.find((r) => r.id === chosen.role)?.scope.toLowerCase()}. Reports to {person(chosen.manager)?.name || "Group"}.</p>
            <div className="toolbar">
              <label>New role <select className="input" value={role} onChange={(e) => setRole(e.target.value)} disabled={!editable}>{ROLES.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.scope.toLowerCase()})</option>)}</select></label>
              <button type="button" className="button button-primary" disabled={!editable} onClick={give}>Give role</button>
            </div>
            {!editable && <p className="muted small">Only the GM and IT can change roles.</p>}
          </div>
        )}
      </div>
      {changed.length > 0 && (
        <>
          <h3 className="small-head">Changed in this demo</h3>
          <ul className="queue" role="list">{changed.map(([id, r]) => (
            <li key={id} className="queue-item">
              <p><PersonButton id={id} /> is now <strong>{r}</strong> <span className="muted small">{person(id).title} · {siteName(person(id).site)}</span></p>
              <button type="button" className="link small" onClick={() => { update((s) => { const x = { ...s.roleOf }; delete x[id]; return { roleOf: x }; }); audit(`undid ${person(id).name}'s role change`); }}>Undo</button>
            </li>
          ))}</ul>
        </>
      )}
    </section>
  );
}

// Every change made in this demo, as a real deployment would log it (tamper-evident, exportable for audits).
function AuditTrail() {
  const log = useDemo((s) => s.audit);
  return (
    <section className="panel-card">
      <h2>Audit trail</h2>
      <p className="muted small">Every role change, delegation, approval and security action is recorded with who did it and when. In a real deployment the log can't be edited and can be exported for an audit. <Link to="/about#it">How this would run in your environment</Link></p>
      {log.length ? <ul className="queue" role="list">{log.slice(0, 8).map((e, i) => <li key={i} className="queue-item"><p><strong>{e.who}</strong> {e.what}</p><p className="muted small">{e.at}</p></li>)}</ul>
        : <p className="muted">Nothing yet. Give someone a role or approve a request and it appears here.</p>}
    </section>
  );
}

export default function Roles() {
  const p = usePersona();
  const toast = useToast();
  const { grants } = useDemo();
  const editable = p.id === "gm" || p.id === "it";
  const set = (r, cap, on) => update((s) => ({ grants: { ...s.grants, [r]: on ? [...s.grants[r], cap] : s.grants[r].filter((c) => c !== cap) } }));
  const groups = [...new Set(CAPS.map((c) => c.group))];
  return (
    <>
      <GiveRole editable={editable} />
      <section className="panel-card span-2">
        <div className="card-head">
          <div><h2>What each role can do</h2><p className="card-sub">Each role also has a scope: it only applies to the people and sites in its reach.</p></div>
          {editable && <button type="button" className="button" onClick={() => { update(() => ({ grants: DEFAULT_GRANTS })); toast({ title: "Back to the default roles." }); }}>Reset to defaults</button>}
        </div>
        <div className="table-wrap">
          <table className="table matrix">
            <caption className="sr-only">Permissions by role</caption>
            <thead><tr><th scope="col">Permission</th>{ROLES.map((r) => <th key={r.id} scope="col">{r.name}<span className="muted small block">{r.scope}</span></th>)}</tr></thead>
            <tbody>{groups.map((g) => (
              <Fragment key={g}>
                <tr className="matrix-group"><th scope="rowgroup" colSpan={ROLES.length + 1}>{g}</th></tr>
                {CAPS.filter((c) => c.group === g).map((c) => (
                  <tr key={c.id}>
                    <th scope="row">{c.label}</th>
                    {ROLES.map((r) => {
                      const on = (grants[r.id] || []).includes(c.id);
                      return (
                        <td key={r.id}>
                          <label className="cell-check">
                            <input type="checkbox" checked={on} disabled={!editable} onChange={(e) => set(r.id, c.id, e.target.checked)} />
                            <span className="sr-only">{c.label} for {r.name}</span>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}</tbody>
          </table>
        </div>
        <p className="muted small">{editable ? "Untick a box, then use \"Viewing as\" at the top to see the change." : "Only the GM and IT can change these."} Pages appear or disappear for each role to match.</p>
      </section>
      <section className="panel-card">
        <h2>Roles from your directory</h2>
        <p className="muted small">People get their role from the groups they're already in, so joiners and leavers update by themselves.</p>
        <ul className="queue" role="list">{GROUPS.map(([g, r]) => <li key={g} className="queue-item"><p><span className="mono">{g}</span> → {roleName(r)}</p></li>)}</ul>
        <SourceNote ids={["sso"]} />
      </section>
      <section className="panel-card">
        <h2>Hand over your approvals</h2>
        <p className="muted small">Going on leave? Give someone your approvals for a set time.</p>
        <Delegation />
      </section>
      <AuditTrail />
      <section className="panel-card">
        <h2>Who decides what</h2>
        <p className="muted small">Our guesses at your structure, used for the roles above:</p>
        <ul className="sys-list" role="list">{["s_levels", "s_leave", "s_events", "s_it", "s_security"].map((id) => <li key={id}><Assumed id={id} /></li>)}</ul>
      </section>
    </>
  );
}
