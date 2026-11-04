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
