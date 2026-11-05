// Roles and permissions: what each role can do (ticked by the owner), which directory groups give which role, giving one person
// a different role, and handing your approvals to someone else for a set time.
import { Fragment, useRef, useState } from "react";
import { Link } from "react-router";
import { HoldButton, useToast } from "../../ui.jsx";
import { CAPS, DEFAULT_GRANTS, PEOPLE, PERSONAS, ROLES, SITES, dayOffset, fmtDay, inScope, person, siteName } from "../data.js";
import { FRAMEWORKS, frameworkName } from "../controls.js";
import { PersonButton, PersonSearch, SourceNote } from "../bits.jsx";
import { Assumed } from "../feedback.jsx";
import { audit, update, useCan, useDemo, usePersona } from "../store.js";
import { addable, cardById, layoutFor, move, sameLayout, titleOf } from "../layout.js";
import { DEFAULT_LAYOUTS } from "../homecards.jsx";
import { Icon } from "../../icons.jsx";

// Default Home for a role (feature 10): what someone in the role sees until they customise. People who customised keep theirs.
function DefaultHome() {
  const toast = useToast();
  const { grants, roleLayouts } = useDemo();
  const [role, setRole] = useState("supervisor");
  const current = layoutFor(role, {}, grants, roleLayouts);
  const [draft, setDraft] = useState(null);
  const [said, setSaid] = useState("");
  const list = draft || current;
  const [pick, setPick] = useState("");
  const offer = addable(role, list, grants[role] || []);
  const name = (id) => titleOf(cardById(id), role);
  const edit = (next, text) => { setDraft(next); setSaid(text); };
  // Moving a card to the top or bottom disables the button just pressed, and Remove takes its row away: put focus somewhere
  // that stays, or a keyboard user lands on the page.
  const listRef = useRef(null);
  const refocus = (row, which) => requestAnimationFrame(() => {
    const rows = listRef.current?.children;
    const li = rows?.[Math.min(row, rows.length - 1)];
    const b = li ? [...li.querySelectorAll("button")].find((x) => x.textContent === which || x.getAttribute("aria-label") === which) : null;
    (b && !b.disabled ? b : li?.querySelector("button:not(:disabled)") || listRef.current?.closest("section")?.querySelector("select"))?.focus();
  });
  const save = () => {
    const prev = roleLayouts[role];
    update((s) => ({ roleLayouts: { ...s.roleLayouts, [role]: list } }));
    audit(`set the default Home for ${roleName(role)} (${list.length} cards)`);
    toast({ title: `New default Home for ${roleName(role)}. People who customised their own keep it.`, tone: "good", action: { label: "Undo", onClick: () => {
      update((s) => { const x = { ...s.roleLayouts }; if (prev) x[role] = prev; else delete x[role]; return { roleLayouts: x }; });
      audit(`undid the default Home change for ${roleName(role)}`);
    } } });
    setDraft(null);
  };
  const restore = () => {
    update((s) => { const x = { ...s.roleLayouts }; delete x[role]; return { roleLayouts: x }; });
    audit(`put the default Home for ${roleName(role)} back to Mycelium's`);
    toast({ title: `${roleName(role)} is back to Mycelium's default Home.` });
    setDraft(null);
  };
  return (
    <section className="panel-card" aria-labelledby="dh-h">
      <div className="card-head"><div><h2 id="dh-h">Default Home for this role</h2><p className="card-sub">What people in the role see on Home until they customise it. People who customised keep theirs.</p></div></div>
      <label className="field">Role <select className="input" value={role} onChange={(e) => { setRole(e.target.value); setDraft(null); setPick(""); }}>
        {PERSONAS.map((p) => <option key={p.id} value={p.id}>{roleName(p.id)}</option>)}</select></label>
      <ol ref={listRef} className="queue home-default-list" role="list">{list.map((x, i) => (
        <li key={x.id} className="queue-item home-add-row">
          <p><span className="muted small">{i + 1}.</span> <strong>{name(x.id)}</strong>{x.size === 2 && !cardById(x.id).full ? <span className="muted small"> · wide</span> : ""}</p>
          <span className="home-tools-buttons" role="group" aria-label={`${name(x.id)}, position ${i + 1} of ${list.length}`}>
            <button type="button" className="icon-button" disabled={i === 0} aria-label="Move up" onClick={() => { edit(move(list, i, i - 1), `${name(x.id)} moved to position ${i} of ${list.length}`); refocus(i - 1, "Move up"); }}><Icon name="chevron" className="flip" /></button>
            <button type="button" className="icon-button" disabled={i === list.length - 1} aria-label="Move down" onClick={() => { edit(move(list, i, i + 1), `${name(x.id)} moved to position ${i + 2} of ${list.length}`); refocus(i + 1, "Move down"); }}><Icon name="chevron" /></button>
            <button type="button" className="button" onClick={() => { edit(list.filter((y) => y.id !== x.id), `${name(x.id)} removed`); refocus(i, "Remove"); }}>Remove</button>
          </span>
        </li>
      ))}</ol>
      {offer.length > 0 && (
        <div className="toolbar">
          <label>Add a card <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}><option value="">Choose…</option>{offer.map((c) => <option key={c.id} value={c.id}>{titleOf(c, role)}</option>)}</select></label>
          <button type="button" className="button" disabled={!pick} onClick={() => { edit([...list, { id: pick, size: cardById(pick).sizes[0] }], `${name(pick)} added at position ${list.length + 1}`); setPick(""); }}>Add</button>
        </div>
      )}
      <div className="actions">
        <button type="button" className="button button-primary" disabled={!draft || sameLayout(draft, current)} onClick={save}>Save default</button>
        {roleLayouts[role] && <button type="button" className="button" onClick={restore}>Back to Mycelium's default</button>}
      </div>
      <p className="muted small">Only cards the role's permissions allow can be added. {sameLayout(current, DEFAULT_LAYOUTS[role]) ? "This is Mycelium's built-in default." : "Changed from Mycelium's built-in default."}</p>
      <p className="sr-only" aria-live="polite">{said}</p>
    </section>
  );
}

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

// A guest auditor: the read-only Auditor role (audit evidence only, no exports) for some sites and one framework, ending by itself.
function AuditorAccess({ editable }) {
  const toast = useToast();
  const list = useDemo((s) => s.auditors);
  const [name, setName] = useState(""), [firm, setFirm] = useState(""), [site, setSite] = useState("all"), [fw, setFw] = useState(FRAMEWORKS[0].id), [days, setDays] = useState(5);
  const ok = name.trim() && firm.trim();
  const give = () => {
    const a = { id: Date.now(), name: name.trim(), firm: firm.trim(), sites: site === "all" ? null : [site], framework: fw, until: dayOffset(Number(days)).toISOString() };
    update((s) => ({ auditors: [...s.auditors, a] }));
    audit(`gave ${a.name} (${a.firm}) the ${roleName("auditor")} role for ${frameworkName(fw)} evidence, ${site === "all" ? "all sites" : siteName(site)}, until ${fmtDay(new Date(a.until))}`);
    toast({ title: `${a.name} can read the ${frameworkName(fw)} evidence until ${fmtDay(new Date(a.until))}. It ends by itself.`, tone: "good" });
    setName(""); setFirm("");
  };
  const end = (a) => {
    update((s) => ({ auditors: s.auditors.filter((x) => x.id !== a.id) }));
    audit(`ended ${a.name}'s auditor access`);
    toast({ title: `${a.name}'s access has ended. Logged.` });
  };
  return (
    <section className="panel-card">
      <h2>Give an auditor read-only access</h2>
      <p className="muted small">For a visiting auditor: the {roleName("auditor")} role, which sees the audit evidence for the sites and framework you pick, can't export or change anything, and ends by itself.</p>
      {editable ? (
        <div className="form-grid">
          <label className="field">Name <input className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field">Firm <input className="input" value={firm} maxLength={60} placeholder="Certification body" onChange={(e) => setFirm(e.target.value)} /></label>
          <div className="toolbar">
            <label>Sites <select className="input" value={site} onChange={(e) => setSite(e.target.value)}><option value="all">All sites</option>{SITES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label>Framework <select className="input" value={fw} onChange={(e) => setFw(e.target.value)}>{FRAMEWORKS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
            <label>For <select className="input" value={days} onChange={(e) => setDays(e.target.value)}>{[1, 3, 5, 10].map((d) => <option key={d} value={d}>{d} day{d === 1 ? "" : "s"}</option>)}</select></label>
            <button type="button" className="button button-primary" disabled={!ok} onClick={give}>Give access</button>
          </div>
        </div>
      ) : <p className="muted small">Only the GM and IT can give guest access.</p>}
      {list.length > 0 && <ul className="queue" role="list">{list.map((a) => {
        const live = new Date(a.until) > new Date();
        return (
          <li key={a.id} className={`queue-item ${live ? "" : "is-done"}`}>
            <p><strong>{a.name}</strong>, {a.firm}: {frameworkName(a.framework)} evidence, {a.sites ? a.sites.map(siteName).join(", ") : "all sites"}</p>
            <p className="muted small">{live ? `Until ${fmtDay(new Date(a.until))}, then it ends by itself.` : `Ended ${fmtDay(new Date(a.until))}.`} Read-only; every page they open is logged.</p>
            {live && editable && <HoldButton className="button-danger" onConfirm={() => end(a)}>Hold to end access</HoldButton>}
          </li>
        );
      })}</ul>}
    </section>
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
  const can = useCan();
  const { grants } = useDemo();
  const editable = p.id === "gm" || p.id === "it";
  const set = (r, cap, on) => {
    update((s) => ({ grants: { ...s.grants, [r]: on ? [...s.grants[r], cap] : s.grants[r].filter((c) => c !== cap) } }));
    audit(`${on ? "gave" : "took"} "${CAPS.find((c) => c.id === cap).label}" ${on ? "to" : "from"} ${roleName(r)}`);
  };
  const reset = () => {
    const before = grants;
    update(() => ({ grants: DEFAULT_GRANTS }));
    audit("put every role's permissions back to the defaults");
    toast({ title: "Back to the default roles.", action: { label: "Undo", onClick: () => { update(() => ({ grants: before })); audit("undid the reset of role permissions"); } } });
  };
  const groups = [...new Set(CAPS.map((c) => c.group))];
  return (
    <>
      <GiveRole editable={editable} />
      <section className="panel-card span-2">
        <div className="card-head">
          <div><h2>What each role can do</h2><p className="card-sub">Each role also has a scope: it only applies to the people and sites in its reach.</p></div>
          {editable && <button type="button" className="button" onClick={reset}>Reset to defaults</button>}
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
      <AuditorAccess editable={editable} />
      {can("layouts") && <DefaultHome />}
      <AuditTrail />
      <section className="panel-card">
        <h2>Who decides what</h2>
        <p className="muted small">Our guesses at your structure, used for the roles above:</p>
        <ul className="sys-list" role="list">{["s_levels", "s_leave", "s_events", "s_it", "s_security"].map((id) => <li key={id}><Assumed id={id} /></li>)}</ul>
      </section>
    </>
  );
}
