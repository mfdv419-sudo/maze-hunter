import { describe, it, expect } from "vitest";
import {
  moveSliding,
  clearSegment,
  visibleCells,
  route,
  center,
} from "../src/game/maze";
import { RetroState } from "../src/game/retro-state";
import {
  mergeProfile,
  unlocked,
  recordLevel,
  type Profile,
} from "../src/services/local";
const corridor = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [1, 1, 1, 1],
];
describe("Continuous movement and visibility", () => {
  it("slides along a wall when the perpendicular component is blocked", () => {
    const p = moveSliding(corridor, { x: 1.21, y: 1.5 }, -0.5, 1);
    expect(p.x).toBeGreaterThanOrEqual(1.2);
    expect(p.y).toBeCloseTo(2.5);
  });
  it("cannot tunnel through walls even with a huge movement delta", () => {
    const p = moveSliding(corridor, { x: 1.5, y: 1.5 }, 15, 0);
    expect(p.x).toBeLessThanOrEqual(2.8);
    expect(clearSegment(corridor, { x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 })).toBe(
      false,
    );
  });
  it("does not reveal cells behind opaque walls", () => {
    const g = [
        [1, 1, 1, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1],
      ],
      v = visibleCells(g, { x: 1.5, y: 1.5 }, 10);
    expect(v.has("2,1")).toBe(true);
    expect(v.has("3,1")).toBe(false);
  });
});
describe("Retro lifecycle", () => {
  it("lifting a finger does not change lives; pausing stops the timer", () => {
    const s = new RetroState(1);
    s.start();
    s.tick(5);
    s.phase = "paused";
    s.tick(10);
    expect(s.elapsed).toBe(5);
    expect(s.lives).toBe(3);
  });
  it("invalid segments never teleport and one explicit mistake costs one life", () => {
    const s = new RetroState(1);
    s.start();
    const old = { ...s.position };
    expect(s.trace({ x: -1, y: -1 })).toBe(false);
    expect(s.position).toEqual(old);
    s.mistake();
    expect(s.lives).toBe(2);
  });
  it("a valid path wins and rates actual performance", () => {
    const s = new RetroState(1);
    s.start();
    for (const p of route(
      s.config.maze.grid,
      s.config.maze.start,
      s.config.maze.finish,
    ))
      s.trace(center(p));
    expect(s.phase).toBe("won");
    expect(s.rating).toBe(3);
    s.tick(999);
    expect(s.elapsed).toBe(0);
  });
  it("time/life exhaustion end exactly once; retry creates clean state", () => {
    const s = new RetroState(3);
    s.start();
    for (let i = 0; i < 5; i++) s.mistake();
    expect(s.lives).toBe(0);
    expect(s.reason).toBe("lives");
    const t = new RetroState(3);
    t.start();
    t.tick(99999);
    expect(t.phase).toBe("lost");
    expect(t.reason).toBe("time");
    expect(new RetroState(3).lives).toBe(3);
  });
});
function profile(): Profile {
  return {
    id: "p",
    name: "Explorer",
    language: "id",
    outfit: "classic",
    retro: {},
    modernWins: 0,
    updatedAt: 1,
  };
}
describe("Family progress merge", () => {
  it("retains best stars/time and does not unlock across missing levels", () => {
    const a = profile(),
      b = profile();
    recordLevel(a, 1, { seconds: 20, stars: 3, errors: 0 });
    recordLevel(b, 1, { seconds: 15, stars: 1, errors: 2 });
    recordLevel(b, 3, { seconds: 20, stars: 2, errors: 1 });
    const m = mergeProfile(a, b);
    expect(m.retro["1"]).toEqual({ seconds: 15, stars: 3, errors: 0 });
    expect(unlocked(m)).toBe(2);
  });
});
