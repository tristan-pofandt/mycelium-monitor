import { describe, expect, it } from "vitest";
import { blocksOf, byPlacement, movePill } from "./pages.js";

// A stand-in for the pill element: records the keyframes it is asked to play.
const fakePill = () => {
  const pill = { style: {}, played: null, getAnimations: () => [], animate(frames) { pill.played = frames; return {}; } };
  return pill;
};
const edges = (clipPath) => clipPath.match(/inset\(([\d.]+)px ([\d.]+)px ([\d.]+)px ([\d.]+)px/).slice(1).map(Number); // top right bottom left

describe("stretching nav pill", () => {
  it("lets the leading edge move first in either direction, and ends exactly on the new tab", () => {
    const a = { l: 10, r: 300, top: 4, bottom: 4 }, b = { l: 200, r: 110, top: 4, bottom: 4 };
    const right = fakePill();
    movePill(right, a, b);
    const [, r1, , l1] = edges(right.played[6].clipPath); // a quarter of the way in
    expect(a.r - r1).toBeGreaterThan(l1 - a.l); // moving right: the right edge has travelled further
    expect(edges(right.played.at(-1).clipPath)).toEqual([4, 110, 4, 200]);

    const left = fakePill();
    movePill(left, b, a);
    const [, r2, , l2] = edges(left.played[6].clipPath);
    expect(b.l - l2).toBeGreaterThan(r2 - b.r); // moving left: the left edge leads
  });

  it("places the pill without animating on first paint or when nothing moves", () => {
    const p = fakePill();
    expect(movePill(p, null, { l: 5, r: 5, top: 4, bottom: 4 })).toBeNull();
    expect(p.played).toBeNull();
    expect(p.style.clipPath).toContain("inset(4px 5px 4px 5px");
  });
});

describe("page entrance order", () => {
  it("animates every grid child, gives each tile in a group its own turn, and leaves titles to their own track", () => {
    const root = document.createElement("div");
    root.innerHTML = `<div class="page-head"><h1><span class="rise-mask"><span class="rise">T</span></span></h1></div>
      <div class="greeting"><h1><span class="rise-mask"><span class="rise">Hi</span></span></h1><p class="state-line">ok</p></div>
      <dl class="kpis"><div class="kpi">a</div><div class="kpi">b</div></dl><p class="notice">n</p><section class="panel-card">c</section>`;
    expect(blocksOf(root).map((el) => el.className || el.tagName)).toEqual(["state-line", "kpi", "kpi", "notice", "panel-card"]);
  });

  it("orders blocks as they sit on screen: rows top to bottom, then left to right", () => {
    const at = (top, left) => { const el = document.createElement("div"); el.getBoundingClientRect = () => ({ top, left }); el.id = `${top}-${left}`; return el; };
    const els = [at(400, 0), at(100, 500), at(104, 0), at(400, 500)]; // source order: bottom-left first, as a grid can place them
    expect(byPlacement(els).map((el) => el.id)).toEqual(["104-0", "100-500", "400-0", "400-500"]);
  });
});
