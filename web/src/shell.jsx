// Header pieces every Mycelium site shares: the theme button and the sliding tab pill. Kit file: keep identical in every
// Mycelium repo (docs/design/new-site.md).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "./icons.jsx";
import { useTheme } from "./theme.js";
import { edgesOf, movePill } from "./motion/pages.js";
import { Tip } from "./ui.jsx";

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

// One accent pill behind the tabs that stretches to the active tab: leading edge first, trailing edge catching up.
// `key` changes on every navigation (page and anything else that changes which tab is active).
export function usePill(rowRef, pillRef, key) {
  const last = useRef(null);
  useLayoutEffect(() => {
    const place = (animate) => {
      const row = rowRef.current, pill = pillRef.current, tab = row?.querySelector(".pill.active")?.parentElement; // the <li>: its offsets are in the row
      if (!row || !pill) return;
      if (!tab) { pill.style.visibility = "hidden"; last.current = null; return; } // a page outside the tabs: no highlight
      pill.style.visibility = "";
      pill.style.width = `${row.scrollWidth}px`;
      const to = edgesOf(row, tab);
      movePill(pill, animate ? last.current : null, to);
      last.current = to;
    };
    place(true);
    const onResize = () => place(false);
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, [key]);
}

// The tab row scrolls when it can't fit: `more` is true while tabs are hidden past its end, so the end can fade (app.css .has-more).
export function useMoreTabs(rowRef, deps) {
  const [more, setMore] = useState(false);
  useEffect(() => {
    const ul = rowRef.current;
    if (!ul || typeof ResizeObserver === "undefined") return undefined;
    const check = () => setMore(ul.scrollWidth - ul.scrollLeft - ul.clientWidth > 4);
    const ro = new ResizeObserver(check);
    ro.observe(ul);
    ul.addEventListener("scroll", check, { passive: true });
    check();
    return () => { ro.disconnect(); ul.removeEventListener("scroll", check); };
  }, deps);
  return more;
}
