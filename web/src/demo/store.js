// Demo state: what a reviewer has clicked (approvals, tasks, events, roles, delegations), kept in this browser only so each
// reviewer can play without changing what others see. Answers about real systems are the exception: they go to the demo
// server and are shared (feedback.jsx). "Reset demo" clears the local part.
import { useSyncExternalStore } from "react";
import { CAPS, DEFAULT_GRANTS, DEFAULT_RULES, PERSONAS } from "./data.js";

const KEY = "mycelium-demo-v1";
const fresh = () => ({
  viewer: "gm", approvals: {}, requests: [], tasks: {}, newTasks: [], events: [], eventEdits: {}, rules: DEFAULT_RULES, grants: DEFAULT_GRANTS,
  roleOf: {}, delegations: [], inspections: {}, revoked: {}, answers: {}, identity: { name: "", team: "" }, code: "", introHidden: false, audit: [],
  // added 2026-11-05 (docs/demo-features-plan.md)
  seenCaps: CAPS.map((c) => c.id), // permissions this browser's saved grants already know about (see load)
  roster: {}, rosterSent: null, // roster planner: cell edits keyed "personId|dayIndex", and the last hand-off
  permits: [], permitEdits: {}, // permits issued in the demo, and status changes to the seeded ones
  rollcall: null, // a running or finished roll call: { site, mode, startedAt, ticks: { personId: "safe" | "missing" }, endedAt }
  rollcalls: [], // finished roll-call reports
  layouts: {}, roleLayouts: {}, // Home layouts: each persona's own, and admin defaults per role
  views: [], // who opened whose record, for My data
  dataRequests: [], // corrections asked for from My data
  docs: {}, // documents: review decisions keyed by document id
  packs: [], // audit packs built
  auditors: [], // guest auditors given read-only access on Roles: { id, name, firm, sites, framework, until }
  tv: { announcement: "", screens: null }, // floor screen settings
  commuteOptOut: {}, // route alerts: personId -> true (turned off) or false (turned back on), over the seeded consent (weather.js)
});

function load() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return fresh(); }
  const s = { ...fresh(), ...saved };
  // Permissions added since this browser saved its grants get their default roles, so new pages don't vanish for returning reviewers.
  const seen = new Set(saved.seenCaps || CAPS.slice(0, 14).map((c) => c.id));
  const added = CAPS.map((c) => c.id).filter((c) => !seen.has(c));
  if (added.length && saved.grants) {
    s.grants = Object.fromEntries(Object.keys(DEFAULT_GRANTS).map((r) => [r, [...(saved.grants[r] || []), ...added.filter((c) => DEFAULT_GRANTS[r].includes(c))]]));
  }
  s.seenCaps = CAPS.map((c) => c.id);
  return s;
}
let state = load();
const subs = new Set();

export function update(fn) {
  state = { ...state, ...fn(state) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private window: the demo still works for this visit */ }
  subs.forEach((f) => f());
}
export function resetDemo() {
  const keep = { identity: state.identity, code: state.code, answers: state.answers };
  // the start-here strip comes back too, so a reset really is a fresh start
  state = { ...fresh(), ...keep };
  update(() => ({}));
}
export const getState = () => state;
export const useDemo = (select = (s) => s) => select(useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state));
export const usePersona = () => { const id = useDemo((s) => s.viewer); return PERSONAS.find((p) => p.id === id) || PERSONAS[0]; };
export const useCan = () => { const p = usePersona(); const grants = useDemo((s) => s.grants); return (cap) => (grants[p.id] || []).includes(cap); };

// Audit trail: every change a reviewer makes that a real deployment would log (roles, delegation, cards, approvals).
export function audit(what) {
  const s = getState();
  const who = PERSONAS.find((p) => p.id === s.viewer);
  update((st) => ({ audit: [{ at: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }), who: who?.label.replace(" (you)", ""), what }, ...st.audit].slice(0, 30) }));
}
