// Site plans for the map view (feature 4, docs/demo-features-plan.md): one schematic plan per site and the Brisbane office,
// in a 1000 x 600 space: zones (named rectangles), doors on zone edges, cameras, alarm points and machines. Plus 36 hours of
// door, camera, alarm and machine events per site, so the map can replay the last 24 hours. People per zone are counted from
// door events (in minus out), never stored, so the map and its table can't disagree. All fictional; no names, only counts.
import * as data from "./data.js";
import { LEAVERS, MACHINES, PLACES, TODAY, fmtDay } from "./data.js";

function rng(seed) { // mulberry32, as in data.js, with this feature's own seed so data.js's sequence never moves
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261104);

export const STEP = 5 * 60e3; // replay step
const M = 60e3, H = 3600e3;
export const NOW = Math.floor(Date.now() / STEP) * STEP;
export const REPLAY_START = NOW - 24 * H;
export const REPLAY_STEPS = (NOW - REPLAY_START) / STEP; // 288
export const fmtTime = (t) => `${t < TODAY.getTime() ? "Yesterday " : ""}${new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// zones: [id, name, x, y, w, h]. doors: name -> [from, to, x, y, orientation "h" | "v", label side "l" | "r" | "t" | "b"].
// "outside" is beyond the site fence. routes: [share of a shift, doors walked through on the way in]. cameras and alarms:
// [name, x, y, zone the alarm covers]. machines: MACHINES id -> [x, y].
const DEF = {
  acr: {
    zones: [["comms", "Comms room", 40, 40, 140, 200], ["stores", "Stores", 196, 40, 144, 200], ["office", "Office and reception", 40, 256, 300, 148],
      ["carpark", "Car park", 40, 420, 300, 140], ["assembly", "Assembly hall", 356, 40, 404, 520], ["dock", "Dock 3", 776, 300, 184, 260], ["test", "Brake test bay", 776, 40, 184, 244]],
    doors: { "Gate 1": ["outside", "carpark", 30, 490, "v", "r"], "Main entry": ["carpark", "office", 190, 412, "h", "r"], "Assembly hall": ["office", "assembly", 348, 330, "v", "r"],
      "Comms room": ["office", "comms", 110, 248, "h", "r"], "Dock 3": ["outside", "dock", 970, 430, "v", "l"] },
    routes: [[0.78, ["Gate 1", "Main entry", "Assembly hall"]], [0.14, ["Dock 3"]], [0.07, ["Gate 1", "Main entry"]], [0.01, ["Gate 1", "Main entry", "Comms room"]]],
    cameras: [["Gate 1", 120, 495], ["Car park 1", 300, 530], ["Assembly north", 720, 75], ["Dock 3", 925, 335], ["Comms room", 150, 120]],
    alarms: [["Perimeter fence", 500, 20, null], ["Comms room", 150, 170, "comms"]],
    machines: { "acr-rig": [868, 170], "acr-crane": [560, 300], "acr-fork": [868, 470] },
  },
  ips: {
    zones: [["carpark", "Car park", 40, 40, 260, 140], ["office", "Office and reception", 40, 196, 260, 204], ["comms", "Comms room", 40, 416, 140, 144],
      ["yard", "Yard", 316, 40, 644, 120], ["shop", "Machine shop", 316, 176, 384, 384], ["stores", "Stores", 716, 176, 244, 384]],
    doors: { "Main entry": ["outside", "office", 170, 188, "h", "r"], "Gate 2": ["outside", "yard", 970, 100, "v", "l"], "Machine shop": ["yard", "shop", 500, 168, "h", "r"],
      "Stores": ["yard", "stores", 840, 168, "h", "r"], "Comms room": ["office", "comms", 110, 408, "h", "r"] },
    routes: [[0.62, ["Gate 2", "Machine shop"]], [0.2, ["Gate 2", "Stores"]], [0.17, ["Main entry"]], [0.01, ["Main entry", "Comms room"]]],
    cameras: [["Gate 2", 930, 70], ["Yard", 620, 70], ["Machine shop east", 665, 215], ["Stores", 925, 525], ["Car park", 265, 110], ["Comms room", 150, 530]],
    alarms: [["Perimeter fence", 640, 20, null], ["Comms room", 150, 478, "comms"]],
    machines: { "ips-press1": [420, 260], "ips-press2": [615, 460], "ips-weld": [420, 380], "ips-fork": [838, 360] },
  },
  twb: {
    zones: [["carpark1", "Car park 1", 40, 40, 260, 160], ["office", "Office and reception", 40, 216, 260, 188], ["comms", "Comms room", 40, 420, 120, 140],
      ["carpark2", "Car park 2", 176, 420, 264, 140], ["shop", "Machine shop", 316, 40, 324, 364], ["foundry", "Foundry", 656, 40, 304, 520]],
    doors: { "Main entry": ["outside", "office", 170, 208, "h", "r"], "Gate 1": ["outside", "shop", 480, 30, "h", "r"], "Foundry": ["shop", "foundry", 648, 220, "v", "l"],
      "Comms room": ["office", "comms", 100, 412, "h", "r"] },
    routes: [[0.45, ["Gate 1"]], [0.45, ["Gate 1", "Foundry"]], [0.09, ["Main entry"]], [0.01, ["Main entry", "Comms room"]]],
    cameras: [["Gate 1", 530, 75], ["Office", 265, 300], ["Foundry east", 925, 300], ["Car park 2", 405, 525], ["Comms room", 128, 505]],
    alarms: [["Perimeter fence", 300, 580, null], ["Comms room", 130, 465, "comms"]],
    machines: { "twb-cnc": [470, 250], "twb-pour": [760, 180], "twb-crane": [830, 380] },
  },
  tsv: {
    zones: [["office", "Office and reception", 40, 40, 260, 220], ["comms", "Comms room", 40, 276, 140, 144], ["carpark", "Car park", 40, 436, 260, 124],
      ["workshop", "Workshop", 316, 40, 644, 360], ["yard", "Yard", 316, 416, 644, 144]],
    doors: { "Main entry": ["outside", "office", 30, 150, "v", "r"], "Workshop": ["outside", "workshop", 640, 30, "h", "r"], "Comms room": ["office", "comms", 110, 268, "h", "r"] },
    routes: [[0.8, ["Workshop"]], [0.19, ["Main entry"]], [0.01, ["Main entry", "Comms room"]]],
    cameras: [["Main entry", 265, 110], ["Workshop", 920, 80], ["Yard", 925, 525]],
    alarms: [["Perimeter gate", 640, 580, "yard"], ["Comms room", 150, 330, "comms"]],
    machines: { "tsv-crane": [640, 220], "tsv-fork": [500, 490] },
  },
  hq: {
    zones: [["lobby", "Lobby", 40, 40, 360, 520], ["level3", "Level 3 offices", 416, 40, 544, 360], ["comms", "Comms room", 416, 416, 184, 144], ["meeting", "Meeting rooms", 616, 416, 344, 144]],
    doors: { "Lobby": ["outside", "lobby", 30, 300, "v", "r"], "Level 3": ["lobby", "level3", 408, 200, "v", "r"], "Comms room": ["level3", "comms", 508, 408, "h", "r"] },
    routes: [[0.97, ["Lobby", "Level 3"]], [0.03, ["Lobby", "Level 3", "Comms room"]]],
    cameras: [["Lobby", 365, 110], ["Level 3", 925, 75], ["Comms room", 570, 520]],
    alarms: [["Comms room", 570, 468, "comms"]],
    machines: {},
  },
};

// Restricted doors other features add to data.js's DOORS (permits to work): where each sits, with the small room it guards.
const RESTRICTED = {
  "Press line 2 isolation cage": { zone: ["cage", "Press line 2 cage", 540, 400, 150, 150], door: ["shop", "cage", 540, 470, "v", "l"] },
  "Foundry hot-work bay": { zone: ["hotwork", "Hot-work bay", 806, 420, 144, 130], door: ["foundry", "hotwork", 806, 485, "v", "l"] },
  "Tank 2 confined space": { zone: ["tank2", "Tank 2", 590, 420, 150, 130], door: ["assembly", "tank2", 665, 420, "h", "t"] },
};

const doorObj = (site, name, [from, to, x, y, o, side]) => ({ id: `${site}-${slug(name)}`, kind: "door", site, name, from, to, x, y, o, side });

function buildPlan(site) {
  const d = DEF[site];
  const zones = d.zones.map(([id, name, x, y, w, h]) => ({ id, name, x, y, w, h, parent: null }));
  const doors = Object.entries(d.doors).map(([name, v]) => doorObj(site, name, v));
  // Doors the access system knows about (data.js DOORS, when exported) that this plan doesn't draw yet: placed as restricted
  // rooms when we know them, otherwise in a row along the bottom fence so they still show, can be focused and are listed.
  const known = new Set(doors.map((x) => x.name));
  const extra = (data.DOORS?.[site] || []).map((x) => (typeof x === "string" ? x : x.name)).filter((n) => n && !known.has(n));
  extra.forEach((name, i) => {
    const r = RESTRICTED[name];
    if (r && zones.some((z) => z.id === r.door[0])) {
      zones.push({ id: r.zone[0], name: r.zone[1], x: r.zone[2], y: r.zone[3], w: r.zone[4], h: r.zone[5], parent: r.door[0] });
      doors.push(doorObj(site, name, r.door));
    } else doors.push(doorObj(site, name, ["outside", null, 120 + i * 180, 580, "h", "t"])); // shortcut: unplaced doors count nobody; draw them in Setup's "place doors" step for real
  });
  const cameras = d.cameras.map(([name, x, y]) => ({ id: `${site}-cam-${slug(name)}`, kind: "camera", site, name, x, y }));
  const alarms = d.alarms.map(([name, x, y, zone]) => ({ id: `${site}-alarm-${slug(name)}`, kind: "alarm", site, name, x, y, zone }));
  const inZone = (x, y) => zones.filter((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h).at(-1)?.id || null;
  const machines = MACHINES.filter((m) => m.site === site).map((m, i) => {
    const [x, y] = d.machines[m.id] || [zones[0].x + 60 + i * 40, zones[0].y + zones[0].h / 2]; // a machine added later still shows
    return { id: m.id, kind: "machine", site, name: m.name, x, y, zone: inZone(x, y), initial: "running" };
  });
  const counted = new Set(doors.map((x) => x.to).filter(Boolean)); // a zone is counted when a card reader lets people into it
  zones.forEach((z) => { z.counted = counted.has(z.id); });
  return { site, name: PLACES.find((p) => p.id === site)?.name || site, w: 1000, h: 600, zones, doors, cameras, alarms, machines, routes: d.routes };
}

export const PLANS = Object.fromEntries(Object.keys(DEF).map((s) => [s, buildPlan(s)]));
export const objectsOf = (plan) => [...plan.doors, ...plan.cameras, ...plan.alarms, ...plan.machines];
export const findObject = (plan, id) => objectsOf(plan).find((o) => o.id === id);

// ── Events ──
// { id, site, at (ms), object (id or null for a note), kind, dir?: "in" | "out", result?: "Granted" | "Denied", state?, text?, sev? }
// A "Granted" read with a direction moves one person through the door; `state` changes an object's state from then on;
// `text` makes it a line in "What happened". Card reads carry no names.
const SHIFT_HOURS = { Day: [6, 14], Afternoon: [14, 22], Night: [22, 30], Office: [8, 17] };
const SITE_SHIFTS = { acr: ["Day", "Afternoon", "Night"], ips: ["Day", "Afternoon"], twb: ["Day", "Afternoon"], tsv: ["Day", "Afternoon"], hq: ["Office"] };

function pickRoute(routes) {
  let r = rand();
  for (const [share, doors] of routes) { if ((r -= share) <= 0) return doors; }
  return routes[0][1];
}

function generate(plan) {
  const { site } = plan;
  const out = [];
  const door = (name) => plan.doors.find((d) => d.name === name);
  const shifts = SITE_SHIFTS[site];
  const per = Math.round((PLACES.find((p) => p.id === site)?.staff || 40) / (shifts.length + 0.6));
  const push = (e) => { if (e.at <= NOW) out.push({ site, ...e }); };
  for (let day = -2; day <= 0; day++) {
    for (const sh of shifts) {
      const [a, b] = SHIFT_HOURS[sh];
      const start = TODAY.getTime() + day * 24 * H + a * H, end = TODAY.getTime() + day * 24 * H + b * H;
      if (start < NOW - 40 * H || start - 30 * M > NOW) continue; // whole shifts only, so every "out" has its "in"
      const n = sh === "Night" ? Math.round(per * 0.6) : per;
      for (let i = 0; i < n; i++) {
        const route = pickRoute(plan.routes).map(door);
        let t = start - (5 + rand() * 25) * M;
        route.forEach((d) => { push({ object: d.id, kind: "door", dir: "in", result: "Granted", at: Math.round(t) }); t += (1 + rand() * 3) * M; });
        t = end + rand() * 20 * M;
        [...route].reverse().forEach((d) => { push({ object: d.id, kind: "door", dir: "out", result: "Granted", at: Math.round(t) }); t += (1 + rand() * 2) * M; });
      }
      push({ object: null, kind: "note", at: start, text: sh === "Office" ? `Office day starts: ${n} people badged in` : `${sh} shift starts: ${n} people badged in` });
    }
  }
  const entries = plan.doors.filter((d) => d.to);
  for (let i = 0; i < 3; i++) {
    const d = entries[Math.floor(rand() * entries.length)];
    push({ object: d.id, kind: "door", dir: "in", result: "Denied", at: Math.round(NOW - rand() * 23 * H), text: `Card read denied at ${d.name} (no access to that area)`, sev: "low" });
  }
  return out;
}

const leaver = LEAVERS[0];
// The incidents the rest of the demo already talks about (SECURITY_ALERTS, CAMERAS, MACHINES), at the same times.
const FIXED = [
  { site: "twb", object: "twb-comms-room", kind: "door", state: "held", at: NOW - 9 * H, text: "Comms room door held open", sev: "high" },
  { site: "twb", object: "twb-comms-room", kind: "door", state: "closed", at: NOW - 9 * H + 14 * M, text: "Comms room door closed after 14 minutes" },
  { site: "ips", object: "ips-gate-2", kind: "door", dir: "in", result: "Granted", at: NOW - 5 * H, sev: "high",
    text: `Card ${leaver.card}, belonging to a former employee (left ${fmtDay(leaver.leftOn)}), let in at Gate 2` },
  { site: "ips", object: "ips-gate-2", kind: "door", dir: "out", result: "Granted", at: NOW - 5 * H + 22 * M, sev: "high", text: `Card ${leaver.card} left through Gate 2 after 22 minutes` },
  { site: "acr", object: "acr-cam-dock-3", kind: "camera", state: "offline", at: NOW - 6 * H, text: "Camera Dock 3 went offline", sev: "medium" },
  { site: "tsv", object: "tsv-alarm-perimeter-gate", kind: "alarm", state: "alarm", at: NOW - 20 * H, text: "Perimeter gate alarm", sev: "medium" },
  { site: "tsv", object: "tsv-alarm-perimeter-gate", kind: "alarm", state: "armed", at: NOW - 20 * H + 12 * M, text: "Patrol guard checked the gate; alarm reset" },
  { site: "twb", object: "twb-cam-foundry-east", kind: "camera", state: "offline", at: NOW - 30 * H, text: "Camera Foundry east went offline", sev: "medium" },
  { site: "twb", object: "twb-cam-car-park-2", kind: "camera", state: "offline", at: NOW - 50 * H, text: "Camera Car park 2 went offline", sev: "medium" },
  { site: "ips", object: "ips-press2", kind: "machine", state: "down", at: NOW - 7 * H, text: "Press line 2 stopped: hydraulic seal failure", sev: "medium" },
  { site: "twb", object: "twb-crane", kind: "machine", state: "maintenance", at: NOW - 30 * H, text: "Crane CR-04 taken out of service for its scheduled service" },
];
// Machines whose plant-data state isn't covered above get a change before the replay window, so their state matches MACHINES.
const fixedMachines = new Set(FIXED.filter((e) => e.kind === "machine").map((e) => e.object));
const MACHINE_EVENTS = MACHINES.filter((m) => m.state !== "running" && !fixedMachines.has(m.id)).map((m) => ({ site: m.site, object: m.id, kind: "machine", state: m.state, at: NOW - 26 * H, text: `${m.name}: ${m.state}` }));

// Card reads at restricted doors that other features seed in DOOR_EVENTS (permits to work): shown as lines, moving nobody,
// since nobody is seeded leaving those rooms.
const RESTRICTED_READS = (data.DOOR_EVENTS || []).filter((d) => RESTRICTED[d.door]).map((d) => ({
  site: d.site, object: `${d.site}-${slug(d.door)}`, kind: "door", result: d.result, at: d.when.getTime(), text: `Card ${d.card} read at ${d.door}: ${d.result.toLowerCase()}`,
  sev: (data.SECURITY_ALERTS || []).some((a) => a.site === d.site && a.title.includes(d.card)) ? "high" : undefined,
}));

export const EVENTS = Object.fromEntries(Object.values(PLANS).map((plan) => {
  const list = [...generate(plan), ...FIXED, ...MACHINE_EVENTS, ...RESTRICTED_READS].filter((e) => e.site === plan.site).sort((a, b) => a.at - b.at);
  return [plan.site, list.map((e, i) => ({ id: `${plan.site}-e${i}`, ...e }))];
}));

// People in each counted zone at time `at`, from door reads: a granted "in" moves one person from the door's outer side to its
// inner side, an "out" the other way. Zones without a reader are left out (the map says "Not counted").
export function zoneCounts(events, plan, at) {
  const counts = Object.fromEntries(plan.zones.filter((z) => z.counted).map((z) => [z.id, 0]));
  const doors = Object.fromEntries(plan.doors.map((d) => [d.id, d]));
  for (const e of events) {
    if (e.at > at) break; // events are sorted by time
    const d = doors[e.object];
    if (!d || !e.dir || e.result !== "Granted" || !d.to) continue;
    const [into, from] = e.dir === "in" ? [d.to, d.from] : [d.from, d.to];
    if (into in counts) counts[into] += 1;
    if (from in counts) counts[from] -= 1;
  }
  return counts;
}

const INITIAL = { door: "closed", camera: "online", alarm: "armed", machine: "running" };
// Each object's state at time `at`: { [id]: { state, since } }, from its starting state and every state change up to then.
export function stateAt(objects, events, at) {
  const out = Object.fromEntries(objects.map((o) => [o.id, { state: o.initial || INITIAL[o.kind] || "normal", since: null }]));
  for (const e of events) {
    if (e.at > at) break;
    if (e.state && out[e.object]) out[e.object] = { state: e.state, since: e.at };
  }
  return out;
}

// Preset incidents to jump the replay to, and where Security's alerts point on the map.
export const INCIDENTS = [
  { id: "twb-comms", site: "twb", label: "Comms room door held open, Toowoomba", at: NOW - 9 * H + 5 * M, focus: "twb-comms-room" },
  { id: "ips-leaver", site: "ips", label: "Former employee's card at Gate 2, Ipswich", at: NOW - 5 * H, focus: "ips-gate-2" },
  { id: "ips-press2", site: "ips", label: "Press line 2 stops, Ipswich", at: NOW - 7 * H, focus: "ips-press2" },
  { id: "acr-dock3", site: "acr", label: "Camera Dock 3 goes offline, Acacia Ridge", at: NOW - 6 * H, focus: "acr-cam-dock-3" },
  { id: "tsv-gate", site: "tsv", label: "Perimeter gate alarm, Townsville", at: NOW - 20 * H, focus: "tsv-alarm-perimeter-gate" },
].map((i) => ({ ...i, at: Math.round(i.at / STEP) * STEP }));
export const ALERT_FOCUS = {
  s1: { site: "ips", focus: "ips-gate-2" }, s2: { site: "twb", focus: "twb-comms-room" }, s3: { site: "acr", focus: "acr-cam-dock-3" },
  s4: { site: "tsv", focus: "tsv-alarm-perimeter-gate" }, s6: { site: "twb", focus: "twb-comms-room" }, s7: { site: "acr", focus: "acr-tank-2-confined-space" },
};
// Where the replay starts when "Show on map" opens an object: its preset incident, else its latest notable event in the last
// 24 hours (rounded up to a step, so the event is shown), else null for live.
export function focusTime(site, id) {
  const preset = INCIDENTS.find((i) => i.site === site && i.focus === id);
  if (preset) return preset.at;
  const e = (EVENTS[site] || []).filter((x) => x.object === id && x.text && x.at >= REPLAY_START).at(-1);
  return e ? Math.min(NOW, Math.ceil(e.at / STEP) * STEP) : null;
}
export const mapHref = (site, focus) => `/sites?site=${site}&view=map${focus ? `&focus=${encodeURIComponent(focus)}` : ""}`;
