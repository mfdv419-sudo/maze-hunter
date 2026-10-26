import {startAdventureRoom,moveAdventurePlayer,adventureAbility,roomCapacity,type AdventureRoom} from './adventure-room';
import {
  center,
  modernMaze,
  modernSettings,
  clearSegment,
  visibleCells,
  type Difficulty,
  type Point,
} from "./maze";
import {
  actionCooldown,
  hitTargets,
  shrubKey,
  type ActionKind,
} from "./actions";
export interface Player {depth?:number;swimming?:boolean;
  uid: string;
  profileId: string;
  name: string;
  outfit: string;
  appearance?:import('../services/cosmetics').Appearance;
  ready: boolean;
  online: boolean;
  x: number;
  y: number;
  angle: number;
  lastMove: number;
  seq: number;
  finishedAt: number | null;
  slot: number;
  elevation?:number;
  climb?:import('./climbing').ClimbSave['phase'];
  jumpAt?: number;
  jumpBase?:number;
  jumpCount?:number;
  hitAt?: number;
}
export interface Match {
  area?:import('./areas').AdventureArea;
  adventure?:AdventureRoom;
  public?:boolean;
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
  broken?: Record<string, boolean>;
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
  if (Object.keys(room.players).length >= (room.adventure?roomCapacity[room.difficulty]:4)) throw Error("Room is full");
  const slots = Object.values(room.players).map((p) => p.slot);
  p.slot = Array.from({length:room.adventure?roomCapacity[room.difficulty]:4},(_,i)=>i).find((n) => !slots.includes(n))!;
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
    throw Error("All players must be ready");
  if(room.adventure){room.state='playing';room.startsAt=now+3000;startAdventureRoom(room,now);room.revision++;return room;}
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
  if(room.adventure)return moveAdventurePlayer(room,key,points,angle,seq,now);
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
  if(room.adventure)delete room.adventure.states[key];
  if (!Object.values(room.players).some((q) => q.uid === p.uid))
    delete room.owners[p.uid];
  if (room.host === key) room.host = Object.keys(room.players)[0] || "";
  if (room.state === "playing" && (!room.adventure||!Object.keys(room.players).length)) {
    room.state = "finished";
    room.finishedAt = now;
    room.winner = null;
  }
  room.revision++;
  return room;
}

export function performAction(
  room: Match,
  key: string,
  kind: ActionKind,
  now: number,
) {
  if(room.adventure){if(kind!=='jump'&&kind!=='hit'&&kind!=='dive'&&!['cake-normal','cake-red','cake-yellow','cake-green'].includes(kind))throw Error('Invalid action');return adventureAbility(room,key,kind,now);}
  if (kind !== "jump" && kind !== "hit") throw Error("Invalid action");
  const p = room.players[key];
  if (!p) throw Error("Not a room member");
  if (room.state !== "playing" || now < room.startsAt || p.finishedAt)
    throw Error("Match not active");
  if (now - room.startsAt >= modernSettings[room.difficulty].seconds * 1000) {
    room.state = "finished";
    room.finishedAt = now;
    room.revision++;
    return room;
  }
  const field = kind === "jump" ? "jumpAt" : "hitAt";
  if (now - (p[field] ?? -Infinity) < actionCooldown[kind])
    throw Error("Action cooling down");
  p[field] = now;
  if (kind === "hit") {
    const maze = modernMaze(room.difficulty, room.seed);
    room.broken ??= {};
    for (const q of hitTargets(maze, p, room.broken))
      room.broken[shrubKey(q)] = true;
  }
  room.revision++;
  return room;
}
