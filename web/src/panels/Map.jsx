// Live map in 3D (3d-force-graph on three.js, loaded on demand). Drag turns the map, the wheel zooms, a right drag pans. Clicking a
// node (or picking one with the keyboard) flies the camera round to face that node and its neighbours, which stay bright while the
// rest dims; clicking empty space or Escape flies back to the whole map. Labels show only for the highlighted cluster. Each live event
// sends a pulse along its edge (read teal, write indigo, external orange, error red) that ends in a ring on the node it reaches;
// lines used in the last minute carry faint slow dots. With reduced motion there are no dots and no flights: the camera jumps and
// the edge lights up briefly. Extras from Obsidian plugins: a local graph (neighbours to depth 1 or 2) and filtering by kind.
// Accessible equivalents: a table view, keyboard navigation between neighbours, and a polite live summary every 10 seconds.
// Performance: shared geometries and materials (dimming swaps materials, it never rebuilds objects), pulses, dots and rings are three
// instanced meshes (three draw calls however many are running), and the render loop sleeps while nothing moves or the map is off screen.
import { useEffect, useMemo, useRef, useState } from "react";
import { fmt, useApi, useStream } from "../api.js";
import { reducedMotion } from "../reduced.js";
import { DUR, EASE } from "../choreography.js";
import { cubicBezier } from "framer-motion";
import { forceX, forceY, forceZ } from "d3-force-3d"; // the same copy 3d-force-graph uses
import { Table } from "../charts.jsx";
import { Icon } from "../icons.jsx";
import { Skeleton, Tip, rovingKeys, useToast } from "../ui.jsx";
import "./map.css";

const KINDS = { file: "File", folder: "Folder", store: "Data store", endpoint: "Endpoint", external: "External API", config: "Config variable", actor: "Actor" };
const NODE_VAR = { file: "--text-muted", store: "--violet", endpoint: "--teal", external: "--orange", config: "--accent-text", folder: "--text-faint", actor: "--text" };
const EVENT_VAR = { read: "--ev-read", write: "--ev-write", external: "--ev-external", cost: "--ev-external", request: "--ev-read", error: "--ev-error" };
const PULSE_MS = 700, RING_MS = 600, MAX_PULSES = 200, DIM = 0.12;
const AMBIENT_MS = 60000, FLOW_MS = 2600, MAX_AMBIENT = 60; // ambient flow: how long an edge keeps flowing, one trip, how many at once
const FLY_MS = 1200, MAX_LABELS = 40;
const ease = cubicBezier(...EASE);
const label = (id) => id.split(":").slice(1).join(":") || id;
const short = (id) => label(id).split("/").filter(Boolean).pop() || label(id);
const edgeOf = (e) => (e.target ? [e.node, e.target] : [e.actor, e.node]); // the same rule as the server (api/ingest.py)
const endId = (end) => (typeof end === "object" ? end.id : end);

function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim() || "#888888";
  return {
    node: Object.fromEntries(Object.entries(NODE_VAR).map(([k, n]) => [k, v(n)])),
    event: Object.fromEntries(Object.entries(EVENT_VAR).map(([k, n]) => [k, v(n)])),
    link: v("--text-faint"), accent: v("--accent-text"), muted: v("--text-muted"), bg: v("--bg-void"),
  };
}

function buildGraph(raw, app) {
  const key = (a, id) => (app === "all" ? `${a}|${id}` : id);
  const nodes = raw.nodes.map((n) => ({ id: key(n.app, n.id), raw: n.id, app: n.app, kind: n.kind, hits: n.hits, last_seen: n.last_seen }));
  // The server keeps static relations (import, route, ...) and runtime ones (read, write, ...) as separate rows; one line is drawn per pair.
  const links = [], seen = new Map();
  for (const e of raw.edges) {
    const source = key(e.app, e.src), target = key(e.app, e.dst), id = `${source}>${target}`, prior = seen.get(id);
    if (!prior) { const l = { source, target, kind: e.kind, hits: e.hits, rels: [e.kind] }; seen.set(id, l); links.push(l); continue; }
    prior.rels.push(e.kind);
    if (e.hits > prior.hits) prior.kind = e.kind; // what actually happened wins over what the code says could
    prior.hits += e.hits;
  }
  return { nodes, links, key };
}

function adjacency(links) {
  const adj = new Map();
  const add = (a, b) => (adj.get(a) || adj.set(a, new Set()).get(a)).add(b);
  for (const l of links) { const s = endId(l.source), t = endId(l.target); add(s, t); add(t, s); }
  return adj;
}

function within(adj, start, depth) {
  const seen = new Set([start]);
  let frontier = [start];
  for (let d = 0; d < depth; d++) frontier = frontier.flatMap((id) => [...(adj.get(id) || [])].filter((n) => !seen.has(n) && seen.add(n)));
  return seen;
}

// Where the camera goes to show `points`: looking at their centre from `dir` (unit vector, centre to camera), just far enough back for
// every point to fit the narrower side of the view. `outward` looks along the line from the map's middle through that centre instead,
// so a cluster turns to face the viewer with the rest of the map behind it.
export function frame(points, { fov, aspect, dir, outward = false, margin = 12 }) {
  const n = points.length || 1;
  const c = points.reduce((a, p) => ({ x: a.x + p.x / n, y: a.y + p.y / n, z: a.z + p.z / n }), { x: 0, y: 0, z: 0 });
  const v = (fov / 2) * (Math.PI / 180), tan = Math.tan(Math.min(v, Math.atan(Math.tan(v) * aspect)));
  const len = Math.hypot(c.x, c.y, c.z), d = outward && len > 1 ? { x: c.x / len, y: c.y / len, z: c.z / len } : dir;
  // Each point needs the camera back by its distance off the view axis over tan(half angle), plus however far it sits towards the camera.
  const need = points.map((p) => {
    const x = p.x - c.x, y = p.y - c.y, z = p.z - c.z, along = x * d.x + y * d.y + z * d.z;
    return (Math.sqrt(Math.max(0, x * x + y * y + z * z - along * along)) + margin) / tan + along;
  });
  const dist = Math.max(30 / tan, ...need);
  return { target: c, position: { x: c.x + d.x * dist, y: c.y + d.y * dist, z: c.z + d.z * dist } };
}

export default function MapPanel({ app }) {
  const { data } = useApi("/api/graph", app);
  const [view, setView] = useState("graph");
  const [focus, setFocus] = useState(null);
  const [open, setOpen] = useState(null);
  const [summary, setSummary] = useState("");
  const [hidden, setHidden] = useState(() => new Set());
  const [local, setLocal] = useState(0); // 0 = whole graph, 1 or 2 = neighbours of the focused node to that depth
  const box = useRef(null);
  const fg = useRef(null);
  const graph = useRef(null);
  const s = useRef({ pal: null, adj: new Map(), byId: new Map(), hover: null, focus: null, lit: null, litLast: null, centreLast: null, fadeFrom: 0,
    visible: null, hidden: new Set(), pulses: [], rings: [], glow: new Map(), recent: new Set() }).current;
  const tally = useRef({});

  // Which nodes are highlighted: the hovered one (or the selected one) and its neighbours. The build below supplies s.apply and s.wake.
  const relight = () => {
    const centre = s.hover || s.focus;
    const next = centre ? new Set([centre, ...(s.adj.get(centre) || [])]) : null;
    if (!next !== !s.lit) s.fadeFrom = performance.now(); // highlight appearing or going: fade; moving between nodes: swap at once
    s.lit = next;
    if (next) { s.litLast = next; s.centreLast = centre; } // kept so a fade-out still knows what it is fading from
    s.fading = true;
    s.apply?.();
  };
  // 0 = nothing highlighted, 1 = fully dimmed around the highlight; eased over the hover duration.
  const dimK = () => {
    const t = Math.min(1, (performance.now() - s.fadeFrom) / (DUR.hover * 1000 || 1));
    const k = ease(reducedMotion() ? 1 : t);
    return s.lit ? k : 1 - k;
  };

  useEffect(() => {
    s.pal = readPalette();
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onTheme = () => { s.pal = readPalette(); s.paint?.(); };
    const mo = new MutationObserver(onTheme); // the header's theme toggle sets html[data-theme]
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    mq.addEventListener?.("change", onTheme);
    return () => { mo.disconnect(); mq.removeEventListener?.("change", onTheme); };
  }, []);

  useEffect(() => {
    if (!data || view !== "graph") return;
    let disposed = false, g = null;
    const el = box.current;
    graph.current = buildGraph(data, app);
    s.adj = adjacency(graph.current.links);
    s.byId = new Map(graph.current.nodes.map((n) => [n.id, n]));
    let ro, io, wakeOnMove;
    Promise.all([import("3d-force-graph"), import("three"), import("three/addons/renderers/CSS2DRenderer.js")]).then(([{ default: ForceGraph3D }, T, { CSS2DRenderer, CSS2DObject }]) => {
      if (disposed || !el) return;
      const G = graph.current;
      const shown = (n) => !s.hidden.has(n.kind) && (!s.visible || s.visible.has(n.id));
      const radius = (n) => Math.sqrt(1 + Math.min(s.adj.get(n.id)?.size || 0, 12) * 0.9) * 2.6; // as on the 2D map: sized by links, capped
      const centre = () => s.hover || s.focus || s.centreLast;

      // Shared geometry and materials; paint() recolours them in place when the theme changes.
      const geo = { node: new T.SphereGeometry(1, 16, 12), dot: new T.SphereGeometry(1, 8, 6), ring: new T.RingGeometry(0.86, 1, 40) };
      const lambert = (extra) => new T.MeshLambertMaterial(extra);
      const line = (opacity) => new T.LineBasicMaterial({ transparent: true, opacity, depthWrite: false });
      const m = {
        node: Object.fromEntries(Object.keys(NODE_VAR).map((k) => [k, lambert()])),
        dim: Object.fromEntries(Object.keys(NODE_VAR).map((k) => [k, lambert({ transparent: true, depthWrite: false })])),
        hit: line(0.45), code: line(0.3), lit: line(0.9), faded: line(0.4), glow: new Map(),
        flat: new T.MeshBasicMaterial({ side: T.DoubleSide }), // pulses, dots and rings: unlit, coloured per instance
        focus: new T.MeshBasicMaterial({ side: T.DoubleSide }),
      };
      const colours = new Map(), bg = new T.Color();
      const colour = (hex) => colours.get(hex) || colours.set(hex, new T.Color(hex)).get(hex);
      const paint = () => {
        const P = s.pal;
        for (const k of Object.keys(NODE_VAR)) { m.node[k].color.set(P.node[k]); m.dim[k].color.set(P.node[k]); }
        for (const x of [m.hit, m.code, m.faded]) x.color.set(P.link);
        m.lit.color.set(P.accent); m.focus.color.set(P.accent);
        bg.set(P.bg); colours.clear();
        for (const x of m.glow.values()) x.dispose();
        m.glow.clear();
        wake();
      };
      const glowMat = (hex) => m.glow.get(hex) || m.glow.set(hex, new T.LineBasicMaterial({ color: hex })).get(hex);
      const nodeMat = (n) => { const lit = s.lit || (s.fading ? s.litLast : null); return (lit && !lit.has(n.id) ? m.dim : m.node)[n.kind] || m.node.file; };
      const linkMat = (l) => {
        const glow = s.glow.get(l);
        if (glow) return glowMat(glow.color);
        if (!(s.lit || s.fading)) return l.hits || l.lastAt ? m.hit : m.code; // links only the code implies are fainter
        const c = centre();
        return endId(l.source) === c || endId(l.target) === c ? m.lit : m.faded;
      };

      // Labels only for the highlighted cluster: a few DOM elements positioned by three's CSS2DRenderer, themed by map.css.
      const labels = new Map();
      const placeLabels = () => {
        const want = new Set(s.lit ? [...s.lit].filter((id) => s.byId.has(id) && shown(s.byId.get(id))).slice(0, MAX_LABELS) : []);
        for (const [id, o] of labels) if (!want.has(id)) { o.removeFromParent(); labels.delete(id); }
        for (const id of want) {
          let o = labels.get(id);
          if (!o) {
            const span = document.createElement("span");
            span.className = "map-label"; span.textContent = short(s.byId.get(id).raw);
            o = new CSS2DObject(span); o.center.set(0.5, -0.7); // just under the node
            labels.set(id, o); g.scene().add(o);
          }
          o.element.classList.toggle("strong", id === s.hover || id === s.focus);
        }
      };

      s.fading = false;
      s.apply = () => {
        for (const n of G.nodes) if (n.__threeObj) n.__threeObj.material = nodeMat(n);
        for (const l of G.links) if (l.__lineObj) l.__lineObj.material = linkMat(l);
        placeLabels();
        wake();
      };

      // The render loop sleeps when nothing moves; anything that changes the picture wakes it for a moment.
      let busyUntil = 0, onscreen = true, asleep = false, engine = true, fitted = false, flight = null;
      // resumeAnimation runs a frame at once, and that frame may wake again (controls fire "change"): only resume from asleep.
      const wake = (ms = 400) => {
        busyUntil = Math.max(busyUntil, performance.now() + ms);
        if (asleep && onscreen && g) { asleep = false; g.resumeAnimation(); }
      };
      s.wake = wake;
      const flowing = () => !reducedMotion() && s.recent.size > 0;
      const busy = (now) => flight || s.fading || s.pulses.length || s.rings.length || s.glow.size || flowing() || engine || now < busyUntil;
      const sleep = () => { if (!asleep && !busy(performance.now())) { asleep = true; g.pauseAnimation(); } };

      // Camera flights on the house ease: the target slides, the view direction turns about it and the distance eases, so the map
      // appears to spin round to the cluster rather than the camera cutting through it.
      const v = { a: new T.Vector3(), q: new T.Quaternion() };
      const fly = ({ position, target }, ms) => {
        const cam = g.camera(), ctl = g.controls();
        const c1 = new T.Vector3(target.x, target.y, target.z), p1 = new T.Vector3(position.x, position.y, position.z);
        if (reducedMotion() || !ms) { flight = null; ctl.target.copy(c1); cam.position.copy(p1); cam.lookAt(c1); wake(); return; }
        const off0 = cam.position.clone().sub(ctl.target), off1 = p1.clone().sub(c1);
        flight = { t0: performance.now(), ms, c0: ctl.target.clone(), c1, d0: off0.clone().normalize(), r0: off0.length(), r1: off1.length(),
          turn: new T.Quaternion().setFromUnitVectors(off0.normalize(), off1.normalize()) };
        wake();
      };
      const lens = () => {
        const cam = g.camera();
        return { fov: cam.fov, aspect: cam.aspect, dir: cam.position.clone().sub(g.controls().target).normalize() };
      };
      const placed = (ids) => ids.map((id) => s.byId.get(id)).filter((n) => n && n.x != null && shown(n));
      s.camTo = (id, ms = FLY_MS) => {
        if (!g) return;
        const pts = id ? placed([id, ...(s.adj.get(id) || [])]) : placed([...s.byId.keys()]);
        if (pts.length) fly(frame(pts, { ...lens(), outward: !!id }), ms);
      };
      s.reheat = () => { engine = true; wake(); }; // the layout runs again after a change; keep frames coming until it stops
      s.refresh = () => { if (!g) return; g.nodeVisibility(g.nodeVisibility()).linkVisibility(g.linkVisibility()); s.reheat(); s.apply(); };

      // Live effects: one instanced mesh each, so a burst of events costs no extra draw calls. Faint dots blend toward the background
      // colour instead of using transparency, which keeps them in the cheap opaque pass.
      const inst = (geom, count) => {
        const mesh = new T.InstancedMesh(geom, m.flat, count);
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
        mesh.setColorAt(0, bg); mesh.count = 0; mesh.frustumCulled = false;
        return mesh;
      };
      const fx = { pulse: inst(geo.dot, MAX_PULSES), flow: inst(geo.dot, MAX_AMBIENT * 2), ring: inst(geo.ring, MAX_PULSES) };
      const focusRing = new T.Mesh(geo.ring, m.focus);
      const t = { m: new T.Matrix4(), p: new T.Vector3(), s: new T.Vector3(), q: new T.Quaternion(), c: new T.Color() };
      const put = (mesh, i, x, y, z, r, hex, a, q = t.q) => {
        mesh.setMatrixAt(i, t.m.compose(t.p.set(x, y, z), q, t.s.setScalar(r)));
        mesh.setColorAt(i, t.c.copy(bg).lerp(colour(hex), a));
      };
      const done = (mesh, count) => { mesh.count = count; mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true; };

      const onFrame = () => {
        const now = performance.now(), cam = g.camera(), ctl = g.controls();
        const zs = Math.max(1, Math.sqrt(cam.position.distanceTo(ctl.target) / 250)); // dots grow a little when far away, as on the 2D map
        if (flight) {
          const f = flight, k = ease(Math.min(1, (now - f.t0) / f.ms));
          ctl.target.lerpVectors(f.c0, f.c1, k);
          v.a.copy(f.d0).applyQuaternion(v.q.identity().slerp(f.turn, k)).multiplyScalar(f.r0 + (f.r1 - f.r0) * k);
          cam.position.copy(ctl.target).add(v.a); cam.lookAt(ctl.target);
          if (k >= 1) flight = null;
        }
        if (s.fading) {
          const k = dimK();
          for (const x of Object.values(m.dim)) x.opacity = 1 - (1 - DIM) * k;
          m.faded.opacity = 0.4 - 0.34 * k;
          if (now - s.fadeFrom >= DUR.hover * 1000) { s.fading = false; if (!s.lit) s.apply(); } // faded out: back to the plain materials
        }
        for (const [l, glow] of s.glow) if (glow.until < now) { s.glow.delete(l); if (l.__lineObj) l.__lineObj.material = linkMat(l); }
        // Ambient flow (Node Flow): edges active in the last minute keep two faint, slow dots travelling along them.
        let n = 0;
        if (!reducedMotion()) {
          for (const l of s.recent) {
            const age = now - l.lastAt, a = l.source, b = l.target;
            if (age > AMBIENT_MS || a.x == null || b.x == null) { s.recent.delete(l); continue; }
            if (n >= MAX_AMBIENT * 2) break;
            for (const phase of [0, 0.5]) {
              const f = (now / FLOW_MS + phase + l.seed) % 1;
              put(fx.flow, n++, a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, a.z + (b.z - a.z) * f, 1.1 * zs, l.lastColor, 0.55 * (1 - age / AMBIENT_MS));
            }
          }
        }
        done(fx.flow, n);
        // Pulses: one crisp dot per event, eased along the edge, then a ring on the node it reached.
        n = 0;
        s.pulses = s.pulses.filter((p) => {
          const k = (now - p.t0) / PULSE_MS, { source: a, target: b } = p.link;
          if (k < 0) return true; // a later hop of the same event, not started yet
          if (k >= 1) { s.rings.push({ node: b, color: p.color, t0: now }); return false; }
          if (a.x == null || b.x == null) return false;
          const e = ease(k);
          put(fx.pulse, n++, a.x + (b.x - a.x) * e, a.y + (b.y - a.y) * e, a.z + (b.z - a.z) * e, 2.2 * zs, p.color, 1);
          return true;
        });
        done(fx.pulse, n);
        n = 0;
        s.rings = s.rings.filter((r) => {
          const k = (now - r.t0) / RING_MS;
          if (k >= 1 || r.node.x == null || n >= MAX_PULSES) return false;
          put(fx.ring, n++, r.node.x, r.node.y, r.node.z, radius(r.node) + 1 + 10 * ease(k), r.color, 0.6 * (1 - k), cam.quaternion); // faces the camera
          return true;
        });
        done(fx.ring, n);
        const f = s.byId.get(s.focus);
        focusRing.visible = !!f && f.x != null && shown(f);
        if (focusRing.visible) { focusRing.position.set(f.x, f.y, f.z); focusRing.quaternion.copy(cam.quaternion); focusRing.scale.setScalar(radius(f) + 3); }
        for (const [id, o] of labels) { const x = s.byId.get(id); if (x?.x != null) o.position.set(x.x, x.y, x.z); }
        if (!busy(now)) queueMicrotask(sleep); // after the library has queued its next frame, so the cancel sticks
      };

      el.replaceChildren(); // a rebuild (view change) must not stack a second canvas
      const css2d = new CSS2DRenderer();
      css2d.domElement.setAttribute("aria-hidden", "true"); // the caption and table carry this for screen readers
      g = new ForceGraph3D(el, { controlType: "orbit", extraRenderers: [css2d] })
        .width(el.clientWidth).height(el.clientHeight)
        .backgroundColor("rgba(0,0,0,0)").showNavInfo(false)
        .nodeId("id").nodeLabel(() => "").linkLabel(() => "") // labels are drawn for the highlighted cluster; details live in the side panel
        .enableNodeDrag(false) // every drag turns the map
        .nodeVisibility(shown)
        .linkVisibility((l) => [l.source, l.target].every((x) => s.byId.has(endId(x)) && shown(s.byId.get(endId(x))))) // ends may still be ids
        .nodeThreeObject((n) => { const o = new T.Mesh(geo.node, nodeMat(n)); o.scale.setScalar(radius(n)); return o; })
        .linkMaterial(linkMat)
        .onNodeHover((n) => { s.hover = n?.id || null; relight(); })
        .onNodeClick((n) => { if (n.id === s.focus) s.camTo(n.id); setFocus(n.id); setOpen(n.id); })
        .onBackgroundClick(() => { if (!s.focus) s.camTo(null); setFocus(null); setOpen(null); })
        .warmupTicks(100).cooldownTicks(60) // most of the layout happens before the first frame
        .onEngineStop(() => {
          engine = false;
          if (!fitted) { fitted = true; s.camTo(s.focus, DUR.morph * 1000); }
        })
        .graphData({ nodes: G.nodes, links: G.links });
      // Obsidian-like forces in three dimensions: gentle repulsion, short links, and a pull to the centre so clusters stay close together.
      g.d3Force("charge").strength(-45);
      g.d3Force("link").distance(28);
      g.d3Force("x", forceX(0).strength(0.07));
      g.d3Force("y", forceY(0).strength(0.07));
      g.d3Force("z", forceZ(0).strength(0.07));
      g.scene().add(fx.flow, fx.pulse, fx.ring, focusRing);
      g.scene().onBeforeRender = onFrame;
      const ctl = g.controls();
      ctl.addEventListener("start", () => { flight = null; wake(); }); // grabbing the map cancels a flight
      ctl.addEventListener("change", () => wake());
      wakeOnMove = () => wake(); // hover tests need frames
      el.addEventListener("pointermove", wakeOnMove);
      io = new IntersectionObserver(([e]) => { onscreen = e.isIntersecting; if (onscreen) wake(); else { asleep = true; g.pauseAnimation(); } });
      io.observe(el);
      s.paint = paint;
      paint();
      fg.current = g;
      // dispose the WebGL resources this build made; the library disposes its own
      s.dispose = () => {
        for (const x of [...Object.values(geo), ...Object.values(m.node), ...Object.values(m.dim), m.hit, m.code, m.lit, m.faded, m.flat, m.focus, ...m.glow.values()]) x.dispose();
        for (const x of Object.values(fx)) x.dispose();
        g.renderer().forceContextLoss(); // browsers cap live WebGL contexts; switching Graph/Table must not use them up
        if (window.scene === g.scene()) delete window.scene; // the library leaves the scene on window
      };
    });
    ro = new ResizeObserver(() => fg.current && el && (fg.current.width(el.clientWidth).height(el.clientHeight), s.wake?.()));
    if (el) ro.observe(el);
    return () => {
      disposed = true; ro.disconnect(); io?.disconnect(); el?.removeEventListener("pointermove", wakeOnMove);
      fg.current?._destructor?.(); s.dispose?.();
      fg.current = null; s.apply = s.wake = s.camTo = s.refresh = s.reheat = s.paint = s.dispose = null;
      s.pulses = []; s.rings = []; s.glow.clear(); s.recent.clear();
    };
  }, [data, app, view]);

  // Kind filters and the local graph change which nodes are shown.
  useEffect(() => {
    s.hidden = hidden;
    s.visible = local && focus ? within(s.adj, focus, local) : null;
    s.refresh?.();
  }, [hidden, local, focus]);

  // Selecting a node (click, Find or keyboard) highlights it and flies the camera to its cluster; clearing flies back to the whole map.
  useEffect(() => {
    s.focus = focus;
    relight();
    s.camTo?.(focus);
  }, [focus]);

  const connected = useStream(app, (e) => {
    const kind = e.status === "error" ? "error" : e.kind;
    tally.current[kind] = (tally.current[kind] || 0) + 1;
    const g = fg.current, G = graph.current;
    if (!g || !G || !s.pal) return;
    const [a, b] = edgeOf(e);
    if (!a || !b || a === b) return;
    const [src, dst] = [G.key(e.app, a), G.key(e.app, b)];
    const { nodes, links } = g.graphData();
    let added = false;
    for (const [id, raw] of [[src, a], [dst, b]]) {
      if (!s.byId.has(id)) { const n = { id, raw, app: e.app, kind: raw.split(":")[0], hits: 0 }; nodes.push(n); s.byId.set(id, n); added = true; }
    }
    let link = links.find((l) => endId(l.source) === src && endId(l.target) === dst);
    if (!link) { link = { source: src, target: dst, kind: e.kind, hits: 0 }; links.push(link); added = true; }
    if (added) { g.graphData({ nodes, links }); G.nodes = nodes; G.links = links; s.adj = adjacency(links); s.reheat?.(); } // d3 resolves link ends in place
    const color = s.pal.event[kind] || s.pal.muted;
    // A request also travels on to the code that handles it (endpoint -> file), so the pulse shows the whole path.
    const path = e.kind === "request" ? [link, ...links.filter((l) => l.kind === "route" && endId(l.source) === dst)] : [link];
    for (const l of path) {
      l.lastAt = performance.now(); l.lastColor = color; l.seed ??= Math.random(); // feeds the ambient flow
      s.recent.add(l);
      if (reducedMotion()) { s.glow.set(l, { until: performance.now() + 1200, color }); s.apply?.(); }
      else if (s.pulses.length < MAX_PULSES) s.pulses.push({ link: l, color, t0: performance.now() + (l === link ? 0 : PULSE_MS * 0.6) });
    }
    s.wake?.();
  });

  useEffect(() => {
    const t = setInterval(() => {
      const c = tally.current;
      tally.current = {};
      const parts = [["read", "reads"], ["write", "writes"], ["external", "external calls"], ["request", "requests"], ["error", "errors"]]
        .filter(([k]) => c[k]).map(([k, w]) => `${c[k]} ${w}`);
      setSummary(parts.length ? `Last 10 seconds: ${parts.join(", ")}.` : "");
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const nodes = useMemo(() => (data ? buildGraph(data, app).nodes.sort((a, b) => a.raw.localeCompare(b.raw)) : []), [data, app]);
  const visibleNodes = nodes.filter((n) => !hidden.has(n.kind) && (!s.visible || s.visible.has(n.id)));
  const neighbours = (id) => [...(s.adj.get(id) || [])].sort();
  const clear = () => { setOpen(null); if (focus) setFocus(null); else s.camTo?.(null); };
  const onKey = (e) => {
    if (!visibleNodes.length) return;
    const i = visibleNodes.findIndex((n) => n.id === focus);
    const nb = focus ? neighbours(focus).filter((id) => visibleNodes.some((n) => n.id === id)) : [];
    let next = null;
    if (e.key === "ArrowDown") next = visibleNodes[(i + 1) % visibleNodes.length].id;
    else if (e.key === "ArrowUp") next = visibleNodes[(i - 1 + visibleNodes.length) % visibleNodes.length].id;
    else if (e.key === "ArrowRight" && nb.length) next = nb[(nb.indexOf(focus) + 1) % nb.length];
    else if (e.key === "ArrowLeft" && nb.length) next = nb[(nb.length + nb.indexOf(focus) - 1) % nb.length];
    else if (e.key === "Enter" && focus) { e.preventDefault(); setOpen(focus); s.camTo?.(focus); return; }
    else if (e.key === "Escape") { clear(); return; }
    else return;
    e.preventDefault();
    setFocus(next);
  };
  const toggleKind = (k) => setHidden((h) => { const n = new Set(h); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const focused = nodes.find((n) => n.id === focus);
  const opened = nodes.find((n) => n.id === open);
  if (!data) return <section className="card"><Skeleton height={220} lines={3} /></section>;
  return (
    <section className="card map-card" aria-label="Activity map">
      <div className="toolbar">
        <div role="group" aria-label="View" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
          <button type="button" aria-pressed={view === "graph"} onClick={() => setView("graph")}>Graph</button>
          <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}>Table</button>
        </div>
        <label>Find <input className="select" list="map-nodes" placeholder="File, store or API"
          onChange={(e) => { const n = nodes.find((x) => x.raw === e.target.value); if (n) { setFocus(n.id); setOpen(n.id); } }} /></label>
        <datalist id="map-nodes">{nodes.map((n) => <option key={n.id} value={n.raw} />)}</datalist>
        <label>Show <select className="select" value={local} onChange={(e) => setLocal(Number(e.target.value))} disabled={!focus}
          aria-describedby="local-hint">
          <option value={0}>Whole map</option><option value={1}>Neighbours of the selected node</option><option value={2}>Two steps out</option>
        </select></label>
        <span className="live" role="status"><span className={`live-dot ${connected ? "on" : ""}`} aria-hidden="true" />{connected ? "Live" : "Reconnecting…"}</span>
      </div>
      <p id="local-hint" className="sr-only">Select a node first to show only its neighbours.</p>
      <div className="map-legend">
        <div role="group" aria-label="Show node kinds" className="chips">
          {Object.entries(KINDS).map(([k, l]) => (
            <button key={k} type="button" className="chip" aria-pressed={!hidden.has(k)} onClick={() => toggleKind(k)}>
              <span className="swatch round" style={{ background: `var(${NODE_VAR[k]})` }} />{l}
            </button>
          ))}
        </div>
        <ul className="legend" aria-label="Pulse colours">
          <li><span className="swatch line" style={{ background: "var(--ev-read)" }} />Read</li>
          <li><span className="swatch line" style={{ background: "var(--ev-write)" }} />Write</li>
          <li><span className="swatch line" style={{ background: "var(--ev-external)" }} />External</li>
          <li><span className="swatch line" style={{ background: "var(--ev-error)" }} />Error</li>
        </ul>
      </div>
      <p className="sr-only" aria-live="polite">{summary}</p>
      {!nodes.length && <p className="muted">Nothing on the map yet. Nodes appear as soon as the app or Claude Code reports activity.</p>}
      {view === "graph" && nodes.length > 0 && (
        <>
          <div ref={box} className="map map-3d" tabIndex={0} role="application" onKeyDown={onKey}
            aria-label="Activity map. Up and down arrows move through all nodes, left and right through the selected node's neighbours, Enter opens details, Escape clears and shows the whole map."
            aria-describedby="map-focus" />
          <p id="map-focus" className="map-caption" aria-live="polite">
            {focused ? <><strong>{short(focused.raw)}</strong> · {KINDS[focused.kind] || focused.kind} · {neighbours(focused.id).length} connections</>
              : "Drag to turn the map, scroll to zoom, right-drag to pan. Click a node to fly to it, or select the map and use the arrow keys."}
          </p>
        </>
      )}
      {view === "table" && (
        <>
          <Table caption="Nodes" head={["Node", "Kind", ...(app === "all" ? ["App"] : []), "Activity", "Last seen"]}
            rows={visibleNodes.map((n) => [
              <button key="b" type="button" className="link" onClick={() => setOpen(n.id)}>{n.raw}</button>,
              KINDS[n.kind] || n.kind, ...(app === "all" ? [n.app] : []), fmt.n(n.hits), n.last_seen ? fmt.ago(n.last_seen) : "–"])} />
          <h2>Connections</h2>
          <Table caption="Connections" head={["From", "To", "Kind", "Count"]}
            rows={data.edges.map((e) => [e.src, e.dst, e.kind, fmt.n(e.hits)])} />
        </>
      )}
      {opened && <NodeDetails node={opened} onClose={() => setOpen(null)} />}
    </section>
  );
}

function NodeDetails({ node, onClose }) {
  const { data } = useApi("/api/events", node.app, { params: { limit: 200 } });
  const toast = useToast();
  const copy = async () => {
    try { await navigator.clipboard.writeText(node.raw); toast({ tone: "good", title: "Path copied." }); }
    catch { toast({ tone: "bad", title: "The browser didn't allow copying." }); }
  };
  const mine = (data || []).filter((e) => e.node === node.raw || e.target === node.raw || e.actor === node.raw).slice(0, 20);
  return (
    <aside className="details" aria-labelledby="node-h">
      <div className="details-head">
        <h2 id="node-h">{node.raw}</h2>
        <div className="actions">
          <Tip label="Copy path" describe={false}><button type="button" className="icon-button" onClick={copy} aria-label="Copy path"><Icon name="copy" /></button></Tip>
          <Tip label="Close details" describe={false}><button type="button" className="icon-button" onClick={onClose} aria-label="Close details"><Icon name="close" /></button></Tip>
        </div>
      </div>
      <p className="muted">{KINDS[node.kind] || node.kind} · {fmt.n(node.hits)} events · {node.last_seen ? `last ${fmt.ago(node.last_seen)}` : "not seen yet"}</p>
      <Table caption={`Recent activity for ${node.raw}`} head={["Time", "Kind", "From", "To", "Status"]} empty="No recent events in the latest 200."
        rows={mine.map((e) => [fmt.time(e.ts), e.kind, label(e.target ? e.node : e.actor || ""), label(e.target || e.node || ""), e.status || ""])} />
    </aside>
  );
}
