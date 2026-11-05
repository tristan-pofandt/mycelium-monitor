import { describe, expect, it } from "vitest";
import { SITES, TODAY } from "./data.js";
import { PERMITS } from "./permits.js";
import { SCREENS, TARGET, daysSinceIncident, nextIndex, outputToday, permitCounts, screenOrder } from "./screens.js";

const H = 3600e3;

describe("daysSinceIncident", () => {
  it("falls inside 30 days only where SITES counts an incident", () => {
    for (const s of SITES) {
      const d = daysSinceIncident(s.id);
      expect(d).toBeGreaterThan(0);
      if (s.kpi.incidents) expect(d).toBeLessThanOrEqual(30); else expect(d).toBeGreaterThan(30);
    }
  });
  it("counts up a day at a time", () => {
    expect(daysSinceIncident("ips", new Date(TODAY.getTime() + 864e5))).toBe(daysSinceIncident("ips") + 1);
  });
});

describe("screenOrder", () => {
  const all = SCREENS.map((s) => s.id);
  it("shows every screen but the empty announcement by default", () => {
    expect(screenOrder({ announcement: "", screens: null })).toEqual(all.filter((id) => id !== "announcement"));
  });
  it("adds the announcement once there is one, in the screens' own order", () => {
    expect(screenOrder({ announcement: "  Toolbox talk at 2  ", screens: ["announcement", "safety"] })).toEqual(["safety", "announcement"]);
    expect(screenOrder({ announcement: "   ", screens: ["announcement"] })).toEqual(screenOrder({})); // never a blank wall
  });
  it("falls back to everything when nothing is ticked", () => {
    expect(screenOrder({ screens: [] })).toEqual(screenOrder({}));
  });
});

describe("nextIndex", () => {
  it("wraps both ways", () => {
    expect(nextIndex(5, 6)).toBe(0);
    expect(nextIndex(0, 6, -1)).toBe(5);
    expect(nextIndex(2, 6)).toBe(3);
    expect(nextIndex(0, 0)).toBe(0);
  });
});

describe("outputToday", () => {
  it("is nothing at 6:00 and the full target's share by the end of the day", () => {
    expect(outputToday("ips", TODAY.getTime() + 6 * H)).toEqual({ units: 0, due: 0, target: TARGET.ips });
    const end = outputToday("ips", TODAY.getTime() + 30 * H);
    expect(end.due).toBe(TARGET.ips);
    expect(end.units).toBeGreaterThan(TARGET.ips * 0.8);
    expect(end.units).toBeLessThan(TARGET.ips * 1.1);
  });
});

describe("permitCounts", () => {
  it("counts per area and type and carries no holders", () => {
    const rows = permitCounts(PERMITS.filter((p) => p.site === "ips"));
    expect(rows.reduce((n, r) => n + r.n, 0)).toBe(PERMITS.filter((p) => p.site === "ips").length);
    for (const r of rows) expect(Object.keys(r).sort()).toEqual(["area", "n", "type"]);
  });
});
