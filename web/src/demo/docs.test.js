import { describe, expect, it } from "vitest";
import { PERSONAS } from "./data.js";
import { DOCUMENTS, docScope, docState, effective, fbtSummary, gstByQuarter, included, reasons, routeDocument, spendByCategory, taxPackCsv, toCsv, waiting } from "./docs.js";

const high = { supplier: 99, number: 98, date: 97, amount: 99, gst: 96 };

describe("routeDocument", () => {
  it("sends a document straight through only when every field is over 95%", () => {
    expect(routeDocument({ conf: high })).toBe("auto");
    expect(routeDocument({ conf: { ...high, gst: 95 } })).toBe("review");
    expect(routeDocument({ conf: { ...high, number: 71 } })).toBe("review");
  });
  it("always flags a duplicate or changed bank details, whatever the confidence", () => {
    expect(routeDocument({ conf: high, checks: { duplicateOf: "d01" } })).toBe("flagged");
    expect(routeDocument({ conf: high, checks: { bankChanged: { was: "1234", invoices: 6 } } })).toBe("flagged");
  });
  it("sends a receipt with no purchase order and a logbook with missing trips to review", () => {
    expect(routeDocument({ conf: high, checks: { noPo: true } })).toBe("review");
    expect(routeDocument({ conf: high, checks: { missingTrips: 4 } })).toBe("review");
  });
});

describe("the seeded documents", () => {
  it("has about 40 files with each seeded case, and nothing that looks like a real ABN or a tax file number", () => {
    expect(DOCUMENTS.length).toBeGreaterThanOrEqual(38);
    expect(DOCUMENTS.filter((d) => d.checks.duplicateOf)).toHaveLength(1);
    expect(DOCUMENTS.filter((d) => d.checks.bankChanged)).toHaveLength(1);
    expect(DOCUMENTS.filter((d) => d.checks.noPo)).toHaveLength(1);
    expect(DOCUMENTS.filter((d) => d.checks.missingTrips)).toHaveLength(1);
    DOCUMENTS.filter((d) => d.abn).forEach((d) => expect(d.abn).toMatch(/^00 /));
    expect(JSON.stringify(DOCUMENTS)).not.toMatch(/tfn|tax file/i);
    DOCUMENTS.forEach((d) => expect(d.status).toBe(routeDocument(d)));
  });
  it("explains every flagged and review document in words", () => {
    DOCUMENTS.filter((d) => d.status !== "auto").forEach((d) => expect(reasons(d).length).toBeGreaterThan(0));
    const bank = DOCUMENTS.find((d) => d.checks.bankChanged);
    expect(reasons(bank).join(" ")).toMatch(/confirms the change by phone/);
    expect(reasons(bank).join(" ")).toMatch(/never triggers anything/);
  });
  it("keeps a site manager to their own site's documents", () => {
    const sm = PERSONAS.find((p) => p.id === "site_manager");
    expect(docScope(PERSONAS[0])).toHaveLength(DOCUMENTS.length);
    expect(docScope(sm).every((d) => d.fields.site === "ips")).toBe(true);
  });
});

describe("decisions and the tax pack", () => {
  const bank = DOCUMENTS.find((d) => d.checks.bankChanged);
  it("moves a document out of the queue once decided, with corrections applied", () => {
    const decisions = { [bank.id]: { verdict: "accepted", fields: { amount: "100", date: "2026-10-01" } } };
    expect(waiting(DOCUMENTS).some((d) => d.id === bank.id)).toBe(true);
    expect(waiting(DOCUMENTS, decisions).some((d) => d.id === bank.id)).toBe(false);
    expect(docState(bank, decisions)).toBe("accepted");
    const e = effective(bank, decisions[bank.id]);
    expect(e.fields.amount).toBe(100);
    expect(e.fields.date.getMonth()).toBe(9);
  });
  it("counts only straight-through and accepted documents", () => {
    const ids = included(DOCUMENTS).map((d) => d.id);
    expect(ids).not.toContain(bank.id);
    expect(included(DOCUMENTS, { [bank.id]: { verdict: "accepted" } }).map((d) => d.id)).toContain(bank.id);
    expect(included(DOCUMENTS, { [DOCUMENTS[0].id]: { verdict: "rejected" } }).map((d) => d.id)).not.toContain(DOCUMENTS[0].id);
  });
  it("adds GST per entity per quarter, splitting capital from other purchases, with credit notes as negatives", () => {
    const d = (amount, category, date, entity = "cv") => ({ kind: "invoice", fields: { amount, gst: amount / 11, category, entity, date: new Date(date) } });
    const rows = gstByQuarter([d(110, "Freight", "2026-08-03"), d(1100, "Plant and equipment", "2026-09-30"), d(-22, "Freight", "2026-07-15"), d(55, "Freight", "2026-10-02"), d(11, "Fuel", "2026-08-01", "rail")]);
    expect(rows).toHaveLength(3);
    const q3cv = rows.find((r) => r.entity === "cv" && r.quarter === "Jul to Sep 2026");
    expect(q3cv).toMatchObject({ g10: 1100, g11: 88, gst: 108, count: 3 });
    expect(spendByCategory([d(110, "Freight", "2026-08-03"), d(-22, "Freight", "2026-07-15")])).toEqual([{ category: "Freight", exGst: 80, count: 2 }]);
  });
  it("summarises logbooks and builds a CSV that quotes commas and says it isn't lodged", () => {
    const fbt = fbtSummary(DOCUMENTS);
    expect(fbt).toHaveLength(3);
    expect(fbt.filter((r) => r.missing)).toHaveLength(1);
    expect(toCsv([["a,b", 'say "hi"', 3]])).toBe('"a,b","say ""hi""",3');
    const csv = taxPackCsv(included(DOCUMENTS), 9);
    expect(csv).toMatch(/registered tax agent/);
    expect(csv).toMatch(/Nothing has been lodged/);
    expect(csv).toMatch(/not included: 9/);
  });
});
