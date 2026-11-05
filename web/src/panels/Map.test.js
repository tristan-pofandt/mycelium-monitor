import { describe, expect, it } from "vitest";
import { frame } from "./Map.jsx";

const lens = { fov: 50, aspect: 1, dir: { x: 0, y: 0, z: 1 } };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

describe("map camera framing", () => {
  it("looks at the cluster's centre from outside the map", () => {
    const { target, position } = frame([{ x: 90, y: 0, z: 0 }, { x: 110, y: 0, z: 0 }], { ...lens, outward: true });
    expect(target).toEqual({ x: 100, y: 0, z: 0 });
    expect(position.x).toBeGreaterThan(100); // turned to face the viewer, the rest of the map behind it
    expect(Math.abs(position.y) + Math.abs(position.z)).toBeLessThan(1e-9);
  });

  it("backs off further for a wider cluster and keeps the view direction when not turning", () => {
    const near = frame([{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }], lens);
    const far = frame([{ x: 0, y: 0, z: 0 }, { x: 400, y: 0, z: 0 }], lens);
    expect(dist(far.position, far.target)).toBeGreaterThan(dist(near.position, near.target));
    expect(far.position.x).toBeCloseTo(far.target.x);
    expect(far.position.z).toBeGreaterThan(far.target.z);
  });

  it("fits the narrower side of a tall view", () => {
    const pts = [{ x: -100, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }];
    expect(dist(frame(pts, { ...lens, aspect: 0.5 }).position, { x: 0, y: 0, z: 0 }))
      .toBeGreaterThan(dist(frame(pts, lens).position, { x: 0, y: 0, z: 0 }));
  });
});
