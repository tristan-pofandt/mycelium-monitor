// Documents and tax: what Mycelium found today in the folders and inboxes it was pointed at (Inbox), the documents a person
// needs to check (Review), and the figures a registered tax agent would want (Tax pack). Read-only on the folders; it never
// pays, lodges or advises, and text inside a document never triggers anything.
import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { KpiTile, Table } from "../../charts.jsx";
import { EmptyState, HoldButton, rovingKeys, useToast } from "../../ui.jsx";
import { ENTITIES, PLACES, fmtAgo, siteName } from "../data.js";
import { CATEGORIES, FIELD_LABELS, KINDS, lcLabel, NUMBER_FIELDS, SOURCES, confWord, entityName, fbtSummary, gstByQuarter, included, reasons, sourceName, spendByCategory, taxPackCsv } from "../docs.js";
import { ConfBadge, DocPreview, StateBadge, decideDoc, money, shortDate, undoDoc, useDocs } from "../docs.jsx";
import { SourceNote } from "../bits.jsx";
import { SystemName } from "../feedback.jsx";
import { audit, useCan } from "../store.js";

const DAY = 864e5;

function Inbox({ open }) {
  const { docs, queue, state } = useDocs();
  const today = docs.filter((d) => Date.now() - d.found < DAY).sort((a, b) => b.found - a.found);
  return (
    <>
      <dl className="kpis">
        <KpiTile icon="doc" label="Files found in the last 24 hours" value={String(today.length)} />
        <KpiTile icon="check" label="Went straight through" value={String(today.filter((d) => d.status === "auto").length)} />
        <KpiTile icon="clock" label="Waiting for review" value={String(queue.filter((d) => state(d) === "review").length)} />
        <KpiTile icon="errors" label="Flagged" value={String(queue.filter((d) => state(d) === "flagged").length)} />
      </dl>
      <section className="panel-card">
        <div className="card-head"><div><h2>Found in the last 24 hours</h2><p className="card-sub">Every file read from the watched folders, where it came from, and where it went</p></div></div>
        <Table caption="Files found in the last 24 hours" head={["Found", "File", "From", "Kind", "Supplier or vehicle", "Amount", "Result"]}
          keys={today.map((d) => [-d.found.getTime(), d.file, sourceName(d.source), KINDS[d.kind], d.fields.supplier || d.fields.vehicle, d.fields.amount ?? 0, state(d)])}
          rows={today.map((d) => [fmtAgo(d.found), d.file, sourceName(d.source), KINDS[d.kind], d.fields.supplier || d.fields.vehicle,
            d.fields.amount === undefined ? "" : money(d.fields.amount),
            <span key="s" className="doc-result"><StateBadge state={state(d)} />{["review", "flagged"].includes(state(d)) && <button type="button" className="link small" onClick={() => open(d.id)}>Review<span className="sr-only"> {d.file}</span></button>}</span>])} />
        <p className="muted small">{docs.length - today.length} files from earlier days went through and are in the tax pack.</p>
        <SourceNote ids={["ap_inbox", "docai"]} />
      </section>
      <section className="panel-card">
        <h2>How a document is routed</h2>
        <ul className="doc-rules">
          <li><StateBadge state="auto" /> Over 95% sure of every field: it goes straight into the tax pack.</li>
          <li><StateBadge state="review" /> Less sure of any field, no matching purchase order, or a logbook with gaps: a person checks it.</li>
          <li><StateBadge state="flagged" /> A duplicate, or bank details that changed: always flagged, however sure the reader is.</li>
        </ul>
        <p className="muted small">Text inside a document never triggers anything, however it's worded. Mycelium never pays an invoice or changes <SystemName id="accounts" />: payments go through its own approvals, as today.</p>
        <SourceNote ids={["docai", "accounts"]} />
      </section>
      <WatchedFolders />
    </>
  );
}

function WatchedFolders() {
  return (
    <section className="panel-card span-2">
      <div className="card-head"><div><h2>Watched folders</h2><p className="card-sub">The only places Mycelium reads, nominated by your finance team</p></div></div>
      <ul className="queue" role="list">{SOURCES.map((s) => (
        <li key={s.id} className="queue-item">
          <p><strong>{s.name}</strong> <span className="muted small">· {s.where}</span></p>
          <p className="small"><span className="muted">Reads:</span> {s.reads}</p>
          <p className="small"><span className="muted">Skips:</span> {s.skips}</p>
        </li>
      ))}</ul>
      <ul className="doc-promises small">
        <li><strong>Read-only.</strong> It opens files; it never moves, changes or deletes them.</li>
        <li><strong>Nominated folders only,</strong> never whole drives or everyone's mailboxes.</li>
        <li><strong>Read inside your own cloud,</strong> by <SystemName id="docai" />. Files stay where they are; Mycelium keeps the fields it pulled out, a link to the file, and only the last four digits of bank accounts.</li>
      </ul>
      <SourceNote ids={["ap_inbox", "docai"]} />
    </section>
  );
}

const asInput = (k, v) => (k === "date" ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}` : String(v));
const show = (k, v) => (k === "date" ? shortDate(v) : k === "amount" || k === "gst" ? money(v) : k === "entity" ? entityName(v) : k === "site" ? siteName(v)
  : typeof v === "number" ? v.toLocaleString() : v);

function FieldInput({ k, value, onChange }) {
  const label = `${FIELD_LABELS[k]}, corrected`;
  const options = k === "category" ? CATEGORIES.map((c) => [c, c]) : k === "entity" ? ENTITIES.map((e) => [e.id, e.name]) : k === "site" ? PLACES.map((p) => [p.id, p.name]) : null;
  if (options) return <select className="input" aria-label={label} value={value} autoFocus onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
  return <input className="input" aria-label={label} autoFocus value={value} onChange={(e) => onChange(e.target.value)}
    type={k === "date" ? "date" : NUMBER_FIELDS.has(k) ? "number" : "text"} step={k === "amount" || k === "gst" ? "0.01" : undefined} />;
}

function ReviewDoc({ d, onDecided }) {
  const toast = useToast();
  const [edits, setEdits] = useState({});
  const flagged = d.status === "flagged";
  const changed = Object.keys(edits).filter((k) => edits[k] !== asInput(k, d.fields[k]));
  const fields = Object.fromEntries(changed.map((k) => [k, edits[k]]));
  const name = `${KINDS[d.kind].toLowerCase()} ${d.fields.number || d.fields.vehicle}${d.fields.supplier ? ` from ${d.fields.supplier}` : ""}`;
  const accept = (what) => { decideDoc(d, "accepted", { fields, toast, what }); onDecided(); };
  const reject = (what) => { decideDoc(d, "rejected", { toast, what, tone: "info" }); onDecided(); };
  const submit = (e) => { e.preventDefault(); accept(changed.length ? `corrected ${changed.map(lcLabel).join(", ")} and accepted ${name}` : `accepted ${name}`); };
  return (
    <form className="doc-fields" onSubmit={submit} aria-label={`Fields read from ${d.file}`}>
      <div className={`doc-why ${flagged ? "is-flagged" : ""}`} role="note">
        <p><StateBadge state={d.status} /> <strong>{flagged ? "Nothing is paid until a person decides" : "Why a person checks this"}</strong></p>
        <ul>{reasons(d).map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
      <ul className="doc-field-list" role="list">{Object.keys(d.conf).map((k) => {
        const editing = k in edits;
        return (
          <li key={k} className={confWord(d.conf[k]) === "High" ? "" : "is-unsure"}>
            <div className="doc-field-main">
              <span className="doc-field-label">{FIELD_LABELS[k]}</span>
              {editing ? <FieldInput k={k} value={edits[k]} onChange={(v) => setEdits((x) => ({ ...x, [k]: v }))} /> : <span className="doc-field-value">{show(k, d.fields[k])}</span>}
            </div>
            <div className="doc-field-side">
              <ConfBadge c={d.conf[k]} />
              {editing
                ? <button type="button" className="link small" onClick={() => setEdits((x) => { const y = { ...x }; delete y[k]; return y; })}>Keep what was read<span className="sr-only"> for {lcLabel(k)}</span></button>
                : <button type="button" className="link small" onClick={() => setEdits((x) => ({ ...x, [k]: asInput(k, d.fields[k]) }))}>Correct<span className="sr-only"> {lcLabel(k)}</span></button>}
            </div>
          </li>
        );
      })}</ul>
      <div className="actions">
        {!flagged && <button type="submit" className="button button-primary">{changed.length ? `Accept with ${changed.length} correction${changed.length > 1 ? "s" : ""}` : "Accept"}</button>}
        {d.checks.duplicateOf && <>
          <button type="button" className="button button-primary" onClick={() => reject(`rejected ${d.file} as a duplicate of an invoice already through`)}>Reject the copy</button>
          <HoldButton onConfirm={() => accept(`accepted ${name} although it looks like a duplicate`)}>Hold to accept anyway</HoldButton>
        </>}
        {d.checks.bankChanged && <>
          <HoldButton onConfirm={() => accept(`recorded a phone check of new bank details and accepted ${name}`)}>Hold: confirmed by phone, accept</HoldButton>
          <button type="button" className="button" onClick={() => reject(`rejected ${name} with changed bank details`)}>Reject</button>
        </>}
      </div>
      {d.checks.bankChanged && <p className="muted small">Accepting files the invoice. The new bank details and the payment still go through <SystemName id="accounts" />'s own approvals.</p>}
    </form>
  );
}

function Review({ selected, open }) {
  const { docs, decisions, queue, state } = useDocs();
  const head = useRef(null);
  const d = queue.find((x) => x.id === selected) || queue[0];
  const decided = docs.filter((x) => decisions[x.id]);
  const done = () => requestAnimationFrame(() => head.current?.focus());
  return (
    <>
      <section className="panel-card doc-review-card" aria-labelledby="review-h">
        <div className="card-head"><div>
          <h2 id="review-h" ref={head} tabIndex={-1}>{queue.length ? `${queue.length} waiting for review` : "Review"}</h2>
          <p className="card-sub">The document on the left as it arrived; on the right, what the reader pulled out and how sure it is</p>
        </div></div>
        {!d ? <EmptyState title="Nothing waiting for review.">New files from the watched folders land here when the reader isn't sure, or a check fails.</EmptyState> : (
          <div className="doc-review">
            <nav className="doc-queue" aria-label="Documents waiting">
              <ol role="list">{queue.map((x) => (
                <li key={x.id}><button type="button" aria-current={x.id === d.id ? "true" : undefined} onClick={() => open(x.id)}>
                  <span className="doc-q-file">{x.file}</span>
                  <span className="muted small block">{x.fields.supplier || x.fields.vehicle}</span>
                  <StateBadge state={state(x)} />
                </button></li>
              ))}</ol>
            </nav>
            <div className="doc-tray">
              <p className="muted small doc-from">{KINDS[d.kind]} · {sourceName(d.source)} · found {fmtAgo(d.found)}</p>
              <DocPreview d={d} />
            </div>
            <ReviewDoc key={d.id} d={d} onDecided={done} />
          </div>
        )}
        <SourceNote ids={["docai", "ap_inbox", "accounts"]} />
      </section>
      {decided.length > 0 && (
        <section className="panel-card">
          <h2>Decided in this browser</h2>
          <ul className="queue" role="list">{decided.map((x) => (
            <li key={x.id} className="queue-item is-done">
              <p><StateBadge state={decisions[x.id].verdict} /> {x.file} · {x.fields.supplier || x.fields.vehicle}
                {decisions[x.id].fields && ` · ${Object.keys(decisions[x.id].fields).length} corrected`}</p>
              <button type="button" className="link small" onClick={() => undoDoc(x)}>Undo<span className="sr-only"> the decision on {x.file}</span></button>
            </li>
          ))}</ul>
        </section>
      )}
    </>
  );
}

function TaxPack() {
  const can = useCan();
  const toast = useToast();
  const { docs, decisions, queue } = useDocs();
  const list = included(docs, decisions);
  const gst = gstByQuarter(list), spend = spendByCategory(list), fbt = fbtSummary(list);
  const total = spend.reduce((s, r) => s + r.exGst, 0);
  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob(["﻿", taxPackCsv(list, queue.length)], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: "brolga-tax-pack-for-your-tax-agent.csv" }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    audit("exported the tax pack CSV for the tax agent");
    toast({ title: "Tax pack saved as a CSV, made in your browser. Logged.", tone: "good" });
  };
  return (
    <>
      <p className="notice"><strong>For your registered tax agent.</strong> This prepares figures and a draft pack. It never lodges anything and gives no financial advice.
        Only accepted documents count{queue.length ? `: ${queue.length} still waiting for review aren't in these figures` : ""}.</p>
      <section className="panel-card">
        <div className="card-head"><div><h2>GST on purchases, by entity and quarter</h2>
          <p className="card-sub">BAS worksheet figures from invoices and receipts. Sales (G1 and 1A) come from <SystemName id="accounts" />, not from documents.</p></div></div>
        <Table caption="GST on purchases by entity and quarter" head={["Entity", "Quarter", "G10 capital purchases", "G11 other purchases", "1B GST on purchases", "Documents"]}
          keys={gst.map((r) => [entityName(r.entity), r.sort, r.g10, r.g11, r.gst, r.count])}
          rows={gst.map((r) => [entityName(r.entity), r.quarter, money(r.g10), money(r.g11), money(r.gst), r.count])} />
        <SourceNote ids={["docai", "accounts"]} />
      </section>
      <section className="panel-card">
        <div className="card-head"><div><h2>Spend by category</h2><p className="card-sub">Excluding GST. Which of it is deductible is for your tax agent to confirm.</p></div></div>
        <Table caption="Spend by category, excluding GST" head={["Category", "Spend ex GST", "Share", "Documents"]}
          keys={spend.map((r) => [r.category, r.exGst, r.exGst, r.count])}
          rows={spend.map((r) => [r.category, money(r.exGst), `${Math.round((r.exGst / total) * 100)}%`, r.count])} />
        <SourceNote ids={["docai"]} />
      </section>
      <section className="panel-card">
        <div className="card-head"><div><h2>Fringe benefits tax: logbooks</h2><p className="card-sub">Business use from each vehicle's 12-week logbook. Your tax agent works out the FBT.</p></div></div>
        <Table caption="FBT logbook summary" head={["Vehicle", "Site", "Business km", "Total km", "Business use", "Logbook"]}
          keys={fbt.map((r) => [r.vehicle, siteName(r.site), r.businessKm, r.totalKm, r.use, r.missing])}
          rows={fbt.map((r) => [r.vehicle, siteName(r.site), r.businessKm.toLocaleString(), r.totalKm.toLocaleString(), `${r.use}%`,
            r.missing ? <span key="m" className="badge badge-warn">{r.missing} days missing</span> : <span key="m" className="badge badge-ok">Complete</span>])} />
        {docs.some((d) => d.checks.missingTrips && !decisions[d.id]) && <p className="muted small">A logbook waiting for review isn't counted until someone accepts it.</p>}
        <SourceNote ids={["ap_inbox"]} />
      </section>
      <section className="panel-card doc-wide">
        <h2>Export for your tax agent</h2>
        <p className="muted small">One CSV: the GST summary, the logbook summary, and every document behind them, with where each came from. It's made in your browser from the demo's fictional data.</p>
        {can("export")
          ? <div className="actions"><button type="button" className="button button-primary" onClick={exportCsv}>Export CSV</button></div>
          : <p className="small">Your role can see the tax pack but not export it. Roles with "Export data" can.</p>}
      </section>
    </>
  );
}

const TABS = [{ id: "inbox", label: "Inbox" }, { id: "review", label: "Review" }, { id: "tax", label: "Tax pack" }];

export default function Documents() {
  const [params, setParams] = useSearchParams();
  const { queue } = useDocs();
  const tab = TABS.find((t) => t.id === params.get("tab")) || TABS[0];
  const open = (id) => setParams({ tab: "review", doc: id });
  return (
    <>
      <div className="toolbar" style={{ gridColumn: "1 / -1" }}>
        <div role="group" aria-label="Documents area" className="segmented" onKeyDown={(e) => rovingKeys(e, "button")}>
          {TABS.map((t) => <button key={t.id} type="button" aria-pressed={tab.id === t.id} onClick={() => setParams(t.id === "inbox" ? {} : { tab: t.id })}>
            {t.label}{t.id === "review" && queue.length ? ` (${queue.length})` : ""}</button>)}
        </div>
      </div>
      {tab.id === "review" ? <Review selected={params.get("doc")} open={open} /> : tab.id === "tax" ? <TaxPack /> : <Inbox open={open} />}
    </>
  );
}
