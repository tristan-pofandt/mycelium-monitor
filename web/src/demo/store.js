// Demo state: what a reviewer has clicked (approvals, tasks, events, roles, delegations), kept in this browser only so each
// reviewer can play without changing what others see. Answers about real systems are the exception: they go to the demo
// server and are shared (feedback.jsx). "Reset demo" clears the local part.
import { useSyncExternalStore } from "react";
import { DEFAULT_GRANTS, DEFAULT_RULES, PERSONAS } from "./data.js";

const KEY = "mycelium-demo-v1";
const fresh = () => ({
  viewer: "gm", approvals: {}, requests: [], tasks: {}, newTasks: [], events: [], eventEdits: {}, rules: DEFAULT_RULES, grants: DEFAULT_GRANTS,
  roleOf: {}, delegations: [], inspections: {}, revoked: {}, answers: {}, identity: { name: "", team: "" }, code: "", introHidden: false, audit: [],
});

function load() {
  try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return fresh(); }
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
