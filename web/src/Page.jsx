import { useLayoutEffect, useRef } from "react";
import { pageEnter } from "./motion/pages.js";

// The one wrapper every page renders inside: the shared auto-fit grid (app.css .page-grid), the page title, and the entrance
// (motion/pages.js). Panels return plain cards; nothing in a panel animates its own arrival, so every page moves the same way.
export default function Page({ title, scope, children }) {
  const ref = useRef(null);
  useLayoutEffect(() => { const run = pageEnter(ref.current); return () => run?.stop(); }, []);
  return (
    <div ref={ref} className="page-grid">
      {title && (
        <div className="page-head">
          <h1><span className="rise-mask"><span className="rise">{title}</span></span><span className="h1-scope rise-mask"><span className="rise"><span className="sr-only">, </span>{scope}</span></span></h1>
        </div>
      )}
      {children}
    </div>
  );
}
