// Documents, invoices and tax (docs/demo-features-plan.md, feature 8): about 40 fictional files that Mycelium found in the folders
// and inboxes it was pointed at, with the fields machine learning pulled out of each, a confidence per field, and the checks that
// decide where each one goes. Every supplier name is invented; ABN-like numbers start with 00, which no real ABN does, and are
// labelled fictional. No tax file numbers anywhere. Own seed, so data.js's shared sequence is untouched.
import { ENTITIES, PLACES, dayOffset, person, siteName } from "./data.js";

function rng(seed) { // mulberry32, as in data.js
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const rand = rng(20261108);
const pick = (list) => list[Math.floor(rand() * list.length)];
const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
const cents = (n) => Math.round(n * 100) / 100;
const hoursAgo = (h) => new Date(Date.now() - h * 3600e3);

export const SOURCES = [
  { id: "ap_inbox", name: "Accounts payable mailbox", where: "ap@brolga.example (fictional address)",
    reads: "PDF and image attachments on mail sent to this address", skips: "Mail with no attachment, newsletters, and anything a person has marked private" },
  { id: "sharepoint", name: "SharePoint library: Finance, Supplier invoices", where: "One nominated library on the finance site",
    reads: "New and changed PDFs in this library", skips: "The HR and Board subfolders, drafts, and files someone has checked out" },
  { id: "scans", name: "Scanned receipts folder", where: "Where the office scanners save with Scan to folder",
    reads: "Images and PDFs from the scanners", skips: "Files over 20 MB, and anything that isn't an image or a PDF" },
];
export const sourceName = (id) => SOURCES.find((s) => s.id === id)?.name || id;

export const KINDS = { invoice: "Invoice", receipt: "Receipt", credit: "Credit note", logbook: "Vehicle logbook", fuel: "Fuel receipt", travel: "Travel" };
export const CATEGORIES = ["Raw materials", "Consumables", "Freight", "Repairs and maintenance", "Plant and equipment", "Safety gear", "Cleaning", "Utilities", "Fuel", "Travel"];
const CAPITAL = new Set(["Plant and equipment"]); // BAS G10; everything else is G11
export const FIELD_LABELS = { supplier: "Supplier", number: "Document number", date: "Date", amount: "Amount incl. GST", gst: "GST", category: "Category",
  entity: "Entity", site: "Site", vehicle: "Vehicle", period: "Logbook period", businessKm: "Business km", totalKm: "Total km" };
export const lcLabel = (k) => FIELD_LABELS[k][0].toLowerCase() + FIELD_LABELS[k].slice(1); // "amount incl. GST"
export const NUMBER_FIELDS = new Set(["amount", "gst", "businessKm", "totalKm"]);
const DOC_FIELDS = ["supplier", "number", "date", "amount", "gst", "category", "entity", "site"];
const LOG_FIELDS = ["vehicle", "period", "businessKm", "totalKm", "entity", "site"];

const fakeAbn = () => `00 ${int(100, 999)} ${int(100, 999)} ${int(100, 999)}`;
const SUPPLIERS = [
  { name: "Moorvale Fasteners", cat: "Consumables", kind: "invoice", lo: 380, hi: 2400, items: ["M12 hex bolts, zinc, box of 200", "Spring washers, assorted", "Nyloc nuts, M10"] },
  { name: "Tarrabine Steel Supply", cat: "Raw materials", kind: "invoice", lo: 4200, hi: 18500, items: ["Plate steel 10 mm, cut to size", "RHS 75 x 50 x 3, 8 m lengths", "Bright bar 40 mm"] },
  { name: "Kelbrook Freight Lines", cat: "Freight", kind: "invoice", lo: 260, hi: 3100, items: ["Linehaul Brisbane to Townsville", "Pallet delivery, tail-lift", "Fuel levy"] },
  { name: "Coorabin Industrial Gases", cat: "Consumables", kind: "invoice", lo: 190, hi: 1450, items: ["Argon cylinder rental", "Oxygen refill, G size", "Delivery"] },
  { name: "Yallaroo Electrical Services", cat: "Repairs and maintenance", kind: "invoice", lo: 520, hi: 6800, items: ["Call-out, after hours", "Replace contactor, press line 2", "Test and tag, 40 items"] },
  { name: "Weirbank Hydraulics", cat: "Repairs and maintenance", kind: "invoice", lo: 640, hi: 5200, items: ["Hydraulic hose assemblies", "Seal kit, 80 mm cylinder", "Labour, 4 hours"] },
  { name: "Glenmorra Safety Supply", cat: "Safety gear", kind: "invoice", lo: 210, hi: 2900, items: ["Safety boots, assorted sizes", "Hi-vis shirts, long sleeve", "Earplugs, box of 200"] },
  { name: "Pindari Facility Cleaning", cat: "Cleaning", kind: "invoice", lo: 900, hi: 3600, items: ["Monthly clean, amenities and offices", "Degreasing, workshop floor"] },
  { name: "Brindle Creek Power", cat: "Utilities", kind: "invoice", lo: 6400, hi: 21000, items: ["Electricity, business tariff, monthly", "Network charges"] },
  { name: "Arundel Machine Tools", cat: "Plant and equipment", kind: "invoice", lo: 12000, hi: 46000, items: ["Bench drill press, three-phase", "Bandsaw, 300 mm", "Install and commission"] },
  { name: "Ridgeway Fuel Stop", cat: "Fuel", kind: "fuel", lo: 70, hi: 260, items: ["Diesel"] },
  { name: "Skylark Regional Air", cat: "Travel", kind: "travel", lo: 280, hi: 790, items: ["Return flight, Brisbane to Townsville"] },
  { name: "Corella Lodge Hotels", cat: "Travel", kind: "travel", lo: 160, hi: 520, items: ["Accommodation, 1 night"] },
  { name: "Gundah Hardware", cat: "Consumables", kind: "receipt", lo: 25, hi: 340, items: ["Hardware, counter sale"] },
].map((s) => ({ ...s, abn: fakeAbn(), bank: String(int(1000, 9999)) }));
const supplier = (name) => SUPPLIERS.find((s) => s.name === name);

function confidence(keys, shaky) {
  const c = Object.fromEntries(keys.map((k) => [k, int(96, 99)]));
  if (shaky) for (let n = int(1, 2); n > 0; n--) c[pick(keys)] = int(62, 94);
  return c;
}

let seq = 0;
function makeDoc({ s, kind = s.kind, place = pick(PLACES), found, source, shaky = false, amount, checks = {}, number, po = true, ...rest }) {
  seq += 1;
  const total = amount ?? cents(int(s.lo, s.hi) + rand());
  const sign = kind === "credit" ? -1 : 1;
  const gst = cents(total / 11); // every supplier here charges GST
  const ex = cents(total - gst);
  const split = s.items.length > 1 && rand() < 0.6;
  const first = split ? cents(ex * (0.55 + rand() * 0.2)) : ex;
  const lines = split ? [{ desc: s.items[0], total: first }, { desc: s.items[1], total: cents(ex - first) }] : [{ desc: s.items[seq % s.items.length], total: ex }];
  const prefix = { invoice: "INV", credit: "CN", receipt: "RCT", fuel: "FR", travel: "BK" }[kind];
  const no = number || `${prefix}-${int(10000, 99999)}`;
  return {
    id: `d${String(seq).padStart(2, "0")}`, kind, source: source || (kind === "invoice" || kind === "credit" ? pick(["ap_inbox", "ap_inbox", "sharepoint"]) : "scans"),
    file: source === "scans" || (!source && !["invoice", "credit"].includes(kind)) ? `Scan_${no.replace(/\D/g, "")}.pdf` : `${no}.pdf`,
    found, abn: s.abn, bank: s.bank, lines: lines.map((l) => ({ ...l, total: sign * l.total })), po: po ? `PO-${int(4000, 4999)}` : null,
    fields: { supplier: s.name, number: no, date: dayOffset(-Math.round((Date.now() - found) / 864e5) - int(1, 6)), amount: sign * total, gst: sign * gst,
      category: s.cat, entity: place.entity, site: place.id },
    conf: confidence(DOC_FIELDS, shaky), checks, ...rest,
  };
}

const docs = [];
// Six earlier invoices from Moorvale, all to the same account: the history the changed-bank-details check compares against.
const moorvale = supplier("Moorvale Fasteners");
for (let i = 0; i < 6; i++) docs.push(makeDoc({ s: moorvale, place: PLACES.find((p) => p.id === "ips"), found: hoursAgo(24 * (100 - i * 16) + int(1, 9)), source: "ap_inbox" }));
// Everyday documents: ten found in the last day (some the model isn't sure about), the rest over the past four months.
const everyday = SUPPLIERS.filter((s) => s.name !== "Moorvale Fasteners");
for (let i = 0; i < 27; i++) {
  const recent = i < 10;
  const s = i === 12 || i === 20 ? supplier("Kelbrook Freight Lines") : everyday[(i * 3) % everyday.length]; // cycles through every supplier
  docs.push(makeDoc({ s, kind: i === 20 ? "credit" : s.kind, found: hoursAgo(recent ? 0.4 + i * 1.7 + rand() : int(30, 2900)), shaky: recent && rand() < 0.45 }));
}
// The seeded cases.
const steel = supplier("Tarrabine Steel Supply");
const original = makeDoc({ s: steel, place: PLACES.find((p) => p.id === "acr"), found: hoursAgo(24 * 9 + 3), source: "ap_inbox", amount: 14872.6, number: "INV-30418" });
docs.push(original);
const copy = makeDoc({ s: steel, place: PLACES.find((p) => p.id === "acr"), found: hoursAgo(2.2), source: "scans", amount: 14872.6, number: "INV-30418",
  checks: { duplicateOf: original.id } });
docs.push({ ...copy, lines: original.lines, fields: { ...copy.fields, date: original.fields.date } }); // a re-scan of the emailed original
docs.push(makeDoc({ s: moorvale, place: PLACES.find((p) => p.id === "ips"), found: hoursAgo(1.1), source: "ap_inbox", amount: 8934.4,
  bank: String((Number(moorvale.bank) + 4386) % 9000 + 1000), checks: { bankChanged: { was: moorvale.bank, invoices: 6 } },
  note: "Please note our bank details have changed. Update your records and pay this invoice today to avoid a late fee." }));
docs.push(makeDoc({ s: supplier("Weirbank Hydraulics"), kind: "receipt", place: PLACES.find((p) => p.id === "twb"), found: hoursAgo(4.6), source: "scans",
  amount: 1284.5, po: false, checks: { noPo: true } }));

// Vehicle logbooks for fringe benefits tax: 12-week logbooks, one with trips missing.
const PURPOSES = ["Parts pickup", "Supplier visit", "Site run to Toowoomba", "Customer delivery", "Depot run", "Bank and post", "Home (private)"];
function logbook({ vehicle, placeId, found, missing = [], shaky = false }) {
  seq += 1;
  const place = PLACES.find((p) => p.id === placeId);
  const trips = Array.from({ length: 10 }, (_, i) => {
    const day = dayOffset(-Math.round((Date.now() - found) / 864e5) - (10 - i));
    if (missing.includes(i)) return { date: day, missing: true };
    const purpose = pick(PURPOSES);
    return { date: day, purpose, km: int(12, purpose.includes("Toowoomba") ? 260 : 90), private: purpose.includes("private") };
  });
  const totalKm = int(5200, 8900);
  const businessKm = Math.round(totalKm * (0.55 + rand() * 0.35));
  return {
    id: `d${String(seq).padStart(2, "0")}`, kind: "logbook", source: "sharepoint", file: `Logbook_${vehicle.split(" (")[0].replace(/\s/g, "")}.xlsx`, found, trips,
    fields: { vehicle, period: `12 weeks to ${dayOffset(-Math.round((Date.now() - found) / 864e5)).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`,
      businessKm, totalKm, entity: place.entity, site: place.id },
    conf: confidence(LOG_FIELDS, shaky), checks: missing.length ? { missingTrips: 4 } : {},
  };
}
docs.push(logbook({ vehicle: "Ute 14 (fictional rego 000-UTE)", placeId: "ips", found: hoursAgo(3.4), missing: [2, 3, 6, 7] }));
docs.push(logbook({ vehicle: "Van 3 (fictional rego 000-VAN)", placeId: "acr", found: hoursAgo(24 * 12) }));
docs.push(logbook({ vehicle: "Ute 9 (fictional rego 000-UTN)", placeId: "twb", found: hoursAgo(24 * 20) }));

export const DOCUMENTS = docs.map((d) => ({ ...d, status: routeDocument(d) }));
export const doc = (id) => DOCUMENTS.find((d) => d.id === id);
export const entityName = (id) => ENTITIES.find((e) => e.id === id)?.name || id;

// ── Rules ──
// auto: over 95% on every field, straight through. review: a person checks it. flagged: a known fraud or double-payment pattern,
// whatever the confidence; a person decides, and nothing is ever paid from what a document says.
export function routeDocument(d) {
  if (d.checks?.duplicateOf || d.checks?.bankChanged) return "flagged";
  if (d.checks?.noPo || d.checks?.missingTrips) return "review";
  return Object.values(d.conf).every((c) => c > 95) ? "auto" : "review";
}
export const confWord = (c) => (c > 95 ? "High" : c >= 85 ? "Medium" : "Low");

// Where a document stands once the reviewer's decisions (store `docs`) are applied.
export const docState = (d, decisions = {}) => decisions[d.id]?.verdict || routeDocument(d);
export const waiting = (list, decisions = {}) => list.filter((d) => ["review", "flagged"].includes(docState(d, decisions)));

// A document with the reviewer's corrections applied. Corrections come back from localStorage as strings.
export function effective(d, decision) {
  const fields = { ...d.fields };
  for (const [k, v] of Object.entries(decision?.fields || {})) fields[k] = NUMBER_FIELDS.has(k) ? Number(v) : k === "date" ? new Date(`${v}T00:00`) : v;
  return { ...d, fields };
}
// What counts towards the tax pack: straight-through and accepted documents, with corrections.
export const included = (list, decisions = {}) => list.filter((d) => ["auto", "accepted"].includes(docState(d, decisions))).map((d) => effective(d, decisions[d.id]));

// Plain-English reasons a document is waiting, for the review screen.
export function reasons(d) {
  const out = [];
  const c = d.checks || {};
  if (c.duplicateOf) {
    const o = doc(c.duplicateOf);
    out.push(`Same supplier, number and amount as ${o.file}, which came in through the ${sourceName(o.source).replace(/^./, (c) => c.toLowerCase())} on ${o.found.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} and went through. Paying both would pay this invoice twice.`);
  }
  if (c.bankChanged) out.push(`Bank details differ from the last ${c.bankChanged.invoices} invoices from this supplier (account ending ${c.bankChanged.was}; this one says ending ${d.bank}). Nothing is paid from a document: someone confirms the change by phone with the supplier first, on the number already on file, not one printed on this invoice.`);
  if (d.note) out.push("The invoice asks to be paid today. Text inside a document never triggers anything in Mycelium, however it's worded.");
  if (c.noPo) out.push("No purchase order matches this supplier and amount in the finance system. Accepting files it as a receipt with no order; accounts payable still checks it before anything is paid.");
  if (c.missingTrips) out.push(`${c.missingTrips} working days in the logbook period have no trips recorded. The business-use figure for fringe benefits tax isn't final until the driver fills them in.`);
  const low = Object.entries(d.conf).filter(([, v]) => v <= 95);
  if (low.length) out.push(`The reader isn't sure about ${low.map(([k, v]) => `${lcLabel(k)} (${v}%)`).join(", ")}. Check ${low.length > 1 ? "them" : "it"} against the document.`);
  return out;
}

// Documents a persona may see: roles that cover every site see all of them, anyone else only their own site's.
export function docScope(persona, list = DOCUMENTS) {
  if (["gm", "security", "it", "hr"].includes(persona.id)) return list;
  const site = person(persona.person)?.site;
  return list.filter((d) => d.fields.site === site);
}

// ── Tax pack ──
const QUARTERS = ["Jan to Mar", "Apr to Jun", "Jul to Sep", "Oct to Dec"];
export const quarterOf = (date) => { const q = Math.floor(date.getMonth() / 3); return { key: `${date.getFullYear()}-${q}`, label: `${QUARTERS[q]} ${date.getFullYear()}` }; };

// BAS worksheet figures on the purchases side, per entity per quarter: G10 capital and G11 other purchases (GST included) and
// 1B, the GST on them. Credit notes count as negatives. Logbooks carry no GST.
export function gstByQuarter(list) {
  const rows = new Map();
  for (const d of list) {
    if (d.kind === "logbook") continue;
    const q = quarterOf(d.fields.date);
    const key = `${q.key}|${d.fields.entity}`;
    const r = rows.get(key) || { key, quarter: q.label, sort: q.key, entity: d.fields.entity, g10: 0, g11: 0, gst: 0, count: 0 };
    r[CAPITAL.has(d.fields.category) ? "g10" : "g11"] = cents(r[CAPITAL.has(d.fields.category) ? "g10" : "g11"] + d.fields.amount);
    r.gst = cents(r.gst + d.fields.gst);
    r.count += 1;
    rows.set(key, r);
  }
  return [...rows.values()].sort((a, b) => a.sort.localeCompare(b.sort) || a.entity.localeCompare(b.entity));
}

// Spend by category, excluding GST. Whether each line is deductible is for the tax agent to confirm.
export function spendByCategory(list) {
  const out = new Map();
  for (const d of list) {
    if (d.kind === "logbook") continue;
    const r = out.get(d.fields.category) || { category: d.fields.category, exGst: 0, count: 0 };
    r.exGst = cents(r.exGst + d.fields.amount - d.fields.gst);
    r.count += 1;
    out.set(d.fields.category, r);
  }
  return [...out.values()].sort((a, b) => b.exGst - a.exGst);
}

// Fringe benefits tax logbook summary: business use per vehicle from its 12-week logbook, and whether the logbook is complete.
export const fbtSummary = (list) => list.filter((d) => d.kind === "logbook").map((d) => ({
  id: d.id, vehicle: d.fields.vehicle, site: d.fields.site, entity: d.fields.entity, businessKm: d.fields.businessKm, totalKm: d.fields.totalKm,
  use: d.fields.totalKm ? Math.round((d.fields.businessKm / d.fields.totalKm) * 100) : 0, missing: d.checks?.missingTrips || 0,
}));

const cell = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const toCsv = (rows) => rows.map((r) => r.map(cell).join(",")).join("\r\n");
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// The CSV for the tax agent: a note, the GST summary, the FBT summary, then every document behind the figures.
export function taxPackCsv(list, left = 0) {
  return toCsv([
    ["Prepared by Mycelium for your registered tax agent. Fictional demo data. Nothing has been lodged, and this is not financial advice."],
    [`Documents still waiting for review and not included: ${left}`],
    [],
    ["GST on purchases (BAS worksheet)", "Quarter", "G10 capital purchases", "G11 other purchases", "1B GST on purchases", "Documents"],
    ...gstByQuarter(list).map((r) => [entityName(r.entity), r.quarter, r.g10.toFixed(2), r.g11.toFixed(2), r.gst.toFixed(2), r.count]),
    [],
    ["FBT logbook", "Site", "Entity", "Business km", "Total km", "Business use %", "Days missing"],
    ...fbtSummary(list).map((r) => [r.vehicle, siteName(r.site), entityName(r.entity), r.businessKm, r.totalKm, r.use, r.missing]),
    [],
    ["Document", "Kind", "Date", "Supplier", "Number", "Category", "Entity", "Site", "Amount incl. GST", "GST", "Source"],
    ...list.filter((d) => d.kind !== "logbook").map((d) => [d.file, KINDS[d.kind], iso(d.fields.date), d.fields.supplier, d.fields.number, d.fields.category,
      entityName(d.fields.entity), siteName(d.fields.site), d.fields.amount.toFixed(2), d.fields.gst.toFixed(2), sourceName(d.source)]),
  ]);
}
