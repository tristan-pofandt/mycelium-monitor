// Security, in two tabs. Physical: alerts that cross systems (a leaver's card, a comms room left open), doors, visitors, cameras
// (health and events only, never video), inspections done from a phone, and each physical policy with its evidence.
// Cyber: device compliance, risky sign-ins and an Essential Eight snapshot (pages/Devices.jsx). Each tab shows only for roles
// with its permission (security, devices).
import { useState } from "react";
import { useSearchParams } from "react-router";
import { KpiTile, Table } from "../../charts.jsx";
import { rovingKeys, useToast } from "../../ui.jsx";
import { CAMERAS, DOOR_EVENTS, INSPECTIONS, POLICIES, VISITORS, dayOffset, fmtAgo, fmtDay, person, siteName } from "../data.js";
import { AlertsList, SourceNote, useAlerts } from "../bits.jsx";
import { update, useCan, useDemo, usePersona } from "../store.js";
import Cyber from "./Devices.jsx";

function Physical() {
  const p = usePersona();
  const me = person(p.person);
  const site = p.id === "site_manager" ? me.site : null;
  const mine = (x) => !site || x.site === site;
  const alerts = useAlerts().filter((a) => !a.done);
  const done = useDemo((s) => s.inspections);
  const toast = useToast();
  const [doorSite, setDoorSite] = useState("all");
  const [allDoors, setAllDoors] = useState(false);
  const inspections = INSPECTIONS.filter(mine).map((i) => ({ ...i, doneAt: done[i.id] }));
  const overdue = inspections.filter((i) => !i.doneAt && i.due < dayOffset(0));
  const doors = DOOR_EVENTS.filter(mine).filter((d) => doorSite === "all" || d.site === doorSite);
  return (
    <>
      <dl className="kpis">
        <KpiTile icon="errors" label="Open security alerts" value={String(alerts.length)} />
        <KpiTile icon="access" label="Doors forced or held open, 24 h" value={String(DOOR_EVENTS.filter(mine).filter((d) => d.result === "Forced" || d.result === "Held open").length)} />
        <KpiTile icon="status" label="Cameras offline" value={String(CAMERAS.filter(mine).reduce((n, c) => n + c.offline.length, 0))} />
        <KpiTile icon="map" label="Visitors on site now" value={String(VISITORS.filter(mine).length)} />
        <KpiTile icon="clock" label="Inspections overdue" value={String(overdue.length)} />
      </dl>
      <section className="panel-card span-2">
        <div className="card-head"><div><h2>Alerts</h2><p className="card-sub">Problems that only show up when systems are joined, such as HR leavers against active cards</p></div></div>
        <AlertsList />
      </section>
      <section className="panel-card">
        <h2>Inspections</h2>
        <p className="muted small">Done on a phone at the door, with a photo. Overdue ones alert the site.</p>
        <ul className="queue" role="list">{inspections.map((i) => (
          <li key={i.id} className="queue-item">
            <p><strong>{i.title}</strong> · {siteName(i.site)}</p>
            <p className={`small ${!i.doneAt && i.due < dayOffset(0) ? "late" : "muted"}`}>{i.every} · {i.doneAt ? `done ${i.doneAt}` : `due ${fmtDay(i.due)}`}</p>
            {!i.doneAt && <button type="button" className="button" onClick={() => { update((s) => ({ inspections: { ...s.inspections, [i.id]: "just now" } })); toast({ title: "Inspection recorded with a photo (simulated).", tone: "good" }); }}>Mark done</button>}
          </li>
        ))}</ul>
        <SourceNote ids={["inspections"]} />
      </section>
      <section className="panel-card">
        <h2>Visitors on site</h2>
        <ul className="queue" role="list">{VISITORS.filter(mine).map((v) => (
          <li key={v.name} className="queue-item">
            <p><strong>{v.name}</strong>, {v.company}</p>
            <p className="muted small">{siteName(v.site)} · host {person(v.host).name} · arrived {fmtAgo(v.since)} · {v.inducted ? "inducted" : <span className="late">not inducted yet</span>}</p>
          </li>
        ))}</ul>
        <SourceNote ids={["visitors"]} />
      </section>
      <section className="panel-card span-2">
        <div className="card-head">
          <div><h2>Door activity</h2><p className="card-sub">The latest card reads. Cards and doors from the access control system.</p></div>
          {!site && <select className="input" aria-label="Site" value={doorSite} onChange={(e) => setDoorSite(e.target.value)}>
            <option value="all">All sites</option>{[...new Set(DOOR_EVENTS.map((d) => d.site))].map((s) => <option key={s} value={s}>{siteName(s)}</option>)}</select>}
        </div>
        <Table caption="Door activity" head={["When", "Site", "Door", "Person", "Card", "Result"]}
          keys={doors.slice(0, allDoors ? 99 : 8).map((d) => [-d.when.getTime()])}
          rows={doors.slice(0, allDoors ? 99 : 8).map((d) => [fmtAgo(d.when), siteName(d.site), d.door, d.who, d.card,
            <span key="r" className={d.result === "Granted" ? "" : "late"}>{d.result}</span>])} />
        {!allDoors && doors.length > 8 && <div className="table-more"><span className="muted small">The latest 8 of {doors.length} card reads.</span><button type="button" className="button" onClick={() => setAllDoors(true)}>Show all</button></div>}
        <SourceNote ids={["access_control"]} />
      </section>
      <section className="panel-card">
        <h2>Cameras</h2>
        <p className="muted small">Health and events only. Video stays in your camera system; links open it there.</p>
        <Table caption="Cameras by site" head={["Site", "Cameras", "Offline", "Footage kept"]}
          rows={CAMERAS.filter(mine).map((c) => [siteName(c.site), c.total, c.offline.length ? c.offline.join(", ") : "None", <span key="s" className={c.storageDays < 30 ? "late" : ""}>{c.storageDays} days</span>])} />
        <SourceNote ids={["cctv", "alarms", "guards"]} />
      </section>
      <section className="panel-card">
        <h2>Physical security policies</h2>
        <p className="muted small">Each policy, the evidence that shows it's being followed, and where it isn't.</p>
        <ul className="queue" role="list">{POLICIES.map((x) => (
          <li key={x.policy} className="queue-item">
            <p><span className={`badge ${x.ok ? "badge-ok" : "badge-bad"}`}>{x.ok ? "Met" : "Gap"}</span> <strong>{x.policy}</strong></p>
            <p className="muted small">{x.status} · evidence: {x.evidence}</p>
            <SourceNote ids={[x.source]} />
          </li>
        ))}</ul>
      </section>
    </>
  );
}

const TABS = [{ id: "physical", label: "Physical security", cap: "security" }, { id: "cyber", label: "Cyber security", cap: "devices" }];

export default function Security() {
  const can = useCan();
  const [params, setParams] = useSearchParams();
  const tabs = TABS.filter((t) => can(t.cap));
  const tab = tabs.find((t) => t.id === params.get("tab")) || tabs[0];
  return (
    <>
      {tabs.length > 1 && (
        <div className="toolbar" style={{ gridColumn: "1 / -1" }}>
          <div role="group" aria-label="Security area" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
            {tabs.map((t) => <button key={t.id} type="button" aria-pressed={tab.id === t.id} onClick={() => setParams(t.id === "physical" ? {} : { tab: t.id })}>{t.label}</button>)}
          </div>
        </div>
      )}
      {tab.id === "cyber" ? <Cyber /> : <Physical />}
    </>
  );
}
