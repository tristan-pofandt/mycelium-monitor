import { describe, expect, it } from "vitest";
import * as data from "./data.js";
import { ALERT_FOCUS, EVENTS, INCIDENTS, NOW, PLANS, REPLAY_START, findObject, objectsOf, stateAt, zoneCounts } from "./plans.js";

const { DOORS } = data;

const plan = {
  zones: [{ id: "yard", counted: true }, { id: "shop", counted: true }, { id: "carpark", counted: false }],
  doors: [{ id: "gate", from: "outside", to: "yard" }, { id: "shop-door", from: "yard", to: "shop" }],
};
const ev = (at, object, dir, result = "Granted") => ({ at, object, dir, result });

describe("zoneCounts", () => {
  it("counts in minus out per zone up to a time, ignoring denied reads and later events", () => {
    const events = [ev(1, "gate", "in"), ev(2, "gate", "in"), ev(3, "shop-door", "in"), ev(4, "gate", "in", "Denied"), ev(5, "shop-door", "out"), ev(9, "gate", "in")];
    expect(zoneCounts(events, plan, 3)).toEqual({ yard: 1, shop: 1 });
    expect(zoneCounts(events, plan, 5)).toEqual({ yard: 2, shop: 0 });
    expect(zoneCounts(events, plan, 0)).toEqual({ yard: 0, shop: 0 });
  });

  it("never goes below zero anywhere in the seeded 24 hours", () => {
    for (const [site, events] of Object.entries(EVENTS)) {
      for (let t = REPLAY_START; t <= NOW; t += 3600e3) {
        Object.values(zoneCounts(events, PLANS[site], t)).forEach((n) => expect(n).toBeGreaterThanOrEqual(0));
      }
    }
  });
});

describe("stateAt", () => {
  it("starts each object in its default state and applies state changes up to the time", () => {
    const objects = [{ id: "d", kind: "door" }, { id: "c", kind: "camera" }, { id: "m", kind: "machine", initial: "running" }];
    const events = [{ at: 10, object: "d", state: "held" }, { at: 20, object: "c", state: "offline" }, { at: 24, object: "d", state: "closed" }];
    expect(stateAt(objects, events, 5)).toEqual({ d: { state: "closed", since: null }, c: { state: "online", since: null }, m: { state: "running", since: null } });
    expect(stateAt(objects, events, 21).d).toEqual({ state: "held", since: 10 });
    expect(stateAt(objects, events, 21).c.state).toBe("offline");
    expect(stateAt(objects, events, 30).d).toEqual({ state: "closed", since: 24 });
  });

  it("replays the canonical incidents at the times the alerts give", () => {
    const at = (site, t) => stateAt(objectsOf(PLANS[site]), EVENTS[site], t);
    const twb = INCIDENTS.find((i) => i.id === "twb-comms");
    expect(at("twb", twb.at)["twb-comms-room"].state).toBe("held");
    expect(at("twb", twb.at + 20 * 60e3)["twb-comms-room"].state).toBe("closed");
    expect(at("acr", NOW)["acr-cam-dock-3"].state).toBe("offline");
    expect(at("acr", NOW - 7 * 3600e3)["acr-cam-dock-3"].state).toBe("online");
    expect(at("ips", NOW)["ips-press2"].state).toBe("down");
    expect(at("twb", REPLAY_START)["twb-crane"].state).toBe("maintenance");
    expect(EVENTS.ips.some((e) => e.object === "ips-gate-2" && e.sev === "high" && Math.abs(e.at - (NOW - 5 * 3600e3)) < 60e3)).toBe(true);
    expect(at("tsv", NOW)["tsv-alarm-perimeter-gate"].state).toBe("armed");
  });

  it("has a plan for every site and the office, with every incident's object on it", () => {
    expect(Object.keys(PLANS).sort()).toEqual(["acr", "hq", "ips", "tsv", "twb"]);
    INCIDENTS.forEach((i) => expect(findObject(PLANS[i.site], i.focus)).toBeTruthy());
    Object.entries(ALERT_FOCUS).forEach(([, f]) => expect(findObject(PLANS[f.site], f.focus)).toBeTruthy());
  });

  it("draws every door the access system lists, including restricted ones added later", () => {
    for (const [site, names] of Object.entries(DOORS || {})) {
      const drawn = PLANS[site].doors.map((d) => d.name);
      names.forEach((n) => expect(drawn).toContain(typeof n === "string" ? n : n.name));
    }
  });
});
