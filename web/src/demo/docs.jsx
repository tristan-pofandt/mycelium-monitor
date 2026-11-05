// Pieces of the Documents page that other pages may reuse: the scoped document list with the reviewer's decisions, the
// document preview (a fictional document drawn in HTML, not an image), state and confidence badges, and DocumentsCard for Home.
import { Link } from "react-router";
import { siteName } from "./data.js";
import { confWord, docScope, docState, entityName, waiting } from "./docs.js";
import { RoundLink, SourceNote } from "./bits.jsx";
import { audit, update, useCan, useDemo, usePersona } from "./store.js";
import "./docs.css";

export const money = (n) => (n < 0 ? "-" : "") + Math.abs(n).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
export const shortDate = (d) => d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });

// The documents this persona may see, with the decisions made in this browser (store `docs`).
export function useDocs() {
  const persona = usePersona();
  const decisions = useDemo((s) => s.docs);
  const docs = docScope(persona);
  const rank = (d) => (docState(d, decisions) === "flagged" ? 0 : 1);
  const queue = waiting(docs, decisions).sort((a, b) => rank(a) - rank(b) || b.found - a.found); // flagged first, then newest
  return { docs, decisions, state: (d) => docState(d, decisions), queue };
}

const STATE = {
  auto: ["badge-ok", "Straight through"], accepted: ["badge-ok", "Accepted"], review: ["badge-warn", "Waiting for review"],
  flagged: ["badge-bad", "Flagged"], rejected: ["badge-none", "Rejected"],
};
export const StateBadge = ({ state }) => <span className={`badge ${STATE[state][0]}`}>{STATE[state][1]}</span>;
export function ConfBadge({ c }) {
  const w = confWord(c);
  return <span className={`badge ${w === "High" ? "badge-ok" : w === "Medium" ? "badge-warn" : "badge-bad"}`}>{w}, {c}%</span>;
}

// A decision on one document: stored, logged and undoable.
export function decideDoc(d, verdict, { fields, what, toast, tone = "good" }) {
  update((s) => ({ docs: { ...s.docs, [d.id]: { verdict, ...(fields && Object.keys(fields).length ? { fields } : {}) } } }));
  audit(what);
  toast?.({ title: `${verdict === "accepted" ? "Accepted" : "Rejected"}: ${d.file}. Logged.`, tone, action: { label: "Undo", onClick: () => undoDoc(d) } });
}
export function undoDoc(d) {
  update((s) => { const x = { ...s.docs }; delete x[d.id]; return { docs: x }; });
  audit(`undid the decision on ${d.file}`);
}

const TITLES = { invoice: "Tax invoice", credit: "Adjustment note", receipt: "Receipt", fuel: "Tax invoice and receipt", travel: "Booking confirmation" };

// The document as it arrived, before anyone corrected anything.
export function DocPreview({ d }) {
  const f = d.fields;
  if (d.kind === "logbook") {
    return (
      <article className="doc-paper" aria-label={`Preview of ${d.file}`}>
        <header className="doc-top">
          <div><p className="doc-supplier">Vehicle logbook</p><p className="doc-faint">{f.vehicle}</p></div>
          <p className="doc-title">{f.period}</p>
        </header>
        <table className="doc-lines">
          <caption className="sr-only">Last 10 working days in the logbook</caption>
          <thead><tr><th scope="col">Date</th><th scope="col">Purpose</th><th scope="col" className="num">km</th></tr></thead>
          <tbody>{d.trips.map((t) => (
            <tr key={t.date.getTime()} className={t.missing ? "doc-gap" : ""}>
              <td>{t.date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</td>
              <td>{t.missing ? "No trips recorded" : t.purpose}</td><td className="num">{t.missing ? "" : t.km}</td>
            </tr>
          ))}</tbody>
          <tfoot><tr><td colSpan={2}>Business km for the period, of total</td><td className="num">{f.businessKm.toLocaleString()} of {f.totalKm.toLocaleString()}</td></tr></tfoot>
        </table>
        <p className="doc-faint">Driver signs each week. Odometer start and end on the back page.</p>
      </article>
    );
  }
  const ex = d.lines.reduce((s, l) => s + l.total, 0);
  return (
    <article className="doc-paper" aria-label={`Preview of ${d.file}`}>
      <header className="doc-top">
        <div><p className="doc-supplier">{f.supplier}</p><p className="doc-faint">ABN {d.abn} (fictional)</p></div>
        <p className="doc-title">{TITLES[d.kind]}</p>
      </header>
      <dl className="doc-meta">
        <dt>Number</dt><dd>{f.number}</dd>
        <dt>Date</dt><dd>{shortDate(f.date)}</dd>
        <dt>Bill to</dt><dd>{entityName(f.entity)}</dd>
        <dt>Deliver to</dt><dd>{siteName(f.site)}</dd>
        <dt>Your order</dt><dd>{d.po || "None quoted"}</dd>
      </dl>
      <table className="doc-lines">
        <caption className="sr-only">Lines on the document</caption>
        <thead><tr><th scope="col">Description</th><th scope="col" className="num">Amount</th></tr></thead>
        <tbody>{d.lines.map((l) => <tr key={l.desc}><td>{l.desc}</td><td className="num">{money(l.total)}</td></tr>)}</tbody>
        <tfoot>
          <tr><td>Subtotal</td><td className="num">{money(ex)}</td></tr>
          <tr><td>GST</td><td className="num">{money(f.gst)}</td></tr>
          <tr className="doc-total"><td>Total</td><td className="num">{money(f.amount)}</td></tr>
        </tfoot>
      </table>
      {d.note && <p className="doc-note">{d.note}</p>}
      {["invoice", "credit"].includes(d.kind) && <p className="doc-faint">Pay to BSB 000-000, account ending {d.bank} (fictional). Terms 30 days.</p>}
    </article>
  );
}

// For Home (the customisable Home registry): how many documents wait for review.
export function DocumentsCard() {
  const can = useCan();
  const { queue, state } = useDocs();
  if (!can("finance")) return null;
  const flagged = queue.filter((d) => state(d) === "flagged").length;
  return (
    <section className="panel-card">
      <div className="card-head">
        <div><h2>Documents</h2><p className="card-sub">Invoices, receipts and logbooks read from the folders you nominated</p></div>
        <RoundLink to="/documents?tab=review" label="Review documents" />
      </div>
      <p>{queue.length ? <><strong>{queue.length} documents waiting for review</strong>{flagged ? `, ${flagged} of them flagged` : ""}.</> : "Nothing waiting for review."}</p>
      <p className="muted small">Everything else went straight through. <Link to="/documents?tab=tax">See the tax pack</Link></p>
      <SourceNote ids={["ap_inbox", "docai"]} />
    </section>
  );
}
