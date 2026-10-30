import { describe, it, expect } from "vitest";
import {
  createMatch,
  addPlayer,
  startMatch,
  movePlayer,
  leaveMatch,
  type Player,
} from "../src/game/room-state";
import { modernMaze, center, route } from "../src/game/maze";
function player(uid: string): Player {
  return {
    uid,
    profileId: uid,
    name: uid,
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
  };
}
function room(mode: "race" | "coop" = "race") {
  const r = createMatch("ABC234", "a", player("a"), mode, "medium", 1000, 42);
  addPlayer(r, "b", player("b"), 1000);
  return startMatch(r, "a", 1000);
}
function finish(r: ReturnType<typeof room>, key: string, start: number) {
  const m = modernMaze(r.difficulty, r.seed),
    p = r.players[key];
  let now = start,
    seq = p.seq;
  for (const cell of route(m.grid, m.entrances[p.slot], m.finish).slice(1)) {
    now += 400;
    movePlayer(r, key, [center(cell)], 0, ++seq, now);
  }
  return now;
}
describe("Authoritative room reducers", () => {
  it("limits rooms to four and only allows host/ready start", () => {
    const r = createMatch(
      "ABC234",
      "a",
      player("a"),
      "race",
      "medium",
      1000,
      42,
    );
    for (const id of ["b", "c", "d"]) addPlayer(r, id, player(id), 1000);
    expect(() => addPlayer(r, "e", player("e"), 1000)).toThrow("full");
    expect(() => startMatch(r, "b", 1000)).toThrow("host");
    r.players.c.ready = false;
    expect(() => startMatch(r, "a", 1000)).toThrow("ready");
  });
  it("rejects wall crossings, teleporting, and replays", () => {
    const r = room();
    expect(() => movePlayer(r, "a", [{ x: 0, y: 0 }], 0, 1, 5000)).toThrow(
      "wall",
    );
    expect(() => movePlayer(r, "a", [{ x: 1.6, y: 1.5 }], 0, 1, 4001)).toThrow(
      "fast",
    );
    const p = { ...r.players.a };
    movePlayer(r, "a", [{ x: 1.5, y: 1.5 }], 0, 1, 5000);
    const accepted = { ...r.players.a };
    movePlayer(r, "a", [{ x: 2.5, y: 1.5 }], 0, 1, 5500);
    expect(r.players.a).toEqual(accepted);
    expect(p.x).toBe(accepted.x);
  });
  it("race has one winner and later arrivals cannot replace the result", () => {
    const r = room();
    const now = finish(r, "a", 4000);
    expect(r.state).toBe("finished");
    expect(r.winner).toBe("a");
    movePlayer(r, "b", [{ x: 1.5, y: 1.5 }], 0, 1, now + 1000);
    expect(r.winner).toBe("a");
  });
  it("co-op finishes only when every player has reached the exit", () => {
    const r = room("coop");
    finish(r, "a", 4000);
    expect(r.state).toBe("playing");
    finish(r, "b", 4000);
    expect(r.state).toBe("finished");
    expect(Object.keys(r.explored || {}).length).toBeGreaterThan(0);
  });
  it("leaving ends active games without fabricating a winner", () => {
    const r = room();
    leaveMatch(r, "a", 4500);
    expect(r.state).toBe("finished");
    expect(r.winner).toBeNull();
    expect(r.host).toBe("b");
  });
});
