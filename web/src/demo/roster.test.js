import { describe, expect, it } from "vitest";
import { MACHINES, PEOPLE } from "./data.js";
import { DAYS, ROSTER, TEAMS, TODAY_INDEX, cellKey, fillGaps, isWork, leaveFrom, rosterDiff, rosterProblems, rosterWith, shiftFor, skillGaps } from "./roster.js";

const team = TEAMS.find((t) => t.site === "ips" && t.shift === "Day");
const everyday = { from: 0 }; // check both weeks whatever day the tests run
const kinds = (list) => list.map((p) => p.kind);
// someone in the team working days d and d + 1 in the base roster
const pair = () => { for (const p of team.members.slice(1)) for (let d = 7; d < 13; d++) if (isWork(ROSTER[p.id][d]) && isWork(ROSTER[p.id][d + 1])) return { p, d }; };

describe("skills: machines short of certified operators", () => {
  it("finds Toowoomba's afternoon shift without a crane ticket from 3 days out, and not before", () => {
    const crane = (d) => skillGaps(PEOPLE, MACHINES, d).find((g) => g.site === "twb" && g.shift === "Afternoon" && g.machine === "twb-crane");
    expect(crane(TODAY_INDEX + 2)).toBeUndefined();
    for (let d = TODAY_INDEX + 3; d < DAYS; d++) expect(crane(d)).toMatchObject({ have: 0, need: 1, day: d, name: "Crane CR-04" });
  });

  it("counts only who is rostered when given a roster", () => {
    const roster = rosterWith();
    const m = MACHINES.filter((x) => x.id === "ips-press1");
    expect(skillGaps(roster, m, 8)).toEqual([]);
    const off = Object.fromEntries(Object.keys(roster).map((id) => [id, roster[id].map(() => "Off")]));
    expect(skillGaps(off, m, 8)).toHaveLength(2); // Day and Afternoon both empty
  });
});

describe("roster rules", () => {
  it("starts clean at Ipswich and flags each broken rule once", () => {
    expect(rosterProblems(rosterWith(), { people: team.members, rules: everyday })).toEqual([]);
  });

  it("needs 10 hours' rest between shifts", () => {
    const { p, d } = pair();
    const roster = rosterWith({ [cellKey(p.id, d)]: "Afternoon" });
    const found = rosterProblems(roster, { people: [p], rules: everyday });
    expect(found).toContainEqual(expect.objectContaining({ kind: "rest", cell: cellKey(p.id, d + 1) }));
  });

  it("caps the week at 48 hours", () => {
    const p = team.members[3];
    const offs = [7, 8, 9, 10, 11, 12, 13].filter((d) => ROSTER[p.id][d] === "Off");
    expect(rosterProblems(rosterWith({ [cellKey(p.id, offs[0])]: "Day" }), { people: [p], rules: everyday })).toEqual([]); // six shifts, 48 h: fine
    const seven = rosterWith(Object.fromEntries(offs.map((d) => [cellKey(p.id, d), "Day"])));
    expect(kinds(rosterProblems(seven, { people: [p], rules: everyday }))).toContain("hours");
  });

  it("respects approved leave", () => {
    const { p, d } = pair();
    const found = rosterProblems(rosterWith(), { people: [p], leave: { [p.id]: [d] }, rules: everyday });
    expect(found).toEqual([expect.objectContaining({ kind: "leave", cell: cellKey(p.id, d) })]);
    // approved leave from Work lands in the roster as Leave, which is fine
    const leave = leaveFrom({ a2: "Approved" }); // 8 days from next Monday
    const who = Object.keys(leave)[0];
    expect(rosterWith({}, leave)[who].slice(7)).toEqual(Array(7).fill("Leave"));
  });

  it("flags a team below its headcount", () => {
    const off = Object.fromEntries(team.members.map((m) => [cellKey(m.id, 9), "Off"]));
    const found = rosterProblems(rosterWith(off), { people: team.members, rules: everyday });
    expect(found).toContainEqual(expect.objectContaining({ kind: "coverage", team: team.id, day: 9, have: 0, need: team.need }));
  });

  it("flags a machine with no certified operator, counting the whole site", () => {
    const twb = TEAMS.filter((t) => t.site === "twb" && t.shift === "Afternoon")[0];
    const found = rosterProblems(rosterWith(), { people: twb.members, rules: everyday });
    expect(found.some((x) => x.kind === "skill" && x.machine === "twb-crane" && x.day >= TODAY_INDEX + 3)).toBe(true);
  });
});

describe("fill gaps", () => {
  it("only suggests changes that keep every person rested, under the cap and off leave", () => {
    const people = TEAMS.filter((t) => t.site === "twb").flatMap((t) => t.members);
    const roster = rosterWith();
    const before = JSON.stringify(roster);
    const { suggestions, left } = fillGaps(roster, { people, rules: everyday });
    expect(JSON.stringify(roster)).toBe(before); // a suggestion, never applied
    expect(suggestions.length).toBeGreaterThan(0);
    const edits = Object.fromEntries(suggestions.map((s) => [s.key, s.shift]));
    const after = rosterProblems(rosterWith(edits), { people, rules: everyday });
    expect(after.filter((x) => ["rest", "hours", "leave"].includes(x.kind))).toEqual([]);
    expect(after.filter((x) => x.kind === "coverage" || x.kind === "skill")).toHaveLength(left.length);
  });
});

describe("hand-off and lookups", () => {
  it("counts shifts changed since the last send", () => {
    const [a, b] = team.members.slice(1, 3);
    const edits = { [cellKey(a.id, 8)]: "Off", [cellKey(b.id, 9)]: "Afternoon" };
    const ids = new Set(team.members.map((m) => m.id));
    expect(rosterDiff(edits, {}, ids)).toMatchObject({ people: 2, changes: [{ day: 8, to: "Off" }, { day: 9, to: "Afternoon" }] });
    expect(rosterDiff(edits, edits, ids).changes).toEqual([]);
  });

  it("says who works when, for other features", () => {
    const p = team.members[1];
    const state = { roster: { [cellKey(p.id, 8)]: "Night" }, approvals: {}, requests: [] };
    expect(shiftFor(p.id, 8, state)).toBe("Night");
    expect(shiftFor(p.id, 9, state)).toBe(ROSTER[p.id][9]);
    expect(shiftFor(PEOPLE[0].id, 8, state)).toBeNull(); // the GM isn't on a roster
  });
});
