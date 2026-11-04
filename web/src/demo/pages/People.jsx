// People: the team map (Mycelium's live map in its "Team" lens: a radial tree from the viewer outwards, coloured by workload),
// the same tree as an outline for keyboards and screen readers, and a searchable directory. Drag a task onto a person on the
// map, or pick a person and use Assign, to hand out work.
import { useEffect, useMemo, useRef, useState } from "react";
import { Table } from "../../charts.jsx";
import { useReducedMotion } from "../../reduced.js";
import { useTheme } from "../../theme.js";
import { rovingKeys, useToast } from "../../ui.jsx";
import { PEOPLE, SITES, person, reportsOf, siteName } from "../data.js";
import { PersonButton, PersonCard, SourceNote, useTasks } from "../bits.jsx";
import { update, useCan, usePersona } from "../store.js";

const load = (p) => (p.tasks > 10 ? "high" : p.tasks > 7 ? "medium" : "ok");
const LOAD_WORD = { high: "overloaded", medium: "busy", ok: "fine" };

// The tree a persona sees: leaders as nodes, each team folded into one node (a supervisor sees their own people one by one),
// laid out as a fixed radial tree: the viewer in the middle, each level a ring further out, each branch a slice sized by its leaves.
function treeFor(rootId) {
  const nodes = [], links = [], kids = new Map();
  const walk = (id, depth) => {
    const p = person(id);
    const node = { id, name: p.name, title: p.title, load: load(p), kind: "person", depth };
    nodes.push(node);
    const reports = reportsOf(id).filter((k) => k.status === "active");
    const leaders = reports.filter((k) => reportsOf(k.id).length || (depth === 0 && (k.role !== "employee" || p.role === "supervisor")));
    const crew = reports.filter((k) => !leaders.includes(k));
    kids.set(id, []);
    leaders.forEach((k) => { links.push({ source: id, target: k.id }); kids.get(id).push(walk(k.id, depth + 1)); });
    if (crew.length) {
      const t = { id: `${id}-team`, name: `Team of ${crew.length}`, kind: "team", size: crew.length, of: id, depth: depth + 1 };
      nodes.push(t); kids.set(t.id, []); kids.get(id).push(t); links.push({ source: id, target: t.id });
    }
    return node;
  };
  const root = walk(rootId, 0);
  // A branch's slice is sized by its leaves, but a lone node on the first ring still gets room for its label (weight 4).
  const leaves = (n) => (kids.get(n.id).length ? kids.get(n.id).reduce((s, k) => s + leaves(k), 0) : n.depth === 1 ? 4 : 1);
  const place = (n, a0, a1) => {
    const a = (a0 + a1) / 2, r = n.depth * 150;
    n.fx = Math.cos(a) * r; n.fy = Math.sin(a) * r;
    let at = a0;
    const total = leaves(n);
    kids.get(n.id).forEach((k) => { const span = ((a1 - a0) * leaves(k)) / total; place(k, at, at + span); at += span; });
  };
  place(root, -Math.PI, Math.PI);
  return { nodes, links };
}

function palette() {
  const cs = getComputedStyle(document.documentElement), v = (n) => cs.getPropertyValue(n).trim();
  return { ok: v("--accent"), medium: v("--warning"), high: v("--error"), team: v("--text-faint"), link: v("--border-strong"), text: v("--text"), muted: v("--text-muted"), ring: v("--accent-text") };
}

function TeamMap({ root, selected, onSelect, onDropTask }) {
  const box = useRef(null), graph = useRef(null);
  const [theme] = useTheme();
  const reduced = useReducedMotion();
  const data = useMemo(() => treeFor(root), [root]);
  useEffect(() => {
    let g, gone = false;
    import("force-graph").then(({ default: ForceGraph }) => {
      if (gone || !box.current) return;
      const c = palette();
      g = new ForceGraph(box.current)
        .graphData(structuredClone(data)).backgroundColor("rgba(0,0,0,0)")
        .nodeId("id")
        .linkColor(() => c.link).linkWidth(1.2)
        .nodeRelSize(5).nodeVal((n) => (n.kind === "team" ? 1 + n.size / 6 : 3))
        .nodeLabel((n) => (n.kind === "team" ? `${n.name}, reporting to ${person(n.of).name}` : `${n.name}, ${n.title}: ${LOAD_WORD[n.load]}`))
        .nodeCanvasObject((n, ctx, scale) => {
          const r = n.kind === "team" ? 4 + n.size / 5 : 7;
          ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = n.kind === "team" ? c.team : c[n.load]; ctx.globalAlpha = n.kind === "team" ? 0.45 : 1; ctx.fill(); ctx.globalAlpha = 1;
          if (n.id === graph.current?.selected) { ctx.lineWidth = 2.5 / scale; ctx.strokeStyle = c.ring; ctx.beginPath(); ctx.arc(n.x, n.y, r + 4, 0, 2 * Math.PI); ctx.stroke(); }
          // labels thin out with depth so the middle never piles up: the first ring always, deeper rings as you zoom in
          if (n.depth <= 1 || (n.depth === 2 && scale > 1.1) || scale > 2 || n.id === graph.current?.selected) {
            ctx.font = `${Math.max(10 / scale, 3)}px Inter Variable, sans-serif`; ctx.textAlign = "center"; ctx.fillStyle = n.kind === "team" ? c.muted : c.text;
            ctx.fillText(n.kind === "team" ? n.name : n.name.split(" ")[0], n.x, n.y + r + 11 / scale);
          }
        })
        .nodePointerAreaPaint((n, color, ctx) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, 2 * Math.PI); ctx.fill(); })
        .onNodeClick((n) => onSelect(n.kind === "team" ? n.of : n.id))
        .cooldownTicks(1) // positions are fixed by treeFor; nothing to simulate
        .onEngineStop(() => g.zoomToFit(reduced ? 0 : 400, 24));
      graph.current = g;
      const ro = new ResizeObserver(() => box.current && g.width(box.current.clientWidth).height(box.current.clientHeight));
      ro.observe(box.current);
      g._ro = ro;
    });
    return () => { gone = true; g?._ro?.disconnect(); g?._destructor?.(); };
  }, [data, theme, reduced]);
  useEffect(() => { if (graph.current) { graph.current.selected = selected; graph.current.nodeColor(graph.current.nodeColor()); } }, [selected]);

  // Drop a task chip on the canvas: assign it to the nearest person under the pointer.
  const onDrop = (e) => {
    e.preventDefault();
    const g = graph.current, task = e.dataTransfer.getData("text/task");
    if (!g || !task) return;
    const rect = box.current.getBoundingClientRect();
    const pt = g.screen2GraphCoords(e.clientX - rect.left, e.clientY - rect.top);
    const hit = g.graphData().nodes.map((n) => ({ n, d: Math.hypot(n.x - pt.x, n.y - pt.y) })).sort((a, b) => a.d - b.d)[0];
    if (hit && hit.d < 24) onDropTask(task, hit.n.kind === "team" ? hit.n.of : hit.n.id);
  };
  return <div ref={box} className="team-map" aria-hidden="true" onDragOver={(e) => e.preventDefault()} onDrop={onDrop} />;
}

function Outline({ id, onSelect, depth = 0 }) {
  const p = person(id);
  const kids = reportsOf(id).filter((k) => k.status === "active");
  const leaders = kids.filter((k) => reportsOf(k.id).length);
  const crew = kids.length - leaders.length;
  const label = <><button type="button" className="link" onClick={() => onSelect(id)}>{p.name}</button> <span className="muted small">{p.title} · {p.tasks} open tasks{load(p) !== "ok" ? `, ${LOAD_WORD[load(p)]}` : ""}{crew ? ` · team of ${crew}` : ""}</span></>;
  if (!leaders.length) return <li>{label}</li>;
  return (
    <li>
      <details open={depth < 1}>
        <summary>{label}</summary>
        <ul role="list">{leaders.map((k) => <Outline key={k.id} id={k.id} onSelect={onSelect} depth={depth + 1} />)}</ul>
      </details>
    </li>
  );
}

function Directory({ people }) {
  const [q, setQ] = useState("");
  const [site, setSite] = useState("all");
  const [limit, setLimit] = useState(40);
  const list = people.filter((p) => (site === "all" || p.site === site) && `${p.name} ${p.title}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <section className="panel-card">
      <div className="card-head"><div><h2>Directory</h2><p className="card-sub">{people.length} people in your view</p></div></div>
      <div className="toolbar">
        <label>Search <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or job" /></label>
        <label>Site <select className="input" value={site} onChange={(e) => setSite(e.target.value)}>
          <option value="all">All</option>{[...SITES, { id: "hq", name: "Brisbane office" }].map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select></label>
      </div>
      <Table caption="People" head={["Name", "Job", "Site", "Reports to", "Shift", "Open tasks"]}
        keys={list.slice(0, limit).map((p) => [p.name])}
        rows={list.slice(0, limit).map((p) => [<PersonButton key={p.id} id={p.id} />, p.title, siteName(p.site), person(p.manager)?.name || "Group", p.shift, p.tasks])} />
      {list.length > limit && (
        <div className="table-more">
          <span className="muted small">Showing {limit} of {list.length}. Search or pick a site to narrow it down.</span>
          <button type="button" className="button" onClick={() => setLimit((n) => n + 40)}>Show 40 more</button>
        </div>
      )}
      <SourceNote ids={["sso", "hr"]} />
    </section>
  );
}

export default function People() {
  const persona = usePersona();
  const me = person(persona.person);
  const can = useCan();
  const toast = useToast();
  const root = ["gm", "security", "it", "hr"].includes(persona.id) ? PEOPLE.find((p) => p.role === "gm").id : me.id;
  const scoped = root === me.id ? [me, ...PEOPLE.filter((p) => isUnder(p, me.id))] : PEOPLE;
  const [selected, setSelected] = useState(root);
  const [view, setView] = useState("map");
  const open = useTasks().filter((t) => t.status !== "done").slice(0, 6);
  const [pick, setPick] = useState("");
  const assign = (taskId, to) => {
    const t = open.find((x) => x.id === taskId);
    update((s) => ({ tasks: { ...s.tasks, [taskId]: { ...s.tasks[taskId], assignee: to } } }));
    toast({ title: `Assigned "${t?.title}" to ${person(to).name}.`, tone: "good" });
    setSelected(to);
  };
  return (
    <>
      <section className="panel-card span-2">
        <div className="card-head">
          <div><h2>Team map</h2><p className="card-sub">Who reports to whom, coloured by workload: <span className="dot dot-ok" /> fine <span className="dot dot-medium" /> busy <span className="dot dot-high" /> overloaded</p></div>
          <div role="group" aria-label="View" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
            <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>Map</button>
            <button type="button" aria-pressed={view === "outline"} onClick={() => setView("outline")}>Outline</button>
          </div>
        </div>
        {view === "map" ? (
          <>
            <TeamMap root={root} selected={selected} onSelect={setSelected} onDropTask={assign} />
            <p className="muted small">The map is also an outline: switch to Outline for a keyboard and screen-reader version. Click a person to see their details.</p>
          </>
        ) : <ul className="outline" role="list"><Outline id={root} onSelect={setSelected} /></ul>}
        {can("assign") && (
          <div className="assign">
            <p className="small"><strong>Hand out work:</strong> drag a task onto a person on the map, or pick one and press Assign to give it to {person(selected).name}.</p>
            <ul className="chips" role="list">
              {open.map((t) => <li key={t.id}><span className="chip" draggable onDragStart={(e) => e.dataTransfer.setData("text/task", t.id)} title={`Assigned to ${person(t.assignee).name}`}>{t.title}</span></li>)}
            </ul>
            <div className="toolbar">
              <label>Task <select className="input" value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Choose a task</option>{open.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select></label>
              <button type="button" className="button button-primary" disabled={!pick} onClick={() => { assign(pick, selected); setPick(""); }}>Assign to {person(selected).name.split(" ")[0]}</button>
            </div>
          </div>
        )}
        <SourceNote ids={["sso", "hr", "tasks"]} />
      </section>
      <section className="panel-card"><PersonCard id={selected} /></section>
      <Directory people={scoped} />
    </>
  );
}

function isUnder(p, rootId) {
  for (let m = p.manager; m; m = person(m)?.manager) if (m === rootId) return true;
  return false;
}
