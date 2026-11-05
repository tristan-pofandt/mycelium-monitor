// The demo shell: Mycelium's header and pill nav, a "Viewing as" switcher that shows the same app as six different people,
// a banner saying everything is fictional, and the feedback box under every page.
import { useEffect, useRef } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useParams } from "react-router";
import { Icon, Logo } from "../icons.jsx";
import { Picker, rovingKeys } from "../ui.jsx";
import { ThemeToggle, usePill } from "../App.jsx";
import Page from "../Page.jsx";
import { COMPANY, PERSONAS } from "./data.js";
import { ASSUMPTIONS } from "./assumptions.js";
import { FeedbackBox, FeedbackDialog, SourcesScope, loadAnswers, openFeedback } from "./feedback.jsx";
import { update, useDemo, usePersona } from "./store.js";
import Home from "./pages/Home.jsx";
import Sites from "./pages/Sites.jsx";
import People from "./pages/People.jsx";
import Work from "./pages/Work.jsx";
import Calendar from "./pages/Calendar.jsx";
import Security from "./pages/Security.jsx";
import Assistant from "./pages/Assistant.jsx";
import Roles from "./pages/Roles.jsx";
import Setup from "./pages/Setup.jsx";
import Systems from "./pages/Systems.jsx";
import About from "./pages/About.jsx";
import Rosters from "./pages/Rosters.jsx";
import Documents from "./pages/Documents.jsx";
import Audit from "./pages/Audit.jsx";
import Emergency from "./pages/Emergency.jsx";
import MyData from "./pages/MyData.jsx";

// cap: the permission (or any of several) a persona needs to see the page (Roles and permissions); pages without one are for everyone.
export const PAGES = [
  { id: "", title: "Home", short: "Home", icon: "overview", component: Home },
  { id: "sites", title: "Sites", short: "Sites", icon: "status", cap: "sites", component: Sites },
  { id: "people", title: "People", short: "People", icon: "map", cap: "people", component: People },
  { id: "work", title: "Work and approvals", short: "Work", icon: "check", component: Work },
  { id: "rosters", title: "Rosters", short: "Rosters", icon: "roster", cap: "roster", component: Rosters },
  { id: "calendar", title: "Calendar", short: "Calendar", icon: "clock", component: Calendar },
  { id: "security", title: "Security", short: "Security", icon: "access", cap: ["security", "devices"], component: Security },
  { id: "documents", title: "Documents and tax", short: "Documents", icon: "doc", cap: "finance", component: Documents },
  { id: "assistant", title: "Assistant", short: "Assistant", icon: "spark", cap: "assistant", component: Assistant },
  { id: "roles", title: "Roles and permissions", short: "Roles", icon: "users", cap: "roles", component: Roles, tool: true },
  { id: "setup", title: "Setup wizard", short: "Setup", icon: "checklist", cap: "roles", component: Setup, tool: true },
  { id: "audit", title: "Audit evidence", short: "Audit", icon: "evidence", cap: "audit", component: Audit, tool: true },
  { id: "emergency", title: "Roll call", icon: "siren", cap: "emergency", component: Emergency, hidden: true },
  { id: "my-data", title: "What we hold about you", icon: "user", component: MyData, hidden: true },
  { id: "systems", title: "Your systems", component: Systems, hidden: true },
  { id: "about", title: "About this demo", component: About, hidden: true },
];
export const canSee = (page, persona, grants) => !page.cap || [page.cap].flat().some((c) => (grants[persona] || []).includes(c));

// "Your systems 3/40": in the header on wide screens, in the banner on phones (where the header has no room for labels).
function SystemsLink({ answered, className }) {
  return (
    <NavLink to="/systems" className={className} aria-label={`Your systems: ${answered} of ${ASSUMPTIONS.length} answered`}>
      <span>Your systems</span><span className="count">{answered}/{ASSUMPTIONS.length}</span>
    </NavLink>
  );
}

function NotInView({ page, persona }) {
  const grants = useDemo((s) => s.grants);
  const allowed = PERSONAS.filter((p) => canSee(page, p.id, grants));
  return (
    <section className="panel-card notice-card">
      <h2>{persona.label} doesn't see {page.title}</h2>
      <p className="muted">That's the point of roles: the same app, showing each person only what their job needs. In this demo {page.title} is part of the
        view for {allowed.map((p) => p.label).join(", ") || "nobody right now"}. The owner can change that in Roles and permissions.</p>
      <div className="actions">
        {allowed.slice(0, 2).map((p) => <button key={p.id} type="button" className="button" onClick={() => update(() => ({ viewer: p.id }))}>View as {p.label}</button>)}
      </div>
    </section>
  );
}

function Shell() {
  const { page: id = "" } = useParams();
  const location = useLocation();
  const persona = usePersona();
  const { answers, grants } = useDemo();
  const rowRef = useRef(null), pillRef = useRef(null);
  usePill(rowRef, pillRef, `${persona.id}/${id}`);
  useEffect(() => { loadAnswers(); }, []);
  useEffect(() => { document.querySelector(".pill.active")?.scrollIntoView?.({ block: "nearest", inline: "center" }); }, [id]);
  const page = PAGES.find((p) => p.id === id) || { id, title: "Page not found", component: () => <p className="notice">There's no page here.</p> };
  const nav = PAGES.filter((p) => !p.tool && !p.hidden && canSee(p, persona.id, grants));
  const tools = PAGES.filter((p) => p.tool && canSee(p, persona.id, grants));
  const answered = ASSUMPTIONS.filter((a) => answers[a.id]).length;
  const Body = page.component;
  const visible = canSee(page, persona.id, grants);
  useEffect(() => { document.title = `${page.title} · Mycelium demo`; }, [page.title]);
  return (
    <div className="shell demo">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="topbar">
        <div className="topbar-start">
          <NavLink to="/" className="brand" aria-label="Mycelium demo, home"><Logo /><span>Mycelium</span></NavLink>
          <Picker label="Viewing as" icon="user" value={persona.id} onChange={(v) => update(() => ({ viewer: v }))}
            options={PERSONAS.map((p) => ({ value: p.id, label: p.label }))} />
        </div>
        <nav className="pills" aria-label="Pages">
          <ul role="list" ref={rowRef} onKeyDown={(e) => rovingKeys(e, "a.pill")}>
            <li className="pill-indicator" ref={pillRef} role="presentation" aria-hidden="true" />
            {nav.map((p) => (
              <li key={p.id}><NavLink to={`/${p.id}`} end className="pill"><Icon name={p.icon} /><span>{p.short}</span></NavLink></li>
            ))}
            {tools.map((p) => ( /* on phones the header has no room for these, so they join the end of the tab row */
              <li key={p.id} className="pill-tool"><NavLink to={`/${p.id}`} end className="pill"><Icon name={p.icon} /><span>{p.short}</span></NavLink></li>
            ))}
          </ul>
        </nav>
        <div className="topbar-end">
          <SystemsLink answered={answered} className="button systems-button" />
          <button type="button" className="button feedback-button" onClick={() => openFeedback(null)}><Icon name="message" /><span>Feedback</span></button>
          <ThemeToggle />
          {tools.map((p) => (
            <NavLink key={p.id} to={`/${p.id}`} className="button tool-link"><Icon name={p.icon} /><span>{p.short}</span></NavLink>
          ))}
        </div>
      </header>
      <div className="demo-banner">
        <p><strong>Demo:</strong> {COMPANY.name} is made up, and so is every number.<span className="banner-long"> Dashed <span className="assumed-tag">Our guess</span> tags
          mark what we guessed about your systems.</span></p>
        <div className="banner-actions">
          <NavLink to="/about" className="button banner-guide">How it works</NavLink>
          <SystemsLink answered={answered} className="button banner-only" />
          <button type="button" className="button banner-only" onClick={() => openFeedback(null)}><Icon name="message" /><span>Feedback</span></button>
        </div>
      </div>
      <main className="content" id="main" tabIndex={-1}>
        <Page key={`${location.pathname}|${persona.id}`} title={page.id === "" ? null : page.title} scope={persona.label.replace(" (you)", "")}>
          <SourcesScope key={location.search}>{visible ? <Body /> : <NotInView page={page} persona={persona} />}</SourcesScope>
          <FeedbackBox where={page.title} />
        </Page>
      </main>
      <FeedbackDialog page={page.title} />
    </div>
  );
}

export default function DemoApp() {
  return (
    <Routes>
      <Route path="/" element={<Shell />} />
      <Route path="/devices" element={<Navigate to="/security?tab=cyber" replace />} />
      <Route path="/:page" element={<Shell />} />
    </Routes>
  );
}
