import { describe, expect, it } from "vitest";
import { DOOR_EVENTS, PEOPLE, SECURITY_ALERTS, TASKS, dayOffset } from "./data.js";
import { PERMITS, activePermits, canHold, needsPermit, permitFor, statusAt, whyNot } from "./permits.js";

const ev = (id) => DOOR_EVENTS.find((d) => d.id === id);

describe("permits to work", () => {
  it("permitFor: valid on a live permit, expired after it ends, none without one, null for ordinary doors", () => {
    expect(permitFor(ev("dp1"), ev("dp1").card, ev("dp1").when)).toBe("valid");
    expect(permitFor(ev("dp2"), ev("dp2").card, ev("dp2").when)).toBe("none");
    expect(permitFor(ev("dp3"), ev("dp3").card, ev("dp3").when)).toBe("expired");
    expect(permitFor({ site: "ips", door: "Gate 2" }, ev("dp1").card)).toBe(null);
  });

  it("permitFor: a closed permit stops counting from when it was closed", () => {
    const e = ev("dp1");
    const closed = PERMITS.map((p) => (p.id === "PTW-1041" ? { ...p, status: "closed", closedAt: +e.when - 60e3 } : p));
    expect(permitFor(e, e.card, e.when, closed)).toBe("expired");
  });

  it("canHold: needs a certified ticket that lasts the permit", () => {
    const p = { skills: [{ cert: "confined", status: "certified", expires: dayOffset(2) }, { cert: "hotwork", status: "training", expires: null }] };
    expect(canHold(p, "confined", dayOffset(1))).toBe(true);
    expect(whyNot(p, "confined", dayOffset(3))).toMatch(/confined-space ticket expires/);
    expect(whyNot(p, "hotwork")).toBe("still training for the hot-work ticket");
    expect(whyNot(p, "isolation")).toBe("needs the isolation ticket");
  });

  it("seeds valid holders, one expired permit, the press line 2 permit and the alert", () => {
    for (const p of PERMITS) expect(p.holders.every((id) => canHold(PEOPLE.find((x) => x.id === id), p.type, p.from))).toBe(true);
    expect(PERMITS.filter((p) => statusAt(p) === "expired").length).toBe(1);
    const t1 = TASKS.find((t) => t.id === "t1");
    expect(needsPermit(t1)).toBe("isolation");
    expect(activePermits("ips").some((p) => p.task === "t1")).toBe(true);
    expect(SECURITY_ALERTS.find((a) => a.source === "permits")?.site).toBe("acr");
  });
});
