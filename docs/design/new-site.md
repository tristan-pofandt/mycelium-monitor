# Build a new Mycelium site

Follow these steps and the new site will look, move and resize exactly like Mycelium Ops and Mycelium Monitor. Only the features change.

## 1. Stack (use these exact versions)

React 18.3.1, react-dom 18.3.1, react-router 7.18.5, framer-motion 11.18.2, @fontsource-variable/inter 5.3.0, Vite 5.4.21 with @vitejs/plugin-react 4.3.4. Tests: vitest 2, jsdom 25, @testing-library/react 16. No UI kit, no CSS framework, no icon library.

## 2. Copy the kit

The kit is the set of files below. **Copy them unchanged** from `mycelium-ops/web/src/` (the reference). If you change a kit file, copy the change into every Mycelium repo.

| File | What it gives you |
|---|---|
| `tokens.css` | Every colour, corner, shadow and the two themes |
| `app.css` | Styles for every kit part and the header, grid and breakpoints |
| `choreography.js` | The curve, the time words, `fx`, springs |
| `reduced.js` | Is reduced motion on? |
| `motion/fm.js` | Bookkeeping for running animations |
| `motion/pages.js` | Page entrance, tab pill, theme circle |
| `Page.jsx` | The page wrapper: grid, title, entrance |
| `shell.jsx` | `ThemeToggle`, `usePill`, `useMoreTabs` |
| `ui.jsx` | `Tip`, toasts, `Switch`, `HoldButton`, `EmptyState`, `Skeleton`, `Picker`, `rovingKeys`, `useRowHighlight` |
| `charts.jsx` | `CountUp`, `Countable`, `Stat`, `Delta`, `KpiTile`, `Bars`, `Gauge`, `Heatmap`, `Table`, `DataTable` |
| `tasks.jsx` | `useTask`, `TaskChip` |
| `customise.jsx` | `useCustomise`: the drag-to-rearrange dashboard, plus `moveItem` and `sameLayout` |
| `icons.jsx` | `Icon`, `Logo` |
| `theme.js` | Light and dark, remembered in this browser |
| `test-setup.js` | Test setup (jsdom has no `matchMedia`) |
| `ui.test.jsx`, `charts.test.jsx`, `customise.test.jsx`, `motion/pages.test.js` | Tests for the kit |

Also copy `web/public/` (icons and `sw.js`, the service worker that caches the app shell only) and write a `manifest.webmanifest` with the product's name, `background_color` and `theme_color` `#08090d`, and the same icons.

## 3. `index.html` head

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="color-scheme" content="dark light" />
<meta name="theme-color" content="#08090d" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#f1f2f6" media="(prefers-color-scheme: light)" />
<meta name="apple-mobile-web-app-title" content="Mycelium Commerce" />
<meta name="mobile-web-app-capable" content="yes" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
<title>Mycelium Commerce</title>
```

## 4. `main.jsx`

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import { ToastProvider } from "./ui.jsx";
import { applySavedTheme } from "./theme.js";
import "@fontsource-variable/inter";
import "./tokens.css";
import "./app.css";

applySavedTheme(); // before the first paint, so a saved theme never flashes
if (import.meta.env.PROD && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
createRoot(document.getElementById("root")).render(
  <StrictMode><BrowserRouter><ToastProvider><App /></ToastProvider></BrowserRouter></StrictMode>,
);
```

## 5. The shell (`App.jsx`)

Pages live in one list. Tabs, tools and hidden pages all come from it. This is the whole frame; add features as pages.

```jsx
import { useEffect, useRef } from "react";
import { NavLink, Route, Routes, useLocation, useParams } from "react-router";
import { Icon, Logo } from "./icons.jsx";
import { Picker, rovingKeys } from "./ui.jsx";
import { ThemeToggle, useMoreTabs, usePill } from "./shell.jsx";
import Page from "./Page.jsx";
import Home from "./pages/Home.jsx";
import Orders from "./pages/Orders.jsx";
import Settings from "./pages/Settings.jsx";

// tool: a labelled button on the right of the header (joins the tab row under 960px); hidden: no tab at all
const PAGES = [
  { id: "", title: "Home", short: "Home", icon: "overview", component: Home },
  { id: "orders", title: "Orders", short: "Orders", icon: "ledger", component: Orders },
  { id: "settings", title: "Settings", short: "Settings", icon: "settings", component: Settings, tool: true },
];

function Shell() {
  const { page: id = "" } = useParams();
  const location = useLocation();
  const rowRef = useRef(null), pillRef = useRef(null);
  usePill(rowRef, pillRef, id);
  const nav = PAGES.filter((p) => !p.tool && !p.hidden);
  const tools = PAGES.filter((p) => p.tool);
  const more = useMoreTabs(rowRef, [nav.length, tools.length]);
  const page = PAGES.find((p) => p.id === id) || { title: "Page not found", component: () => <p className="notice">There's no page here.</p> };
  useEffect(() => { document.querySelector(".pill.active")?.scrollIntoView?.({ block: "nearest", inline: "center" }); }, [id]);
  useEffect(() => { document.title = `${page.title} · Mycelium Commerce`; }, [page.title]);
  const Body = page.component;
  const pill = (p, cls) => (
    <li key={p.id} className={cls}><NavLink to={`/${p.id}`} end className="pill"><Icon name={p.icon} /><span>{p.short}</span></NavLink></li>
  );
  return (
    <div className="shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="topbar">
        <div className="topbar-start">
          <NavLink to="/" className="brand" aria-label="Mycelium Commerce, home"><Logo /><span>Mycelium</span></NavLink>
          <Picker label="Store" icon="user" value="main" onChange={() => {}} options={[{ value: "main", label: "Main store" }]} />
        </div>
        <nav className="pills" aria-label="Pages">
          <ul role="list" ref={rowRef} className={more ? "has-more" : undefined} onKeyDown={(e) => rovingKeys(e, "a.pill")}>
            <li className="pill-indicator" ref={pillRef} role="presentation" aria-hidden="true" />
            {nav.map((p) => pill(p))}
            {tools.map((p) => pill(p, "pill-tool"))}
          </ul>
        </nav>
        <div className="topbar-end">
          <ThemeToggle />
          {tools.map((p) => <NavLink key={p.id} to={`/${p.id}`} className="button tool-link"><Icon name={p.icon} /><span>{p.short}</span></NavLink>)}
        </div>
      </header>
      <main className="content" id="main" tabIndex={-1}>
        <Page key={location.pathname} title={page.id === "" ? null : page.title} scope="Main store">
          <Body />
        </Page>
      </main>
    </div>
  );
}

export default function App() {
  return <Routes><Route path="/" element={<Shell />} /><Route path="/:page" element={<Shell />} /></Routes>;
}
```

## 6. A home page

A page returns cards and nothing else. It does not animate itself. It does not set its own outer layout. A home or overview page is always customisable: its cards go through `useCustomise` (see `parts.md`). Other pages just return their cards.

```jsx
import { useState } from "react";
import { Bars, KpiTile } from "../charts.jsx";
import { Icon } from "../icons.jsx";
import { useToast } from "../ui.jsx";
import { useCustomise } from "../customise.jsx";

const KEY = "mycelium-commerce-home"; // where this browser keeps the layout
const DEFAULT = [{ id: "kpis", size: 2 }, { id: "sales", size: 2 }];
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || DEFAULT; } catch { return DEFAULT; } };
const keep = (l) => { try { if (l) localStorage.setItem(KEY, JSON.stringify(l)); else localStorage.removeItem(KEY); } catch { /* private window */ } };

export default function Home() {
  const [layout, setLayout] = useState(load);
  const toast = useToast();
  const save = (next) => { keep(next); setLayout(next || DEFAULT); };
  const rows = [{ label: "9 AM", values: { sales: 12 } }, { label: "10 AM", values: { sales: 19 } }]; // from your data
  const cards = [
    { id: "kpis", title: "Key figures", sizes: [2], full: true, render: () => (
      <dl className="kpis" aria-label="Today">
        <KpiTile icon="requests" label="Orders today" value={128} to="/orders" linkLabel="Open orders" />
        {/* three more tiles */}
      </dl>
    ) },
    { id: "sales", title: "Sales", sizes: [2], render: () => (
      <section className="card">
        <div className="card-head"><div><h2>Sales</h2><p className="card-sub">Last 24 hours</p></div></div>
        <Bars title="Sales" hideTitle rows={rows} series={[{ key: "sales", label: "Sales", color: "var(--accent)" }]} />
      </section>
    ) },
  ];
  const board = useCustomise({
    layout, cards,
    onSave(next) { const prev = layout; save(next); toast({ title: "Home saved.", tone: "good", action: { label: "Undo", onClick: () => save(prev) } }); },
    onReset() { const prev = layout; save(null); toast({ title: "Home is back to the default.", action: { label: "Undo", onClick: () => save(prev) } }); },
  });
  return (
    <>
      <div className="greeting">
        <h1><span className="rise-mask"><span className="rise">Good morning</span></span></h1>
        <p className="state-line state-ok"><span className="badge badge-ok"><Icon name="up" />Open</span><span>All stores open. Last order 3 min ago.</span>{board.bar}</p>
      </div>
      {board.slots}
      {board.extras}
    </>
  );
}
```

## 7. Feature styles

Put a feature's own CSS in its own file next to it and import it from the feature. Use only tokens. Build bigger pieces from the patterns in `parts.md`.

## 8. Check before you call it done

- Build passes and kit tests pass.
- Look at every page at 1920, 1600, 1440, 1280, 1024, 960, 900, 760 and 390px, in light and dark. No sideways scroll. No control loses its label. No card stops at one third of the row on its own.
- Use the whole site with the keyboard only.
- Turn on reduced motion and open a few pages.
- Compare one page side by side with Mycelium Ops at the same width. Spacing, sizes and motion should match.
