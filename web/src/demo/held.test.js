import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { DEFAULT_GRANTS, DOOR_EVENTS, PEOPLE, PERSONAS, person } from "./data.js";
import { ASSUMPTIONS } from "./assumptions.js";
import { PersonCard } from "./bits.jsx";
import { doorReads, heldAbout, lookedAt, myDataFile, whoText } from "./held.js";

const base = { grants: DEFAULT_GRANTS, approvals: {}, requests: [], tasks: {}, newTasks: [], roleOf: {}, permits: [], permitEdits: {}, rollcalls: [], views: [], dataRequests: [], commuteOptOut: {}, roster: {} };
const cat = (id, personId, s = base) => heldAbout(personId, s).find((c) => c.id === id);
const employee = PERSONAS.find((p) => p.id === "employee").person;
// Personas, plus people with machine tickets, expiring certificates, a leaver and the office.
const sample = [...PERSONAS.map((p) => p.person), ...PEOPLE.filter((p) => p.certs.length).slice(0, 3).map((p) => p.id), PEOPLE.find((p) => p.status === "left").id, PEOPLE.find((p) => p.site === "hq" && p.role === "employee").id];

describe("heldAbout", () => {
  it("has every part of the record, each with its source, who can see it and how long it's kept", () => {
    const ids = heldAbout(employee, base).map((c) => c.id);
    for (const id of ["profile", "shift", "tasks", "card", "pay", "role", "skills", "doors", "roster", "leave", "permits", "rollcalls", "commute", "devices", "views"]) expect(ids).toContain(id);
    for (const c of heldAbout(employee, base)) {
      expect(ASSUMPTIONS.some((a) => a.id === c.source), `${c.id} source`).toBe(true);
      expect(c.who.length, c.id).toBeGreaterThan(0);
      expect(c.kept.length, c.id).toBeGreaterThan(0);
    }
  });

  it("covers every row the person dialog shows, so nothing is held that isn't listed", () => {
    for (const id of sample) {
      const { container } = render(createElement(MemoryRouter, null, createElement(PersonCard, { id })));
      const rows = [...container.querySelectorAll("dt")].map((d) => d.textContent);
      expect(rows.length).toBeGreaterThan(5);
      const held = heldAbout(id, base);
      const skills = held.find((c) => c.id === "skills").items.map((i) => i.label);
      for (const row of rows) {
        const covered = held.some((c) => c.fields.includes(row)) || skills.some((l) => l.startsWith(row));
        expect(covered, `${person(id).name}: "${row}"`).toBe(true);
      }
      cleanup();
    }
  });

  it("says who can see each part from the current grants, by role", () => {
    expect(cat("pay", employee).roles).toEqual(["hr"]);
    expect(cat("pay", employee).who).toBe("you and HR");
    expect(cat("doors", employee).who).toBe("you, your Site Manager, GM Operations and Security");
    expect(cat("profile", employee).who).toBe("you, your supervisor, your Site Manager, GM Operations, HR, Security and IT");
    // grants edited in Roles and permissions change the answer
    const s = { ...base, grants: { ...DEFAULT_GRANTS, gm: [...DEFAULT_GRANTS.gm, "pay"], security: DEFAULT_GRANTS.security.filter((c) => c !== "security") } };
    expect(cat("pay", employee, s).roles).toEqual(["gm", "hr"]);
    expect(cat("doors", employee, s).roles).not.toContain("security");
    // a role you hold yourself is just "you"
    expect(cat("profile", GMid()).roles).not.toContain("gm");
    expect(whoText([], false)).toBe("nobody");
  });

  it("keeps route alerts to consent: no postcode once they turn alerts off", () => {
    expect(cat("commute", employee).items[1].value).toMatch(/^4306/);
    const off = cat("commute", employee, { ...base, commuteOptOut: { [employee]: true } });
    expect(off.items.map((i) => i.value)).toEqual(["Off", "Not shared with Mycelium"]);
  });

  it("lists door reads from the last 30 days only, newest first, including their card's seeded reads", () => {
    const withSeeded = PEOPLE.find((p) => DOOR_EVENTS.some((e) => e.card === p.card));
    const reads = doorReads(withSeeded);
    expect(reads.length).toBeGreaterThan(10);
    expect(reads.every((e, i) => i === 0 || reads[i - 1].at >= e.at)).toBe(true);
    expect(reads.every((e) => e.at >= Date.now() - 30 * 864e5)).toBe(true);
    expect(DOOR_EVENTS.filter((e) => e.card === withSeeded.card).every((e) => reads.some((r) => r.at === +e.when))).toBe(true);
  });

  it("shows views of their own record only, newest first, with two fictional earlier ones", () => {
    const view = { at: Date.now(), viewer: "Shift Supervisor, Ipswich", viewerPersonId: person(employee).manager, personId: employee, why: "You're in their team" };
    const other = { ...view, personId: "p1" };
    const list = lookedAt(employee, { ...base, views: [view, other] });
    expect(list[0]).toBe(view);
    expect(list.length).toBe(3);
    expect(list.every((v) => v.personId === employee)).toBe(true);
    expect(cat("views", employee, { ...base, views: [view] }).items).toHaveLength(3);
  });

  it("downloads the person's own record and their correction requests", () => {
    const req = { id: "dr1", personId: employee, card: "Profile", text: "Wrong department", status: "Sent to HR" };
    const file = myDataFile(employee, { ...base, dataRequests: [req, { ...req, id: "dr2", personId: "p1" }] });
    expect(file.record.find((c) => c.id === "card").items[0].value).toBe(person(employee).card);
    expect(file.correctionRequests).toEqual([req]);
    expect(JSON.parse(JSON.stringify(file)).record.length).toBe(file.record.length);
  });
});

function GMid() { return PERSONAS.find((p) => p.id === "gm").person; }
