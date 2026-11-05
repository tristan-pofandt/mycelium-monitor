import { describe, expect, it } from "vitest";
import { VISITORS } from "./data.js";
import { TEAMS, cellKey } from "./roster.js";
import { PERMITS, activePermits } from "./permits.js";
import { PAST_ROLLCALLS, nameOf, reportOf, rollCall, rollCallSites, shiftAt, visitorId, zoneTally } from "./rollcall.js";

const blank = { roster: {}, approvals: {}, requests: [], permits: [], permitEdits: {} };
const at = Date.now();
const ids = (list) => list.map((e) => e.id);
// Acacia Ridge runs three shifts, so someone is always badged in whatever time the tests run.
const acr = (opts = {}) => rollCall("acr", at, { state: blank, ...opts });

describe("roll call: who to account for", () => {
  it("counts nobody twice across staff, visitors and the rostered-without-badge list", () => {
    const r = acr();
    expect(r.onSite.length).toBeGreaterThan(0);
    const all = [...ids(r.everyone), ...ids(r.rosteredNoBadge)];
    expect(new Set(all).size).toBe(all.length);
    expect(r.counts.onSite).toBe(r.counts.people + r.counts.visitors);
  });

  it("counts each signed-in visitor once, at reception", () => {
    const r = acr();
    const signedIn = VISITORS.filter((v) => v.site === "acr" && +v.since <= at).map(visitorId);
    expect(signedIn.length).toBeGreaterThan(0);
    expect(ids(r.visitors)).toEqual(signedIn);
    for (const id of signedIn) expect(ids(r.everyone).filter((x) => x === id)).toHaveLength(1);
    expect(r.visitors.every((v) => v.zone === "office")).toBe(true);
  });

  it("lists people rostered on but never badged in, without counting them on site", () => {
    // put every Acacia Ridge team member on the shift that's running, so more are expected than there are card reads
    const now = shiftAt(at);
    const roster = Object.fromEntries(TEAMS.filter((t) => t.site === "acr").flatMap((t) => t.members.map((m) => [cellKey(m.id, now.day), now.shift])));
    const r = acr({ state: { ...blank, roster } });
    expect(r.rosteredNoBadge.length).toBeGreaterThan(0);
    const here = new Set(ids(r.onSite));
    expect(r.rosteredNoBadge.some((x) => here.has(x.id))).toBe(false);
    expect(r.rosteredNoBadge.every((x) => x.shift === now.shift || x.shift === "Office")).toBe(true);
    expect(r.counts.noBadge).toBe(r.rosteredNoBadge.length);
  });

  it("puts live permit holders in the permit's area once, as contractors within the on-site count", () => {
    const live = activePermits("acr", at, PERMITS).find((p) => p.doors.includes("Tank 2 confined space"));
    expect(live).toBeTruthy();
    const r = acr();
    for (const id of live.holders) {
      expect(ids(r.onSite).filter((x) => x === id)).toHaveLength(1);
      expect(r.onSite.find((e) => e.id === id)).toMatchObject({ zone: "tank2", permit: live.id });
    }
    expect(r.contractors.every((c) => r.onSite.includes(c))).toBe(true);
  });

  it("applies ticks to the counts and the per-zone tally", () => {
    const first = acr().everyone;
    const ticks = { [first[0].id]: "safe", [first[1].id]: "missing" };
    const r = acr({ ticks });
    expect(r.counts).toMatchObject({ safe: 1, missing: 1, notYet: r.counts.onSite - 1 });
    const tally = zoneTally(r);
    expect(Object.values(tally).reduce((a, b) => a + b, 0)).toBe(r.everyone.filter((e) => e.tick !== "safe" && e.zone).length);
    const report = reportOf({ site: "acr", mode: "drill", startedAt: at, ticks, by: "GM" }, at + 60e3, r);
    expect(report.missing).not.toContain(first[0].id);
    expect(report.missing).toContain(first[1].id);
    expect(report.total).toBe(r.counts.onSite);
  });

  it("scopes who may run one, and names report ids", () => {
    expect(rollCallSites({ id: "site_manager", person: TEAMS.find((t) => t.site === "ips").lead.id })).toEqual(["ips"]);
    expect(rollCallSites({ id: "gm", person: "p1" })).toContain("twb");
    expect(nameOf(visitorId(VISITORS[0]))).toBe(VISITORS[0].name);
    expect(PAST_ROLLCALLS.every((r) => r.endedAt > r.startedAt)).toBe(true);
  });
});
