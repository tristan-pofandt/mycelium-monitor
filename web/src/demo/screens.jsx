// TV mode's setup card (feature 11), opened from a site's detail on Sites by roles with `tv`: pick the site, tick the
// screens, type an announcement, then open the floor screen in a new window. Settings go to store `tv`.
//
// <TvSetup site onClose />   site: the site the card starts on; onClose: called on Cancel and after opening.
import { useState } from "react";
import { SITES, siteName } from "./data.js";
import { SourceNote } from "./bits.jsx";
import { audit, update, useDemo, usePersona } from "./store.js";
import { rollCallSites } from "./rollcall.js";
import { SCREENS } from "./screens.js";
import "./screens.css";

export function TvSetup({ site, onClose }) {
  const persona = usePersona();
  const saved = useDemo((s) => s.tv) || {};
  // Same reach as a roll call: site staff their own site, the all-sites roles every site.
  const sites = SITES.map((s) => s.id).filter((id) => rollCallSites(persona).includes(id));
  const [pick, setPick] = useState(sites.includes(site) ? site : sites[0]);
  const [on, setOn] = useState(saved.screens?.length ? saved.screens : SCREENS.map((s) => s.id));
  const [text, setText] = useState(saved.announcement || "");
  if (!pick) return null;
  const empty = !on.some((id) => id !== "announcement" || text.trim()); // only an empty announcement would leave nothing to show
  const tick = (id, yes) => setOn((v) => (yes ? SCREENS.map((s) => s.id).filter((x) => x === id || v.includes(x)) : v.filter((x) => x !== id)));
  const submit = (e) => {
    e.preventDefault();
    const announcement = text.trim();
    update(() => ({ tv: { announcement, screens: on } }));
    const said = announcement === (saved.announcement || "") ? "" : announcement ? `, announcement "${announcement}"` : ", announcement cleared";
    audit(`Opened the floor screen for ${siteName(pick)}: ${on.length} of ${SCREENS.length} screens${said}`);
    window.open(`/tv?site=${pick}`, "_blank");
    onClose?.();
  };
  return (
    <form className="panel-card tv-setup" aria-labelledby="tv-setup-h" onSubmit={submit} style={{ gridColumn: "1 / -1" }}>
      <h2 id="tv-setup-h">Set up a floor screen</h2>
      <p className="muted small">A TV on the shop floor that anyone walking past can read, so it never shows names, cards or security detail. Screens change every 15 seconds. A roll call at the site takes over every screen there.</p>
      {sites.length > 1 ? (
        <label className="field">Site
          <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}>{sites.map((id) => <option key={id} value={id}>{siteName(id)}</option>)}</select>
        </label>
      ) : <p><strong>Site:</strong> {siteName(pick)} (your site)</p>}
      <fieldset className="tv-setup-screens">
        <legend>Screens to show</legend>
        {SCREENS.map((s) => (
          <label key={s.id} className="check">
            <input type="checkbox" checked={on.includes(s.id)} onChange={(e) => tick(s.id, e.target.checked)} />
            <span>{s.label}{s.hint && <span className="muted small"> {s.hint}</span>}</span>
          </label>
        ))}
      </fieldset>
      <label className="field">Announcement (optional)
        <textarea className="input" rows={2} maxLength={160} value={text} onChange={(e) => setText(e.target.value)} aria-describedby="tv-say-hint" />
      </label>
      <p id="tv-say-hint" className="muted small">Up to 160 characters, shown in large type. Don't name anyone.</p>
      {empty && <p className="muted small" role="status">{on.length ? "Type the announcement, or tick another screen." : "Tick at least one screen."}</p>}
      <div className="actions">
        <button type="submit" className="button button-primary" disabled={empty}>Open TV mode</button>
        <button type="button" className="button" onClick={onClose}>Cancel</button>
      </div>
      <SourceNote ids={["plantdata", "whs", "rostering", "permits", "floorplans", "evac"]} />
    </form>
  );
}
