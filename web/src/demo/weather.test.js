import { describe, expect, it } from "vitest";
import { PEOPLE, PERSONAS } from "./data.js";
import { COMMUTE, ROADS, WARNINGS, activeOn, commuteMap, commuteRisk, rosterWeatherRisks } from "./weather.js";

const far = new Date(Date.now() + 365 * 864e5);
const road = { id: "r", road: "Test Rd", at: "Somewhere", status: "closed", from: new Date(0), until: far, postcodes: ["4306"], sites: ["ips"] };
const warning = { id: "w", kind: "Flood Watch", from: new Date(0), until: far, postcodes: ["4343"] };
const ppl = [{ id: "a", site: "ips", shift: "Day" }, { id: "b", site: "ips", shift: "Day" }, { id: "c", site: "twb", shift: "Day" }];

describe("commuteRisk", () => {
  it("returns nobody who hasn't opted in, even with a postcode that is cut off", () => {
    const commute = { a: { optIn: false, postcode: "4306" }, b: { optIn: true, postcode: "4306" }, c: { optIn: false, postcode: null } };
    expect(commuteRisk(ppl, [road], [warning], 0, commute).map((r) => r.id)).toEqual(["b"]);
  });

  it("uses postcode and consent only: a closure counts for the sites it cuts off, a warning wherever you work", () => {
    const commute = { a: { optIn: true, postcode: "4306" }, b: { optIn: true, postcode: "4000" }, c: { optIn: true, postcode: "4343" } };
    const risk = commuteRisk(ppl, [road], [warning], 0, commute);
    expect(risk.map((r) => r.id)).toEqual(["a", "c"]);
    expect(risk[0]).toMatchObject({ severity: "high", roads: [road] });
    expect(risk[1]).toMatchObject({ severity: "medium", warnings: [warning] });
    // same postcode, other site: the closure is not on their way
    expect(commuteRisk([{ id: "a", site: "twb" }], [road], [], 0, commute)).toEqual([]);
  });

  it("ignores lane closures and anything not in force that day", () => {
    const commute = { a: { optIn: true, postcode: "4306" } };
    expect(commuteRisk(ppl, [{ ...road, status: "lane" }], [], 0, commute)).toEqual([]);
    const later = { ...road, from: new Date(Date.now() + 3 * 864e5), until: null };
    expect(activeOn(later, 0)).toBe(false);
    expect(commuteRisk(ppl, [later], [], 0, commute)).toEqual([]);
  });
});

describe("demo commute data", () => {
  it("has about 70% opted in, and hands over no postcode without consent", () => {
    const all = Object.values(COMMUTE);
    expect(all).toHaveLength(PEOPLE.length);
    const share = all.filter((c) => c.optIn).length / all.length;
    expect(share).toBeGreaterThan(0.6);
    expect(share).toBeLessThan(0.8);
    expect(all.filter((c) => !c.optIn).every((c) => c.postcode === null)).toBe(true);
  });

  it("lets a person turn it off and back on", () => {
    const me = PERSONAS.find((p) => p.id === "employee").person;
    expect(COMMUTE[me]).toEqual({ optIn: true, postcode: "4306" });
    expect(commuteMap({ [me]: true })[me]).toEqual({ optIn: false, postcode: null });
    expect(commuteMap({ [me]: false })[me]).toEqual({ optIn: true, postcode: "4306" });
  });

  it("seeds the story: the Ipswich employee is cut off tomorrow but not today, and drops out when they opt out", () => {
    const me = PEOPLE.find((p) => p.id === PERSONAS.find((x) => x.id === "employee").person);
    expect(commuteRisk([me], ROADS, WARNINGS, 0)).toEqual([]);
    expect(commuteRisk([me], ROADS, WARNINGS, 1)[0].roads.map((r) => r.id)).toEqual(["r-cunningham"]);
    expect(commuteRisk([me], ROADS, WARNINGS, 1, commuteMap({ [me.id]: true }))).toEqual([]);
  });

  it("gives the roster planner a problem line per shift", () => {
    const [line] = rosterWeatherRisks("ips", 1, "Day", {});
    expect(line.text).toMatch(/at risk on tomorrow's day shift/);
    expect(line.people.length).toBeGreaterThan(0);
    expect(line.severity).toBe("high");
    expect(rosterWeatherRisks("tsv", 1, "Day", {})).toEqual([]);
  });
});
