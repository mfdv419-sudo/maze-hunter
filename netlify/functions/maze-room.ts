import {stampRoom} from '../../src/game/room-sync';
import {voiceRoomAction} from '../../src/game/voice-room';
import {voiceConfig} from '../../src/game/voice-config';
import {clientRoom} from '../../src/game/room-view';
import {postRoomMessage} from '../../src/game/room-chat';
import {validArea} from '../../src/game/areas';
import {permittedAppearance,settleWardrobe,type WardrobeWallet} from '../../src/services/cosmetics';
import type {Profile} from '../../src/services/local';
import {roomCapacity} from '../../src/game/adventure-room';
import type { Handler } from "@netlify/functions";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getFirestore } from "firebase-admin/firestore";
import {
  performAction,
  createMatch,
  addPlayer,
  startMatch,
  movePlayer,
  leaveMatch,
  type Player,
  type Match,
} from "../../src/game/room-state";
import type { Difficulty, Point } from "../../src/game/maze";
function admin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      url = process.env.FIREBASE_DATABASE_URL;
    if (!raw || !url) throw Error("Room server is not configured");
    initializeApp({ credential: cert(JSON.parse(raw)), databaseURL: url });
  }
}
export const handler: Handler = async (event) => {
  const headers:Record<string,string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  if (event.httpMethod !== "POST")
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "POST required" }),
    };
  try {
    if ((event.body?.length || 0) > 56000) throw Error("Request too large");
    admin();
    const token = (event.headers.authorization || "").replace(/^Bearer /, "");
    if (!token)
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Login required" }),
      };
    const requestStarted=performance.now();
    const identity = await getAuth().verifyIdToken(token, true);
    const authMs=performance.now()-requestStarted;
    const body = JSON.parse(event.body || "{}"),
      profileId = String(body.profileId || "");
    if (!/^[a-zA-Z0-9-]{1,64}$/.test(profileId)) throw Error("Invalid profile");
    const profile = await getFirestore()
      .doc(`families/${identity.uid}/profiles/${profileId}`)
      .get();
    if (!profile.exists) throw Error("Profile not found");
    const profileMs=performance.now()-requestStarted-authMs;
    const key = `${identity.uid}_${profileId}`;
    const now = Date.now(),
      action = String(body.action),
      data = profile.data()!;
    if(['voice-config','voice-join','voice-status','voice-signal','voice-poll','voice-leave'].includes(action)){const code=String(body.code||'').toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))throw Error('Invalid room code');const [roster,expiry]=await Promise.all([getDatabase().ref(`mazeRooms/${code}/players`).get(),getDatabase().ref(`mazeRooms/${code}/expiresAt`).get()]);const room={id:code,players:roster.val()||{},expiresAt:expiry.val()||0}as Match;if(!room.players[key]||room.players[key].uid!==identity.uid||room.expiresAt<now)throw Error('Not a room member');return{statusCode:200,headers,body:JSON.stringify(action==='voice-config'?voiceConfig(identity.uid,now,process.env):{voice:await voiceRoomAction(getDatabase(),room,key,action,body,now),serverTime:now})};}
    const wardrobeRef=getFirestore().doc(`families/${identity.uid}/wardrobes/${profileId}`);
    if(action==='wardrobe'){
      if(!Array.isArray(body.pending)||body.pending.length>80||body.pending.some((k:unknown)=>typeof k!=='string'||k.length>80))throw Error('Invalid wardrobe request');
      const settled=await getFirestore().runTransaction(async tx=>{const [current,wallet]=await Promise.all([tx.get(profile.ref),tx.get(wardrobeRef)]);const result=settleWardrobe(current.data() as Profile,wallet.exists?wallet.data() as WardrobeWallet:undefined,body.pending);tx.set(wardrobeRef,result.wallet);return result;});
      return{statusCode:200,headers,body:JSON.stringify(settled)};
    }
    if(['create','join','random'].includes(action)){const storedWallet=await wardrobeRef.get();if(storedWallet.exists)data.wardrobe=storedWallet.data();}
    const player: Player = {
      uid: identity.uid,
      profileId,
      name: String(data.name || "Explorer").slice(0, 24),
      outfit: ["classic", "explorer", "raincoat", "space"].includes(data.outfit)
        ? data.outfit
        : "classic",
      appearance:permittedAppearance(data as Profile),
      ready: false,
      online: true,
      x: 1.5,
      y: 1.5,
      angle: 0,
      lastMove: now,
      seq: 0,
      finishedAt: null,
      slot: 0,
    };
    let id = String(body.code || "").toUpperCase(),
      result: Match | null = null;
    if (action === "create" || action === "random") {
      const difficulty: Difficulty = ["easy", "medium", "hard", "extreme"].includes(
          body.difficulty,
        )
          ? body.difficulty
          : "medium",
        mode = body.mode === "coop" ? "coop" : "race";
      const area=body.area===undefined?'classic':body.area;if(!validArea(area))throw Error('Invalid adventure area');
      const queue=getDatabase().ref(`mazeMatchQueue/${area}/${difficulty}/${mode}`);
      if(action==='random'){
        const candidates=((await queue.get()).val()||{}) as Record<string,number>;
        for(const code of Object.keys(candidates).slice(-20)){
          if(now-candidates[code]>600000){await queue.child(code).remove();continue;}
          const joined=await getDatabase().ref(`mazeRooms/${code}`).transaction((r:Match|null)=>{
            if(!r)return r;
            if((r.area||'classic')!==area||r.difficulty!==difficulty||r.mode!==mode||r.state!=='lobby'||!r.public||r.expiresAt<now||Object.keys(r.players||{}).length>=roomCapacity[difficulty])return;
            try{return addPlayer(r,key,player,now);}catch{return;}
          });
          if(joined.committed&&joined.snapshot.val()?.players?.[key])return{statusCode:200,headers,body:JSON.stringify({room:joined.snapshot.val(),playerKey:key,serverTime:now})};
        }
      }
      // A per-account creation cooldown prevents unbounded room creation.
      const rate = getDatabase().ref(`mazeRoomLimits/${identity.uid}`);
      const lease = await rate.transaction((last) =>
        typeof last === "number" && now - last < 5000 ? undefined : now,
      );
      if (!lease.committed)
        throw Error("Please wait before creating another room");
      for (let attempt = 0; attempt < 5; attempt++) {
        id = Array.from(
          crypto.getRandomValues(new Uint8Array(6)),
          (n) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32],
        ).join("");
        const room = createMatch(
          id,
          key,
          player,
          mode,
          difficulty,
          now,
          crypto.getRandomValues(new Uint32Array(1))[0],
        );
        room.area=area;room.adventure={version:2,map:room.seed%10,states:{},tickAt:0,escapeAt:-1,escapeDuration:90,bossHP:0};room.public=action==='random';
        const saved = await getDatabase()
          .ref(`mazeRooms/${id}`)
          .transaction((old) =>
            old && old.expiresAt > now ? undefined : room,
          );
        if (saved.committed) {
          result = saved.snapshot.val();
          if(room.public)await queue.child(id).set(now);
          break;
        }
      }
      if (!result) throw Error("Could not allocate room");
    } else {
      if (!/^[A-Z2-9]{6}$/.test(id)) throw Error("Invalid room code");
      const presence = action==='move'&&body.legacy===true?(await getDatabase().ref(`mazePresence/${id}`).get()).val() as Record<string,boolean>|null:null;
      let failure = "Room changed; try again";
      const saved = await getDatabase()
        .ref(`mazeRooms/${id}`)
        .transaction((current: Match | null) => {
          const propose=()=>{
          if (!current) return current;
          if (current.expiresAt < now) {
            failure = "Room expired or not found";
            return;
          }
          try {
            const room = structuredClone(current);
            room.players ??= {};
            room.owners ??= {};
            if (action === "join") return addPlayer(room, key, player, now);
            if (!room.players[key]) throw Error("Not a room member");
            if(action==='chat')return postRoomMessage(room,key,body.text,body.messageId,now);
            if(action==='reconnect'){room.players[key].online=true;room.revision++;return room;}
            if (action === "ready") {
              if (room.state !== "lobby") throw Error("Match already started");
              room.players[key].ready = body.ready === true;
              room.revision++;
              return room;
            }
            if (action === "start") return startMatch(room, key, now);
            if (
              action === "move" &&
              room.state === "playing" &&
              !room.adventure &&
              presence &&
              Object.keys(room.players).some((k) => presence[k] === false)
            ) {
              room.state = "finished";
              room.finishedAt = now;
              room.winner = null;
              return room;
            }
            if (action === "ability"){
              if(!body.movement)return performAction(room,key,body.kind,now);
              const m=body.movement,seq=Number(m.seq),p=room.players[key];
              if(seq<=(p.lastActionSeq||0))return room;
              movePlayer(room,key,m.points,Number(m.angle),seq,now);
              p.lastActionSeq=seq;p.lastActionAccepted=false;delete p.lastActionError;
              if(p.seq!==seq){p.lastActionError='Movement not accepted';return room;}
              try{performAction(room,key,body.kind,now);p.lastActionAccepted=true;}
              catch(e){p.lastActionError=e instanceof Error?e.message:'Action unavailable';room.revision++;}
              return room;
            }
            if (action === "move")
              return movePlayer(
                room,
                key,
                body.points as Point[],
                Number(body.angle),
                Number(body.seq),
                now,
              );
            if (action === "leave") return leaveMatch(room, key, now);
            throw Error("Unknown action");
          } catch (e) {
            failure = e instanceof Error ? e.message : "Invalid action";
            return;
          }
          };return stampRoom(propose());
        });
      if (!saved.committed||!saved.snapshot.val()?.players?.[key]&&action!=='leave') throw Error(failure);
      result = saved.snapshot.val();if(action==='leave'){const paths=[`mazeVoice/${id}/peers/${key}`,`mazeVoice/${id}/inbox/${key}`,...Object.keys(result?.players||{}).map(to=>`mazeVoice/${id}/inbox/${to}/${key}`)];await Promise.allSettled(paths.map(path=>getDatabase().ref(path).remove()));}
    }
    headers['Server-Timing']=`auth;dur=${authMs.toFixed(1)}, profile;dur=${profileMs.toFixed(1)}, room;dur=${(performance.now()-requestStarted-authMs-profileMs).toFixed(1)}`;
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ room: clientRoom(result,key), playerKey: key, serverTime: now,...(action==='ability'&&body.movement?{actionAccepted:result?.players[key]?.lastActionAccepted===true,actionError:result?.players[key]?.lastActionError}: {}) }),
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Request failed";
    const status = /token|auth\/|Login/.test(message)
      ? 401
      : /configured/.test(message)
        ? 503
        : 400;
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: message }),
    };
  }
};
