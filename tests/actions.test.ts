import { describe, it, expect } from "vitest";
import { jumpHeight, shrubs, hitTargets, shrubKey } from "../src/game/actions";
import { modernMaze, moveSliding } from "../src/game/maze";
import {
  createMatch,
  addPlayer,
  startMatch,
  performAction,
  type Player,
} from "../src/game/room-state";
const player = (id: string): Player => ({
  uid: id,
  profileId: id,
  name: id,
  outfit: "classic",
  ready: true,
  online: true,
  x: 1.5,
  y: 1.5,
  angle: 0,
  lastMove: 0,
  seq: 0,
  finishedAt: null,
  slot: 0,
});
describe("Family-friendly Modern actions", () => {
  it("jumps return to ground and do not change planar wall collision", () => {
    expect(jumpHeight(0)).toBe(0);
    expect(jumpHeight(0.5)).toBeCloseTo(0.55);
    expect(jumpHeight(1)).toBeCloseTo(0);
    expect(jumpHeight(2)).toBe(0);
    const p = moveSliding(
      [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ],
      { x: 1.5, y: 1.5 },
      5,
      0,
    );
    expect(p.x).toBeLessThanOrEqual(1.8);
  });
  it("only optional dead-end shrubs are hittable and only at close range", () => {
    const m = modernMaze("medium", 42),
      points = shrubs(m);
    expect(points.length).toBeGreaterThan(0);
    const target = points[0];
    const hits = hitTargets(m, target, {});
    expect(hits).toContainEqual(target);
    expect(
      hitTargets(m, target, { [shrubKey(target)]: true }),
    ).not.toContainEqual(target);
    expect(hitTargets(m, { x: -10, y: -10 }, {})).toEqual([]);
    expect(
      m.entrances.some(
        (p) => p.x === Math.floor(target.x) && p.y === Math.floor(target.y),
      ),
    ).toBe(false);
  });
  it("server enforces action cooldown and records shared shrub state", () => {
    const r = createMatch(
      "ABC234",
      "a",
      player("a"),
      "coop",
      "medium",
      1000,
      42,
    );
    addPlayer(r, "b", player("b"), 1000);
    startMatch(r, "a", 1000);
    performAction(r, "a", "jump", 5000);
    expect(r.players.a.jumpAt).toBe(5000);
    expect(() => performAction(r, "a", "jump", 5100)).toThrow("cooling");
    const target = shrubs(modernMaze("medium", 42))[0];
    Object.assign(r.players.a, target);
    performAction(r, "a", "hit", 5200);
    expect(r.broken?.[shrubKey(target)]).toBe(true);
    expect(r.state).toBe("playing");
  });
});
