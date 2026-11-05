import { describe, expect, it } from "vitest";
import { DEFAULT_GRANTS, PERSONAS } from "./data.js";
import { DEFAULT_LAYOUTS, HOME_CARDS } from "./homecards.jsx";
import { addable, allowed, cardById, layoutFor, move } from "./layout.js";

const ids = (l) => l.map((x) => x.id);

describe("Home layouts", () => {
  it("DEFAULT_LAYOUTS cover every persona, only reference registry ids, and each role may have its own defaults", () => {
    const known = new Set(HOME_CARDS.map((c) => c.id));
    expect(known.size).toBe(HOME_CARDS.length);
    for (const p of PERSONAS) {
      const l = DEFAULT_LAYOUTS[p.id];
      expect(l?.length).toBeGreaterThan(0);
      l.forEach((x) => expect(known.has(x.id)).toBe(true));
      expect(ids(layoutFor(p.id, {}, DEFAULT_GRANTS))).toEqual(ids(l)); // nothing dropped with the default grants
    }
  });

  it("drops cards the role lost permission for and keeps the user's order for the rest", () => {
    const saved = { supervisor: [{ id: "weather", size: 2 }, { id: "tasks", size: 1 }, { id: "approvals", size: 1 }, { id: "today", size: 1 }] };
    const grants = { ...DEFAULT_GRANTS, supervisor: DEFAULT_GRANTS.supervisor.filter((c) => c !== "assign") };
    expect(layoutFor("supervisor", saved, grants)).toEqual([{ id: "weather", size: 2 }, { id: "approvals", size: 1 }, { id: "today", size: 1 }]);
  });

  it("drops unknown ids, duplicates, other personas' cards and sizes a card can't take", () => {
    const saved = { employee: [{ id: "gone" }, { id: "kpis-gm", size: 2 }, { id: "today", size: 3 }, { id: "today", size: 2 }, { id: "sites", size: 2 }] };
    expect(layoutFor("employee", saved, DEFAULT_GRANTS)).toEqual([{ id: "today", size: 1 }]);
  });

  it("falls back to the role's admin default, then DEFAULT_LAYOUTS", () => {
    const roleDefaults = { it: [{ id: "weather", size: 1 }, { id: "audit", size: 2 }] };
    expect(layoutFor("it", {}, DEFAULT_GRANTS, roleDefaults)).toEqual(roleDefaults.it);
    expect(layoutFor("it", { it: [{ id: "access-review", size: 1 }] }, DEFAULT_GRANTS, roleDefaults)).toEqual([{ id: "access-review", size: 1 }]);
    expect(layoutFor("gm", {}, DEFAULT_GRANTS, roleDefaults)).toEqual(DEFAULT_LAYOUTS.gm);
  });

  it("only offers cards the role may have", () => {
    const offer = ids(addable("supervisor", DEFAULT_LAYOUTS.supervisor, DEFAULT_GRANTS.supervisor));
    expect(offer).not.toContain("sites"); // the GM's site comparison
    expect(offer).not.toContain("documents");
    expect(offer).toEqual(expect.arrayContaining(["rollcall", "permits", "coverage", "skills", "mydata"]));
    expect(allowed(cardById("audit"), "employee", DEFAULT_GRANTS.employee)).toBe(false);
  });

  it("never offers a card wider than the persona's scope or someone else's records", () => {
    // The Site Manager has the "sites" permission but sees their own site only, so not the four-site comparison
    expect(ids(addable("site_manager", DEFAULT_LAYOUTS.site_manager, DEFAULT_GRANTS.site_manager))).not.toContain("sites");
    expect(layoutFor("site_manager", { site_manager: [{ id: "sites", size: 2 }, { id: "today", size: 1 }] }, DEFAULT_GRANTS)).toEqual([{ id: "today", size: 1 }]);
    // My IT tickets are the employee's own tickets
    for (const p of ["gm", "site_manager", "supervisor", "security", "it"]) expect(ids(addable(p, [], DEFAULT_GRANTS[p]))).not.toContain("tickets");
    expect(ids(addable("gm", DEFAULT_LAYOUTS.gm, DEFAULT_GRANTS.gm))).not.toContain("sites"); // already on the GM's Home
  });

  it("moves a card and ignores moves off either end", () => {
    const l = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(ids(move(l, 2, 0))).toEqual(["c", "a", "b"]);
    expect(move(l, 0, -1)).toBe(l);
  });
});
