import { describe, it, expect } from "vitest";
import {
  retroConfig,
  retroMaze,
  modernMaze,
  modernSettings,
  distances,
  route,
  center,
  clearSegment,
} from "../src/game/maze";
describe("Retro 100-level campaign", () => {
  it("has 100 unique deterministic solvable levels in 10 regions", () => {
    const layouts = new Set<string>();
    for (let id = 1; id <= 100; id++) {
      const c = retroConfig(id),
        m = c.maze;
      expect(c.region).toBe(Math.floor((id - 1) / 10));
      expect(m.grid).toEqual(retroMaze(id).grid);
      layouts.add(JSON.stringify(m.grid));
      const path = route(m.grid, m.start, m.finish);
      expect(path.length).toBeGreaterThan(2);
      expect(c.seconds).toBeGreaterThan(path.length);
      for (let i = 1; i < path.length; i++)
        expect(clearSegment(m.grid, center(path[i - 1]), center(path[i]))).toBe(
          true,
        );
    }
    expect(layouts.size).toBe(100);
  });
  it("grows maze size each region and rejects out-of-range levels", () => {
    for (let r = 1; r < 10; r++)
      expect(retroMaze(r * 10 + 1).grid.length).toBeGreaterThan(
        retroMaze((r - 1) * 10 + 1).grid.length,
      );
    expect(() => retroMaze(0)).toThrow();
    expect(() => retroMaze(101)).toThrow();
  });
});
describe("Modern fair entrances", () => {
  it("provides 4 distinct reachable entrances with exactly equal shortest paths", () => {
    for (const difficulty of ["medium", "hard", "extreme"] as const)
      for (let seed = 1; seed <= 20; seed++) {
        const m = modernMaze(difficulty, seed),
          d = distances(m.grid, m.finish),
          lengths = m.entrances.map((p) => d.get(`${p.x},${p.y}`));
        expect(new Set(m.entrances.map((p) => JSON.stringify(p))).size).toBe(4);
        expect(lengths.every((n) => typeof n === "number" && n > 0)).toBe(true);
        expect(new Set(lengths).size).toBe(1);
      }
  });
  it("increases map size and reduces vision by difficulty", () => {
    expect(modernMaze("hard", 1).grid.length).toBeGreaterThan(
      modernMaze("medium", 1).grid.length,
    );
    expect(modernMaze("extreme", 1).grid.length).toBeGreaterThan(
      modernMaze("hard", 1).grid.length,
    );
    expect(modernSettings.extreme.vision).toBeLessThan(
      modernSettings.hard.vision,
    );
  });
});
