// Weather and roads: the Home card for every role, a line for a site's detail, and a TV screen. What each role sees:
// GM counts by site (no names); Site Manager their site's counts by shift; supervisor the names in their own team; employee
// only themselves, and only with consent; Security and IT site-level warnings only. TV: no names, no counts.
import "./weather.css";
import { Link } from "react-router";
import { Icon } from "../icons.jsx";
import { Switch, useToast } from "../ui.jsx";
import { PLACES, inScope, person, siteName } from "./data.js";
import { SourceNote } from "./feedback.jsx";
import { audit, update, useCan, useDemo, usePersona } from "./store.js";
import { LEVEL, ROADS, ROAD_STATUS, WARNINGS, WEATHER, causes, commuteMap, commuteRisk, dayLabel, forSites, joinAnd, postcodeArea, roadName, spanText, whenText } from "./weather.js";

const WIDE = ["gm", "security", "it", "hr"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const placesOf =(persona) => (WIDE.includes(persona.id) ? PLACES.map((s) => s.id) : [person(persona.person).site]);

// Commute risk the persona may see. Security and IT get none (site-level only); the employee only themselves.
export function useCommuteRisk(persona, day) {
  const optOut = useDemo((s) => s.commuteOptOut) || {};
  if (["security", "it"].includes(persona.id)) return [];
  const people = (persona.id === "employee" ? [person(persona.person)] : inScope(persona)).filter((p) => p.status === "active");
  return commuteRisk(people, ROADS, WARNINGS, day, commuteMap(optOut));
}

function WarningItem({ w }) {
  const l = LEVEL[w.level];
  return (
    <li className="queue-item">
      <p><span className={`badge ${l.badge}`}><Icon name={l.icon} />{w.kind}</span> <strong>{w.area}</strong></p>
      <p className="small">{w.detail}</p>
      <p className="muted small">{spanText(w)}. Issued {whenText(w.issued)} by the Bureau of Meteorology (simulated).</p>
    </li>
  );
}

function RoadItem({ r }) {
  const st = ROAD_STATUS[r.status];
  return (
    <li className="queue-item">
      <p><span className={`badge ${st.badge}`}><Icon name={st.icon} />{st.word}</span> <strong>{roadName(r)}</strong>, {r.cause.toLowerCase()}</p>
      <p className="muted small">{r.detail} {spanText(r)}.</p>
    </li>
  );
}

function Outlook({ site }) {
  return (
    <ul className="wx-outlook" role="list" aria-label={`${siteName(site)}, 3-day outlook`}>
      {WEATHER[site].map((d, i) => (
        <li key={i}>
          <span className="wx-day">{dayLabel(i)}</span>
          <span className="wx-sky"><Icon name={d.icon} />{d.summary}</span>
          <span className="muted small wx-temps">{d.min}° to {d.max}° · rain {d.rain}%</span>
        </li>
      ))}
    </ul>
  );
}

function Lists({ warns, roads, empty }) {
  return (
    <>
      {warns.length > 0 && <><h3 className="small-head">Warnings</h3><ul className="queue" role="list">{warns.map((w) => <WarningItem key={w.id} w={w} />)}</ul></>}
      {roads.length > 0 && <><h3 className="small-head">Roads</h3><ul className="queue" role="list">{roads.map((r) => <RoadItem key={r.id} r={r} />)}</ul></>}
      {!warns.length && !roads.length && <p className="muted">{empty}</p>}
    </>
  );
}

function Footer() {
  return (
    <>
      <p className="muted small">A real deployment would read the Bureau of Meteorology's public warnings and QLDTraffic's open data, after checking their terms of reuse. This demo calls nothing: its content security policy blocks outside requests, so all of this is made up.</p>
      <SourceNote ids={["s_commute", "hr"]} />
    </>
  );
}

// GM: counts by site, no names
function SiteCounts({ risk }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Weather, roads and commute risk tomorrow, by site</caption>
        <thead><tr><th scope="col">Site</th><th scope="col">Warnings</th><th scope="col">Roads closed or likely to close</th><th scope="col">Staff at risk tomorrow</th></tr></thead>
        <tbody>{PLACES.map((s) => {
          const n = risk.filter((r) => r.site === s.id).length;
          return (
            <tr key={s.id}>
              <th scope="row">{s.name}</th>
              <td>{forSites(WARNINGS, [s.id]).map((w) => w.kind).join(", ") || "None"}</td>
              <td>{forSites(ROADS, [s.id]).filter((r) => r.status !== "lane").length}</td>
              <td className={n ? "late" : ""}>{n}</td>
            </tr>
          );
        })}</tbody>
      </table>
      <p className="muted small">Staff at risk: people who opted in and whose home postcode is cut off on the way in. Counts only; their supervisors see the names.</p>
    </div>
  );
}

function ShiftCounts({ risk }) {
  const can = useCan();
  const shifts = [...new Set(risk.map((r) => r.shift))];
  if (!risk.length) return <p className="muted">No one who opted in is expected to be cut off tomorrow.</p>;
  return (
    <p className="notice">
      <strong>Tomorrow:</strong> {joinAnd(shifts.map((s) => `${risk.filter((r) => r.shift === s).length} on the ${s.toLowerCase()} shift`))} live in postcodes that {joinAnd(causes(risk))} may cut off.
      {can("roster") && <> <Link to="/rosters">Check the roster</Link></>}
    </p>
  );
}

function TeamRisk({ risk, me }) {
  const can = useCan();
  if (!risk.length) return <p className="muted">No one in your team who opted in is expected to be cut off tomorrow.</p>;
  return (
    <>
      <p className="notice"><strong>{risk.length} of tomorrow's {me.shift.toLowerCase()} shift</strong> live in postcodes that {joinAnd(causes(risk))} may cut off.
        {can("roster") && <> <Link to="/rosters">Add backups</Link></>}</p>
      <ul className="queue" role="list" aria-label="Your team members at risk tomorrow">
        {risk.map((r) => (
          <li key={r.id} className="queue-item">
            <p><strong>{r.id === me.id ? "You" : person(r.id).name}</strong> <span className={`badge ${r.severity === "high" ? "badge-bad" : "badge-warn"}`}><Icon name={r.severity === "high" ? "down" : "errors"} />{r.severity === "high" ? "Cut off" : "May be cut off"}</span></p>
            <p className="muted small">{joinAnd([...r.roads.map(roadName), ...r.warnings.map((w) => w.kind)])}</p>
          </li>
        ))}
      </ul>
      <p className="muted small">Only people who agreed to share their home postcode are counted. You never see the postcode or address.</p>
    </>
  );
}

function MyRoute({ me }) {
  const optOut = useDemo((s) => s.commuteOptOut) || {};
  const toast = useToast();
  const mine = commuteMap(optOut)[me.id];
  const [risk] = useCommuteRisk({ id: "employee", person: me.id }, 1);
  const set = (on) => {
    update((s) => ({ commuteOptOut: { ...s.commuteOptOut, [me.id]: !on } }));
    audit(on ? "turned route alerts on (agreed to share their home postcode)" : "turned route alerts off (stopped sharing their home postcode)");
  };
  const flip = (on) => { set(on); toast({ title: on ? "Route alerts on." : "Route alerts off. Your postcode is no longer used.", action: { label: "Undo", onClick: () => set(!on) } }); };
  const sup = person(me.manager);
  return (
    <>
      {risk && (
        <p className="notice wx-mine"><Icon name="down" /><span><strong>Your route may be affected tomorrow.</strong> {cap(joinAnd([...risk.roads.map((r) => `the ${roadName(r)} (${ROAD_STATUS[r.status].word.toLowerCase()})`), ...risk.warnings.map((w) => `the ${w.kind}`)]))} may cut you off. Allow extra time, or let {sup ? sup.name.split(" ")[0] : "your supervisor"} know if you can't get in.</span></p>
      )}
      <Switch checked={mine.optIn} onChange={flip} label="Warn me if my way to work may be cut" />
      <p className="muted small">{mine.optIn
        ? `On. Uses your home postcode from HR (${mine.postcode}${postcodeArea(mine.postcode) ? `, ${postcodeArea(mine.postcode)}` : ""}), never your address. Your supervisor sees your name if you may be cut off. You can turn this off at any time.`
        : "Off. Mycelium doesn't receive your postcode, and you're not counted. You can turn this back on at any time."}</p>
    </>
  );
}

export function WeatherCard() {
  const persona = usePersona();
  const me = person(persona.person);
  const places = placesOf(persona);
  const one = places.length === 1 ? places[0] : null;
  const risk = useCommuteRisk(persona, 1);
  const warns = forSites(WARNINGS, places);
  const roads = forSites(ROADS, places);
  return (
    <section className="panel-card wx-card" aria-labelledby="wx-h">
      <div className="card-head">
        <div><h2 id="wx-h"><Icon name="weather" /> Weather and roads</h2><p className="card-sub">{one ? `${siteName(one)}, next 3 days` : "All sites, next 3 days"}</p></div>
      </div>
      {persona.id === "employee" && <MyRoute me={me} />}
      {persona.id === "gm" && <SiteCounts risk={risk} />}
      {one && <Outlook site={one} />}
      <Lists warns={warns} roads={roads} empty={one ? `No warnings or road closures for ${siteName(one)}.` : "No warnings or road closures."} />
      {persona.id === "site_manager" && <ShiftCounts risk={risk} />}
      {persona.id === "supervisor" && <TeamRisk risk={risk} me={me} />}
      <Footer />
    </section>
  );
}

// One line for a site's detail (Sites). Counts only, and only for roles that see that site's people.
export function WeatherLine({ site }) {
  const persona = usePersona();
  const risk = useCommuteRisk(persona, 1).filter((r) => r.site === site);
  const warns = forSites(WARNINGS, [site]);
  const roads = forSites(ROADS, [site]).filter((r) => r.status !== "lane");
  const today = WEATHER[site][0];
  const worst = warns.find((w) => w.level === "warning") || warns[0];
  return (
    <div className="wx-line">
      <p>
        {worst ? <span className={`badge ${LEVEL[worst.level].badge}`}><Icon name={LEVEL[worst.level].icon} />{worst.kind}</span> : <span className="badge badge-none"><Icon name={today.icon} />No warnings</span>}
        {worst && <> <strong>{worst.area}</strong>.</>}
        {" "}{today.summary} today, {today.min}° to {today.max}°.
        {roads.length > 0 && ` ${roads.length} ${roads.length === 1 ? "road" : "roads"} on the way in closed or likely to close (${roads.map((r) => r.road).join(", ")}).`}
        {risk.length > 0 && ` ${risk.length} staff who opted in may be cut off tomorrow.`}
      </p>
      <p className="muted small">Bureau of Meteorology and QLDTraffic, simulated. Nothing is fetched.</p>
      <SourceNote ids={["s_commute", "hr"]} />
    </div>
  );
}

// A TV screen (feature 11): big type, read from across the floor. No names and no counts of people.
export function WeatherScreen({ site }) {
  const warns = forSites(WARNINGS, [site]);
  const roads = forSites(ROADS, [site]);
  return (
    <section className="wx-screen" aria-labelledby={`wx-tv-${site}`}>
      <h2 id={`wx-tv-${site}`}>Weather and roads, {siteName(site)}</h2>
      {warns.map((w) => (
        <div key={w.id} className="wx-tv-row">
          <span className={`badge ${LEVEL[w.level].badge}`}><Icon name={LEVEL[w.level].icon} size={28} />{w.kind}</span>
          <p>{w.area}. {spanText(w)}.</p>
        </div>
      ))}
      {roads.map((r) => (
        <div key={r.id} className="wx-tv-row">
          <span className={`badge ${ROAD_STATUS[r.status].badge}`}><Icon name={ROAD_STATUS[r.status].icon} size={28} />{ROAD_STATUS[r.status].word}</span>
          <p>{roadName(r)}, {r.cause.toLowerCase()}. {spanText(r)}.</p>
        </div>
      ))}
      {!warns.length && !roads.length && <p>No weather warnings or road closures.</p>}
      <Outlook site={site} />
      <p className="wx-tv-note">Issued by the Bureau of Meteorology (simulated). Roads in the style of QLDTraffic (simulated).</p>
    </section>
  );
}
