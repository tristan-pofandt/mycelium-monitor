import { describe, expect, it } from "vitest";
import { fitTabs } from "./shell.jsx";

describe("fitTabs", () => {
  it("hides nothing when every tab fits", () => {
    expect(fitTabs([100, 100, 100], 2, 304, 80, 0)).toEqual([]);
  });

  it("moves the tabs that don't fit into More, from the right", () => {
    // room 300, More 80: 100 + 2 fits (182), the next 100 would make 284, the third 386
    expect(fitTabs([100, 100, 100, 100], 2, 300, 80, 0)).toEqual([2, 3]);
  });

  it("always keeps the active tab in the row", () => {
    expect(fitTabs([100, 100, 100, 100], 2, 300, 80, 3)).toEqual([1, 2]);
  });

  it("keeps the active tab even when nothing else fits", () => {
    expect(fitTabs([100, 100], 2, 120, 80, 1)).toEqual([0]);
  });
});
