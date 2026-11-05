import { describe, expect, it } from "vitest";
import { DEFAULT_RULES, EVENTS, GM, PEOPLE, PERSONAS, defaultLock, editMode, inScope, needsApproval } from "./data.js";

const rules = (overrides = {}) => DEFAULT_RULES.map((r) => ({ ...r, on: overrides[r.id] ?? r.on }));

describe("demo calendar rules", () => {
  it("asks for approval on long events and on shutdowns, audits and training, but never for the GM", () => {
    expect(needsApproval({ type: "Meeting", hours: 6 }, "supervisor", rules())).toBe(true);
    expect(needsApproval({ type: "Shutdown", hours: 1 }, "site_manager", rules())).toBe(true);
    expect(needsApproval({ type: "Meeting", hours: 2 }, "supervisor", rules())).toBe(false);
    expect(needsApproval({ type: "Shutdown", hours: 12 }, "gm", rules())).toBe(false);
    expect(needsApproval({ type: "Meeting", hours: 6 }, "supervisor", rules({ long: false }))).toBe(false);
  });

  it("locks senior events by default and lets juniors only request changes", () => {
    expect(defaultLock("site_manager", rules())).toBe("locked");
    expect(defaultLock("supervisor", rules())).toBe("open");
    const audit = EVENTS.find((e) => e.id === "e2"); // locked by a Site Manager
    const sup = PEOPLE.find((p) => p.role === "supervisor" && p.site === "acr");
    expect(editMode(audit, "supervisor", sup.id)).toBe("none");
    expect(editMode(EVENTS.find((e) => e.id === "e3"), "supervisor", sup.id)).toBe("request");
    expect(editMode(audit, "gm", GM.id)).toBe("edit");
  });

  it("scopes people by role", () => {
    const by = (id) => inScope(PERSONAS.find((p) => p.id === id)).length;
    expect(by("gm")).toBe(PEOPLE.length);
    expect(by("employee")).toBe(1);
    expect(by("supervisor")).toBeLessThan(by("site_manager"));
  });
});

describe("demo data stays stable", () => {
  // Reviewers' feedback names these people and cards; new data must come from its own seed (data.js, "Machines and skills").
  it("keeps the first people, the leavers and the door events", async () => {
    const { PEOPLE, LEAVERS, DOOR_EVENTS } = await import("./data.js");
    expect(PEOPLE.length).toBe(574);
    expect(PEOPLE.slice(0, 6).map((p) => `${p.name}|${p.card}`)).toEqual(["Morgan Reid|C-10401", "Blake Vu|C-10402", "Mia Anderson|C-10403", "Aisha Tran|C-10404", "Ben Mendes|C-10405", "Farid Kaur|C-10406"]);
    expect(PEOPLE.at(-1).name).toBe("Ethan Mendes");
    expect(LEAVERS.map((p) => p.name)).toEqual(["Dara Harris", "Nina Bianchi"]);
    expect(DOOR_EVENTS.slice(0, 3).map((d) => d.who)).toEqual(["Dara Harris (left)", "Grace Ueda", "Mia Harris"]);
  });
});

describe("skills", () => {
  it("counts only certified, unexpired tickets", async () => {
    const { qualified, dayOffset } = await import("./data.js");
    const p = { skills: [{ cert: "crane", status: "certified", expires: dayOffset(2) }, { cert: "forklift", status: "training", expires: null }] };
    expect(qualified(p, "crane")).toBe(true);
    expect(qualified(p, "crane", dayOffset(3))).toBe(false);
    expect(qualified(p, "forklift")).toBe(false);
  });
  it("leaves Toowoomba's afternoon shift one crane ticket that runs out in two days", async () => {
    const { PEOPLE, qualified, dayOffset } = await import("./data.js");
    const aft = PEOPLE.filter((p) => p.site === "twb" && p.shift === "Afternoon" && p.status === "active");
    expect(aft.filter((p) => qualified(p, "crane")).length).toBe(1);
    expect(aft.filter((p) => qualified(p, "crane", dayOffset(3))).length).toBe(0);
  });
});
