import {
  center,
  modernMaze,
  modernSettings,
  clearSegment,
  visibleCells,
  type Difficulty,
  type Point,
} from "./maze";
export interface Player {
  uid: string;
  profileId: string;
  name: string;
  outfit: string;
  ready: boolean;
  online: boolean;
  x: number;
  y: number;
  angle: number;
  lastMove: number;
  seq: number;
  finishedAt: number | null;
  slot: number;
}
export interface Match {
  id: string;
  host: string;
  mode: "race" | "coop";
  difficulty: Difficulty;
  seed: number;
  state: "lobby" | "playing" | "finished";
  createdAt: number;
  startsAt: number;
  players: Record<string, Player>;
  owners: Record<string, boolean>;
  winner: string | null;
  finishedAt: number | null;
  expiresAt: number;
  revision: number;
  explored?: Record<string, boolean>;
}
export function createMatch(
  id: string,
  key: string,
  p: Player,
  mode: "race" | "coop",
  difficulty: Difficulty,
  now: number,
  seed: number,
): Match {
  return {
    id,
    host: key,
    mode,
    difficulty,
    seed,
    state: "lobby",
    createdAt: now,
    startsAt: 0,
    players: { [key]: p },
    owners: { [p.uid]: true },
    winner: null,
    finishedAt: null,
    expiresAt: now + 3600000,
    revision: 0,
  };
}
export function addPlayer(room: Match, key: string, p: Player, now: number) {
  if (room.state !== "lobby" || room.expiresAt < now)
    throw Error("Room is not available");
  if (room.players[key]) return room;
  if (Object.keys(room.players).length >= 4) throw Error("Room is full");
  const slots = Object.values(room.players).map((p) => p.slot);
  p.slot = [0, 1, 2, 3].find((n) => !slots.includes(n))!;
  room.players[key] = p;
  room.owners[p.uid] = true;
  room.revision++;
  return room;
}
export function startMatch(room: Match, key: string, now: number) {
  if (room.state !== "lobby" || room.host !== key)
    throw Error("Only the host can start");
  const players = Object.values(room.players);
  if (players.length < 2 || players.some((p) => !p.ready))
    throw Error("All 2–4 players must be ready");
  const maze = modernMaze(room.difficulty, room.seed);
  for (const p of players) {
    Object.assign(p, center(maze.entrances[p.slot]));
    p.lastMove = now + 3000;
    p.seq = 0;
    p.finishedAt = null;
  }
  room.state = "playing";
  room.startsAt = now + 3000;
  room.expiresAt = now + (modernSettings[room.difficulty].seconds + 120) * 1000;
  room.revision++;
  return room;
}
export function movePlayer(
  room: Match,
  key: string,
  points: Point[],
  angle: number,
  seq: number,
  now: number,
) {
  if (
    !Number.isSafeInteger(seq) ||
    seq < 1 ||
    !Number.isFinite(angle) ||
    !Array.isArray(points)
  )
    throw Error("Invalid movement");
  const p = room.players[key];
  if (!p) throw Error("Not a room member");
  if (room.state !== "playing" || now < room.startsAt) return room;
  if (now - room.startsAt >= modernSettings[room.difficulty].seconds * 1000) {
    room.state = "finished";
    room.finishedAt = now;
    return room;
  }
  if (p.finishedAt || seq <= p.seq) return room;
  if (points.length > 24 || !points.length)
    throw Error("Invalid movement batch");
  const maze = modernMaze(room.difficulty, room.seed);
  let position = { x: p.x, y: p.y },
    length = 0;
  for (const target of points) {
    if (
      !Number.isFinite(target.x) ||
      !Number.isFinite(target.y) ||
      !clearSegment(maze.grid, position, target, 0.2)
    )
      throw Error("Movement crosses a wall");
    length += Math.hypot(target.x - position.x, target.y - position.y);
    position = target;
  }
  const budget =
    Math.min(1.2, Math.max(0, (now - p.lastMove) / 1000)) * 2.7 + 0.07;
  if (length > budget) throw Error("Movement too fast");
  Object.assign(p, position, {
    angle: Number.isFinite(angle) ? angle : 0,
    lastMove: now,
    seq,
    online: true,
  });
  if (room.mode === "coop") {
    room.explored ??= {};
    for (const k of visibleCells(
      maze.grid,
      position,
      modernSettings[room.difficulty].vision,
    ))
      room.explored[k.replace(",", "_")] = true;
  }
  const f = center(maze.finish);
  if (Math.hypot(p.x - f.x, p.y - f.y) < 0.3) {
    p.finishedAt = now;
    if (room.mode === "race") {
      room.winner = key;
      room.state = "finished";
      room.finishedAt = now;
    } else if (Object.values(room.players).every((p) => p.finishedAt)) {
      room.state = "finished";
      room.finishedAt = now;
    }
  }
  room.revision++;
  return room;
}
export function leaveMatch(room: Match, key: string, now: number) {
  const p = room.players[key];
  if (!p) return room;
  delete room.players[key];
  if (!Object.values(room.players).some((q) => q.uid === p.uid))
    delete room.owners[p.uid];
  if (room.host === key) room.host = Object.keys(room.players)[0] || "";
  if (room.state === "playing") {
    room.state = "finished";
    room.finishedAt = now;
    room.winner = null;
  }
  room.revision++;
  return room;
}
