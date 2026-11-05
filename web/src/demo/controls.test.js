import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CONTROLS, FRAMEWORKS, POLICY_CONTROL, controlStatus, evidenceContext, evidenceFor, inPeriod, packFiles, sha256 } from "./controls.js";
import { POLICIES } from "./data.js";

const D = 864e5;
const today = new Date(2026, 10, 5);
const ctl = { id: "x", period: 30 };
const at = (days) => ({ date: new Date(+today - days * D), what: "x" });

describe("audit evidence", () => {
  it("controlStatus: evidence when every item is inside the period", () => {
    expect(controlStatus(ctl, [at(1), at(29)], today)).toBe("evidence");
  });
  it("controlStatus: gap with no evidence, or with any finding", () => {
    expect(controlStatus(ctl, [], today)).toBe("gap");
    expect(controlStatus(ctl, [at(1), { ...at(0), gap: "card still active" }], today)).toBe("gap");
  });
  it("controlStatus: stale when any item is older than the control's period", () => {
    expect(controlStatus(ctl, [at(1), at(31)], today)).toBe("stale");
  });

  it("every control has a framework, a ref, a short title and a period; ids are unique", () => {
    const ids = new Set(CONTROLS.map((c) => c.id));
    expect(ids.size).toBe(CONTROLS.length);
    for (const c of CONTROLS) {
      expect(FRAMEWORKS.some((f) => f.id === c.framework)).toBe(true);
      expect(c.title.length).toBeLessThanOrEqual(40); // a short title, never standard text
      expect(c.ref.length).toBeLessThanOrEqual(8);
      expect(c.period).toBeGreaterThan(0);
    }
    for (const f of FRAMEWORKS) expect(CONTROLS.some((c) => c.framework === f.id)).toBe(true);
  });

  it("the word compliant never appears in the controls, the page or the pack", () => {
    for (const f of ["./controls.js", "./controls.jsx", "./pages/Audit.jsx"]) {
      expect(readFileSync(new URL(f, import.meta.url), "utf8")).not.toMatch(/\bcompliant\b/i);
    }
  });

  it("every Security policy points at an ISO 27001 control", () => {
    for (const p of POLICIES) expect(CONTROLS.find((c) => c.id === POLICY_CONTROL[p.policy].control)?.framework).toBe("iso27001");
  });

  it("evidence comes from the demo: the seeded gaps show, and the reviewer's clicks close them", () => {
    const ctx = evidenceContext({});
    const get = (id, c = ctx, sites) => evidenceFor(CONTROLS.find((x) => x.id === id), c, sites);
    const status = (id, c, sites) => controlStatus(CONTROLS.find((x) => x.id === id), get(id, c, sites), c.today);
    expect(status("iso45001-8.2", ctx)).toBe("gap"); // no roll-call drill yet
    expect(get("iso45001-8.2", ctx)[0].gap).toBe("No drill recorded in the last 6 months");
    expect(get("iso27001-7.2", ctx).some((e) => /former employee still active/.test(e.what))).toBe(true);
    expect(get("iso27001-7.6", ctx).some((e) => e.gap && /Tank 2/.test(e.what))).toBe(true); // the no-permit entry
    expect(status("e8-E8-8", ctx)).toBe("stale"); // the restore test is 200 days old
    // a drill at Ipswich closes that site's gap
    const drilled = evidenceContext({ rollcalls: [{ site: "ips", mode: "drill", startedAt: Date.now() - 2 * 3600e3, endedAt: Date.now() - 3600e3, total: 120, missing: 0, by: "x" }] });
    expect(status("iso45001-8.2", drilled, ["ips"])).toBe("evidence");
    // a cancelled card turns the first leaver into evidence
    expect(get("iso27001-7.2", evidenceContext({ revoked: { s1: "Card cancelled" } })).filter((e) => /former employee/.test(e.what) && !e.gap)).toHaveLength(1);
  });

  it("site scope: a site's evidence holds only that site's items and organisation-wide ones", () => {
    const ctx = evidenceContext({});
    for (const c of CONTROLS) expect(evidenceFor(c, ctx, ["ips"]).every((e) => e.site == null || e.site === "ips")).toBe(true);
  });

  it("the pack: hashes, a period filter that keeps findings, and the signing line", async () => {
    const ctx = evidenceContext({});
    const h = await sha256("abc");
    expect(h).toMatch(/^([0-9a-f]{64}|unavailable)/);
    if (h.length === 64) expect(h).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    const c = CONTROLS.find((x) => x.id === "e8-E8-8");
    const items = inPeriod(evidenceFor(c, ctx), 90, ctx.now);
    expect(items.some((e) => e.id === "restore")).toBe(false);
    const { md, csv } = packFiles({ framework: "e8", siteNames: ["All sites"], days: 90, builtAt: ctx.now, by: "GM", rows: [{ control: c, status: "stale", items: items.map((e) => ({ ...e, hash: "h" })) }] });
    expect(md).toMatch(/signed, and each hash checked against the tamper-evident audit log/);
    expect(csv.split("\n")[0]).toMatch(/sha256$/);
    expect(md).not.toMatch(/\bcompliant\b/i);
  });
});
