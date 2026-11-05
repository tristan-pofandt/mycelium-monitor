// Header pieces every Mycelium site shares: the theme button and the tab row. Kit file: keep identical in every Mycelium repo
// (docs/design/new-site.md).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router";
import { Icon } from "./icons.jsx";
import { useTheme } from "./theme.js";
import { edgesOf, movePill } from "./motion/pages.js";
import { Tip, rovingKeys } from "./ui.jsx";

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Tip label={`Switch to ${next} theme`} describe={false} side="bottom">
      <button type="button" className="icon-button" onClick={(e) => toggle(e.currentTarget)} aria-label={`Switch to ${next} theme`}>
        <Icon name={theme === "dark" ? "sun" : "moon"} />
      </button>
    </Tip>
  );
}

// Which tabs fit. Pure, so it can be tested: widths of the shown tabs, the gap between them, the room in the row and the More
// button's width. Tabs fit from the left; the active tab always stays in the row (it takes the last place that fits).
export function fitTabs(widths, gap, room, moreWidth, active) {
  const all = widths.reduce((a, w) => a + w, 0) + gap * Math.max(0, widths.length - 1);
  if (all <= room) return [];
  let used = moreWidth, n = 0;
  while (n < widths.length && used + widths[n] + gap <= room) used += widths[n++] + gap;
  if (active >= n && active < widths.length) { // make room for the active tab by dropping tabs from the right
    while (n > 0 && used + widths[active] + gap > room) { n--; used -= widths[n] + gap; }
  }
  const keep = new Set([...Array(n).keys(), active]);
  return widths.map((_, i) => i).filter((i) => !keep.has(i));
}

// The tab row: icon-and-word tabs on a pill bar, one accent pill that stretches to the active tab (motion/pages.js), arrow keys
// between tabs, and a "More" button holding the tabs that don't fit, so nothing is ever cut off or hidden behind a fade.
// tabs: [{ to, icon, label, end?, tool? }]; tool tabs only show in the row below 960px (app.css). `navKey` changes on every
// navigation that can change the active tab.
export function TabRow({ tabs, navKey, label = "Pages" }) {
  const navRef = useRef(null), rowRef = useRef(null), pillRef = useRef(null), moreRef = useRef(null), last = useRef(null);
  const [over, setOver] = useState([]);
  const [open, setOpen] = useState(false);

  const place = (animate) => {
    const row = rowRef.current, pill = pillRef.current;
    const tab = [...(row?.querySelectorAll(".pill.active") || [])].map((a) => a.parentElement).find((li) => li.offsetWidth); // the <li>: its offsets are in the row
    if (!row || !pill) return;
    if (!tab) { pill.style.visibility = "hidden"; last.current = null; return; } // a page outside the row: no highlight
    pill.style.visibility = "";
    pill.style.width = `${row.scrollWidth}px`;
    const to = edgesOf(row, tab);
    movePill(pill, animate ? last.current : null, to);
    last.current = to;
  };
  // Measure every tab at full size, then hide the ones that don't fit (written straight to the DOM, before paint).
  const fit = () => {
    const nav = navRef.current, row = rowRef.current;
    if (!nav || !row) return;
    const lis = [...row.querySelectorAll(":scope > li[data-tab]")], more = row.querySelector(":scope > .pill-more");
    [...lis, more].forEach((li) => li.removeAttribute("data-over"));
    const shown = lis.filter((li) => getComputedStyle(li).display !== "none");
    const cs = getComputedStyle(row);
    const room = nav.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2; // 2: the row's border
    const active = shown.findIndex((li) => li.querySelector(".pill.active"));
    const hide = fitTabs(shown.map((li) => li.offsetWidth), parseFloat(cs.columnGap) || 0, room, more.offsetWidth, active).map((i) => shown[i]);
    hide.forEach((li) => li.setAttribute("data-over", ""));
    if (!hide.length) more.setAttribute("data-over", "");
    setOver(hide.map((li) => Number(li.dataset.tab)));
  };

  useLayoutEffect(() => { fit(); place(true); setOpen(false); }, [navKey, tabs.length]);
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => { fit(); place(false); });
    ro.observe(navRef.current);
    document.fonts?.ready.then(() => { fit(); place(false); });
    return () => ro.disconnect();
  }, [tabs.length]);

  return (
    <nav className="pills" aria-label={label} ref={navRef}>
      <ul role="list" ref={rowRef} onKeyDown={(e) => rovingKeys(e, ".pill")}>
        <li className="pill-indicator" ref={pillRef} role="presentation" aria-hidden="true" />
        {tabs.map((t, i) => (
          <li key={t.to} data-tab={i} className={t.tool ? "pill-tool" : undefined}>
            <NavLink to={t.to} end={t.end} className="pill"><Icon name={t.icon} /><span>{t.label}</span></NavLink>
          </li>
        ))}
        <li className="pill-more">
          <button type="button" ref={moreRef} className="pill" aria-haspopup="true" aria-expanded={open}
            onClick={() => setOpen((o) => !o)} onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); } }}>
            <span>More</span><Icon name="chevron" />
          </button>
        </li>
      </ul>
      {open && <MoreMenu items={over.map((i) => tabs[i])} anchor={moreRef} onClose={(refocus) => { setOpen(false); if (refocus) moreRef.current?.focus(); }} />}
    </nav>
  );
}

// The tabs that didn't fit, in a list under the More button. Up and Down move, Escape closes, a click outside closes.
function MoreMenu({ items, anchor, onClose }) {
  const ref = useRef(null);
  const r = anchor.current.getBoundingClientRect();
  useEffect(() => {
    ref.current?.querySelector("a")?.focus();
    const away = (e) => { if (!ref.current?.contains(e.target) && !anchor.current?.contains(e.target)) onClose(false); };
    addEventListener("pointerdown", away);
    return () => removeEventListener("pointerdown", away);
  }, []);
  const keys = (e) => {
    const links = [...ref.current.querySelectorAll("a")], i = links.indexOf(document.activeElement);
    if (e.key === "Escape" || e.key === "Tab") { if (e.key === "Escape") e.preventDefault(); onClose(e.key === "Escape"); return; }
    const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: links.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    links[(to + links.length) % links.length]?.focus();
  };
  return createPortal(
    <ul ref={ref} role="list" className="popover tab-menu" onKeyDown={keys} style={{ top: r.bottom + 8, right: Math.max(8, innerWidth - r.right) }}>
      {items.map((t) => (
        <li key={t.to}><NavLink to={t.to} end={t.end} onClick={() => onClose(false)}><Icon name={t.icon} /><span>{t.label}</span></NavLink></li>
      ))}
    </ul>,
    document.body,
  );
}
