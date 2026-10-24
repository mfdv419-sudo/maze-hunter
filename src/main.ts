import "./style.css";
import { tone, isMuted, setMuted } from "./systems/audio";
import {
  serverNow,
  watchAuth,
  login,
  logout,
  cloudConfigured,
  getProfiles,
  syncProfile,
  getEntitlement,
  roomAction,
  watchRoom,
  roomPresence,
  multiplayerConfigured,
  type Room,
} from "./services/cloud";
import {
  emptyFamily,
  readFamily,
  writeFamily,
  newProfile,
  mergeProfile,
  recordLevel,
  unlocked,
  type Family,
  type Profile,
} from "./services/local";
import {
  retroConfig,
  modernSettings,
  type Difficulty,
  type Point,
} from "./game/maze";
import type { ModernGame } from "./game/modern";
import type { RetroGame } from "./game/retro";
import { loadAds, betweenLevels } from "./services/ads";
const root = document.querySelector<HTMLDivElement>("#game")!;
let lang: "id" | "en" =
  localStorage.getItem("mh-language") === "en" ? "en" : "id";
const tr = (id: string, en: string) => (lang === "id" ? id : en);
let uid = "",
  accountName = "",
  family: Family = emptyFamily(),
  profile: Profile | undefined,
  adFree = false,
  lab = false;
let cleanup: () => void = () => {},
  game: ModernGame | RetroGame | null = null,
  screen = "home",
  generation = 0,
  saving = 0;
let activeRoom: Room | null = null,
  playerKey = "",
  roomUnwatch: () => void = () => {},
  endPresence: (() => Promise<void>) | null = null;
const regions = [
  ["Rimba Pagi", "Morning Forest"],
  ["Kebun Embun", "Dew Garden"],
  ["Sungai Giok", "Jade River"],
  ["Lembah Bambu", "Bamboo Valley"],
  ["Bukit Awan", "Cloud Hills"],
  ["Reruntuhan Lumut", "Moss Ruins"],
  ["Gua Kristal", "Crystal Cave"],
  ["Pulau Senja", "Sunset Isle"],
  ["Hutan Bintang", "Star Forest"],
  ["Gerbang Cahaya", "Gate of Light"],
];
const esc = (s: unknown) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
function button(label: string, id: string, cls = "primary", disabled = false) {
  return `<button id="${id}" class="${cls}" ${disabled ? "disabled" : ""}>${label}</button>`;
}
function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}
function click(id: string, fn: () => unknown) {
  el(id)?.addEventListener("click", () => {
    Promise.resolve().then(fn).catch(showError);
  });
}
function toast(message: string) {
  const n = document.createElement("div");
  n.className = "toast";
  n.role = "status";
  n.textContent = message;
  document.body.append(n);
  setTimeout(() => n.remove(), 6000);
}
function showError(error: unknown) {
  toast(error instanceof Error ? error.message : String(error));
  console.error(error);
}
function header() {
  return `<header><a href="#" id="brand" aria-label="Maze Hunter home"><span class="brand-mark">▥</span> MAZE<span>HUNTER</span></a><div class="header-right">${profile ? `<button class="profile-pill" id="profiles">${esc(profile.name)} <span>⌄</span></button>` : ""}<button class="quiet" id="sound-toggle" aria-label="${tr("Suara", "Sound")}">${isMuted() ? "♪ ×" : "♪"}</button><button class="language" id="language" aria-label="Change language">${lang === "id" ? "ID / EN" : "EN / ID"}</button>${uid && !lab ? `<button class="quiet" id="logout">${tr("Keluar akun", "Sign out")}</button>` : ""}</div></header>`;
}
function begin(name: string, html: string) {
  generation++;
  cleanup();
  cleanup = () => {};
  game?.dispose();
  game = null;
  screen = name;
  root.innerHTML = `${lab ? `<div class="lab-banner">${tr("LAB KONTROL LOKAL · Tanpa login, cloud, pembelian, atau multiplayer", "LOCAL CONTROL LAB · No login, cloud, purchases, or multiplayer")}</div>` : ""}${header()}${html}`;
  click("brand", () =>
    activeRoom ? confirmLeave() : game ? pauseOverlay() : home(),
  );
  click("profiles", () =>
    activeRoom ? confirmLeave() : game ? pauseOverlay() : profiles(),
  );
  click("language", () => {
    lang = lang === "id" ? "en" : "id";
    localStorage.setItem("mh-language", lang);
    if (profile) {
      profile.language = lang;
      void save();
    }
    if (screen === "retro" || screen === "modern") {
      toast(
        tr(
          "Bahasa diterapkan pada layar berikutnya",
          "Language applies on the next screen",
        ),
      );
      return;
    }
    if (screen === "map") journey();
    else if (screen === "profiles") profiles();
    else if (screen === "wardrobe") wardrobe();
    else if (screen === "setup") setup();
    else if (screen === "lobby") lobby();
    else home();
  });
  click("sound-toggle", () => {
    setMuted(!isMuted());
    el("sound-toggle").textContent = isMuted() ? "♪ ×" : "♪";
    tone(480);
  });
  click("logout", async () => {
    await leaveRoom();
    await logout();
  });
}
async function preview(id: string, outfit = "classic") {
  const token = generation;
  try {
    const { characterPreview } = await import("./game/modern");
    if (token !== generation) return;
    cleanup = characterPreview(el(id), outfit);
  } catch (e) {
    if (token === generation) showError(e);
  }
}
function home() {
  begin(
    "home",
    `<main class="home"><section class="hero-copy"><div class="eyebrow">${tr("PETUALANGAN UNTUK SELURUH KELUARGA", "AN ADVENTURE FOR EVERYONE")}</div><h1>${tr("Setiap belokan,<br>petualangan baru.", "Every turn.<br>A new adventure.")}</h1><p class="lead">${tr("Ikuti jejakmu. Buka misterinya. Temukan jalan bersama sahabat rimba.", "Trace your path. Uncover the mystery. Find your way with a forest friend.")}</p><div class="hero-actions">${button(profile ? tr("Mulai petualangan", "Let’s explore") : tr("Masuk dengan Google", "Sign in with Google"), "play")}${button(tr("Cara bermain", "How to play"), "how", "secondary")}</div>${!profile ? `<p class="account-note">${tr("Satu akun orang tua, petualangan berbeda untuk setiap anggota keluarga.", "One parent account. A separate adventure for every family member.")}</p>` : ""}<div class="hero-features"><span>01 <b>RETRO JOURNEY</b></span><span>02 <b>HIDDEN MAZE</b></span></div></section><section class="hero-art" aria-label="Binturong mascot"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div id="mascot" class="mascot"></div><div class="mascot-tag"><span>✦</span> ${tr("Sahabat rimba, penjelajah kecil.", "Forest friend. Little explorer.")}</div></section></main>${profile ? `<section class="mode-cards"><button id="retro-mode" class="mode-card"><span class="mode-number">01 / TRACE</span><h2>Retro Maze Journey <span>↗</span></h2><p>${tr("100 level · 10 wilayah · ikuti jalur dengan jarimu", "100 levels · 10 regions · trace with your finger")}</p><span class="mode-meta">${tr("LANJUT LEVEL", "CONTINUE LEVEL")} ${unlocked(profile)} / 100</span></button><button id="modern-mode" class="mode-card modern-card"><span class="mode-number">02 / EXPLORE</span><h2>Modern Hidden Maze <span>↗</span></h2><p>${tr("Dunia 3D · peta tersembunyi · solo atau bersama", "3D world · hidden paths · solo or together")}</p><span class="mode-meta">SOLO · RACE · CO-OP</span></button><button id="wardrobe" class="wardrobe-link">${tr("Karakter & kostum", "Character & outfits")} ↗</button></section>` : `<section class="connection-note">${cloudConfigured ? tr("Google login siap. Progres disimpan per profil keluarga.", "Google sign-in is configured. Each family profile has its own progress.") : tr("Login menunggu konfigurasi Firebase pemilik project. Tidak ada akun simulasi.", "Sign-in needs the project owner’s Firebase configuration. No simulated accounts.")} ${import.meta.env.DEV ? button(tr("Buka lab kontrol lokal", "Open local control lab"), "lab", "quiet") : ""}</section>`}`,
  );
  void preview("mascot", profile?.outfit);
  click("play", () =>
    profile
      ? journey()
      : cloudConfigured
        ? login()
        : toast(
            tr(
              "Lengkapi konfigurasi Firebase sesuai panduan deployment.",
              "Complete Firebase configuration using the deployment guide.",
            ),
          ),
  );
  click("how", () => instructions());
  click("retro-mode", () => journey());
  click("modern-mode", () => setup());
  click("wardrobe", () => wardrobe());
  click("lab", () => {
    lab = true;
    uid = "local-control-lab";
    family = {
      active: "lab",
      profiles: [{ ...newProfile("Lab", lang), id: "lab" }],
    };
    profile = family.profiles[0];
    home();
  });
}
function instructions() {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><div class="eyebrow">MAZE HUNTER</div><h2>${tr("Dua cara menemukan jalan.", "Two ways to find your path.")}</h2><p><b>Retro:</b> ${tr("Sentuh titik putih di START, lalu telusuri koridor ke gerbang emas. Angkat jari kapan saja dan lanjutkan dari titik terakhir. Menembus dinding mengurangi satu nyawa.", "Touch the white START marker, then trace the corridor to the gold gate. Lift your finger freely and resume at the last point. Crossing a wall costs one life.")}</p><p><b>Modern:</b> ${tr("Gunakan joystick atau WASD/tombol arah. Jelajahi area tersembunyi dan temukan gerbang. Area yang sudah ditemukan tetap tercatat.", "Use the joystick or WASD/arrow keys. Explore hidden areas and find the gate. Discovered areas remain on your map.")}</p>${button(tr("Mengerti", "Got it"), "close-help")}</section>`;
  document.body.append(overlay);
  el("close-help").focus();
  click("close-help", () => overlay.remove());
}
function profiles() {
  if (!uid) return home();
  begin(
    "profiles",
    `<main class="page narrow"><div class="eyebrow">${tr("AKUN KELUARGA", "FAMILY ACCOUNT")}</div><h1>${tr("Siapa yang berpetualang?", "Who’s exploring today?")}</h1><p class="lead">${tr("Gunakan nama panggilan. Setiap profil punya progres dan kostum sendiri.", "Use a nickname. Every profile has their own progress and outfits.")}</p><div class="profile-grid">${family.profiles.map((p, i) => `<button class="profile-card" id="p-${i}"><span class="avatar">${esc(p.name.slice(0, 1).toUpperCase())}</span><h2>${esc(p.name)}</h2><span>${tr("Level", "Level")} ${unlocked(p)} · ${Object.values(p.retro).reduce((n, r) => n + r.stars, 0)} ★</span></button>`).join("")}</div>${family.profiles.length < 6 ? `<form id="new-profile"><label for="nickname">${tr("Profil baru (maksimal 6)", "New profile (up to 6)")}</label><div class="input-row"><input id="nickname" maxlength="24" minlength="1" placeholder="${tr("Nama panggilan", "Nickname")}" required autocomplete="off">${button(tr("Tambah profil", "Add profile"), "add-profile")}</div></form>` : ""}<p class="small">${esc(accountName)}</p></main>`,
  );
  family.profiles.forEach((p, i) =>
    click(`p-${i}`, () => {
      profile = p;
      family.active = p.id;
      lang = p.language;
      cache();
      home();
    }),
  );
  el("new-profile")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el<HTMLInputElement>("nickname").value.trim();
    if (!name) return;
    const p = newProfile(name, lang);
    family.profiles.push(p);
    family.active = p.id;
    profile = p;
    void save()
      .then(() => home())
      .catch(showError);
  });
}
function cache() {
  if (uid && !lab) writeFamily(uid, family);
}
async function save() {
  if (!profile) return;
  cache();
  if (lab) return;
  if (!navigator.onLine) {
    toast(
      tr(
        "Tersimpan di perangkat. Sinkronisasi saat online.",
        "Saved on this device. Will sync when online.",
      ),
    );
    return;
  }
  const p = profile,
    owner = uid;
  saving++;
  try {
    const merged = await syncProfile(owner, p);
    if (owner === uid) {
      const i = family.profiles.findIndex((q) => q.id === p.id);
      if (i >= 0) family.profiles[i] = merged;
      if (profile?.id === p.id) profile = merged;
      cache();
    }
  } catch (e) {
    toast(
      tr(
        "Progres tersimpan lokal; sinkronisasi cloud belum berhasil.",
        "Progress saved locally; cloud sync has not completed.",
      ),
    );
    console.error(e);
  } finally {
    saving--;
  }
}
function journey(region?: number) {
  if (!profile) return home();
  const max = unlocked(profile),
    r = region ?? Math.floor((max - 1) / 10);
  begin(
    "map",
    `<main class="page journey-page"><div class="page-top"><div><div class="eyebrow">RETRO MAZE JOURNEY · ${String(r + 1).padStart(2, "0")} / 10</div><h1>${regions[r][lang === "id" ? 0 : 1]}</h1><p>${tr("Ikuti jalurmu, satu belokan pada satu waktu.", "Follow your path, one turn at a time.")}</p></div>${button(tr("Cara bermain", "How to play"), "help", "secondary")}</div><div class="journey-land"><div class="landmark mountain mountain-a"></div><div class="landmark mountain mountain-b"></div><svg class="journey-path" viewBox="0 0 1000 460" preserveAspectRatio="none"><path d="M 70 280 C 200 100, 240 100, 360 260 S 550 420, 620 240 S 810 80, 930 220"/></svg>${Array.from(
      { length: 10 },
      (_, i) => {
        const id = r * 10 + i + 1,
          result = profile!.retro[String(id)],
          open = id <= max;
        const xs = [7, 16, 25, 35, 45, 55, 65, 75, 84, 93],
          ys = [61, 38, 34, 51, 68, 67, 43, 27, 32, 48];
        return `<button class="level-node ${result ? "complete" : id === max ? "current" : ""}" id="level-${id}" style="--node-x:${xs[i]}%;--node-y:${ys[i]}%" ${open ? "" : "disabled"} aria-label="${tr("Level", "Level")} ${id}${open ? "" : tr(" terkunci", " locked")}"><span>${open ? id : "⌑"}</span><small>${result ? "★".repeat(result.stars) + "☆".repeat(3 - result.stars) : open ? tr("MAIN", "PLAY") : tr("TERKUNCI", "LOCKED")}</small></button>`;
      },
    ).join(
      "",
    )}<div class="region-label">${tr("WILAYAH", "REGION")} ${r + 1}<span>10 ${tr("jalur untuk ditemukan", "paths to discover")}</span></div></div><div class="map-nav">${button("← " + tr("Sebelumnya", "Previous"), "prev", "secondary", r === 0)}<span>${Object.keys(profile.retro).length}/100 ${tr("level selesai", "levels complete")}</span>${button(tr("Berikutnya", "Next") + " →", "next-region", "secondary", r === 9)}</div></main>`,
  );
  click("help", () => instructions());
  click("prev", () => journey(r - 1));
  click("next-region", () => journey(r + 1));
  for (let id = r * 10 + 1; id <= r * 10 + 10; id++)
    click(`level-${id}`, () => playRetro(id));
}
function hud(title: string, sub: string, touch = false) {
  return `<main class="play-screen"><div class="playbar"><button id="exit-game" class="icon-button" aria-label="${tr("Keluar permainan", "Exit game")}">←</button><div><b>${title}</b><small>${sub}</small></div><div id="hud-stats" class="hud-stats"></div><button id="pause-game" class="icon-button" aria-label="${tr("Jeda", "Pause")}">Ⅱ</button></div><div id="game-stage" class="game-stage"></div><div id="play-hint" class="play-hint"></div>${touch ? `<div id="joystick" class="joystick" role="group" aria-label="${tr("Joystick gerakan", "Movement joystick")}"><span id="stick"></span></div>` : ""}<div id="game-overlay"></div></main>`;
}
function pauseOverlay(online = false) {
  if (online) {
    toast(
      tr("Pertandingan online terus berjalan.", "Online matches keep running."),
    );
    return;
  }
  game?.setPaused(true);
  el("game-overlay").innerHTML =
    `<div class="modal-backdrop"><section class="modal center"><div class="eyebrow">${tr("TARIK NAPAS SEJENAK", "TAKE A BREATHER")}</div><h2>${tr("Petualangan dijeda", "Adventure paused")}</h2>${button(tr("Lanjut bermain", "Resume"), "resume")}${button(tr("Ulangi", "Restart"), "restart", "secondary")}${button(tr("Kembali ke menu", "Return to menu"), "quit", "quiet")}</section></div>`;
  click("resume", () => {
    game?.setPaused(false);
    el("game-overlay").innerHTML = "";
  });
  click("restart", () =>
    screen === "retro"
      ? playRetro((game as RetroGame).state.level)
      : playModern(currentDifficulty),
  );
  click("quit", () => home());
}
async function playRetro(level: number) {
  if (!profile || level > unlocked(profile)) return;
  begin(
    "retro",
    hud(
      `RETRO · ${tr("LEVEL", "LEVEL")} ${level}`,
      regions[Math.floor((level - 1) / 10)][lang === "id" ? 0 : 1],
    ),
  );
  const zoom = document.createElement("div");
  zoom.className = "zoom-controls";
  zoom.innerHTML =
    button("−", "zoom-out", "icon-button") +
    button("+", "zoom-in", "icon-button");
  el("game-stage").after(zoom);
  click("zoom-in", () => {
    (game as RetroGame)?.zoom(0.5);
    toast(
      tr(
        "Saat zoom: geser area di luar titik putih untuk menggeser peta.",
        "While zoomed: drag away from the white marker to pan.",
      ),
    );
  });
  click("zoom-out", () => {
    (game as RetroGame)?.zoom(-0.5);
  });
  const token = generation;
  el("play-hint").textContent = tr(
    "Sentuh titik putih untuk mulai · angkat jari tanpa penalti · tujuan: gerbang emas",
    "Touch the white marker to start · lift freely · goal: gold gate",
  );
  click("pause-game", () => pauseOverlay());
  click("exit-game", () => pauseOverlay());
  const { RetroGame } = await import("./game/retro");
  if (token !== generation) return;
  game = new RetroGame(el("game-stage"), {
    level,
    onTick: (s) => {
      el("hud-stats").innerHTML =
        `<span class="lives">${"♥".repeat(s.lives)}${"♡".repeat(3 - s.lives)}</span><span>${Math.ceil(s.config.seconds - s.elapsed)}s</span>`;
    },
    onFinish: (s) => {
      const won = s.phase === "won";
      tone(won ? 720 : 120, 0.18, "sine", 0.025);
      if (won && profile) {
        recordLevel(profile, level, {
          seconds: s.elapsed,
          stars: s.rating,
          errors: s.errors,
        });
        void save();
      }
      result(
        won,
        s.elapsed,
        s.rating,
        s.reason === "time"
          ? tr("Waktu habis", "Time is up")
          : tr("Nyawa habis", "No lives left"),
        () => playRetro(level),
        won && level < 100
          ? async () => {
              await betweenLevels(level, adFree || lab);
              await playRetro(level + 1);
            }
          : () => journey(),
      );
    },
  });
}
function result(
  won: boolean,
  seconds: number,
  rating: number,
  reason: string,
  retry: () => unknown,
  next: () => unknown,
  title?: string,
) {
  el("game-overlay").innerHTML =
    `<div class="modal-backdrop"><section class="modal center result"><div class="result-symbol">${won ? "✦" : "↻"}</div><div class="eyebrow">${won ? tr("JALUR BERHASIL DITEMUKAN", "A PATH WELL FOUND") : tr("MASIH ADA PETUALANGAN", "ANOTHER ADVENTURE AWAITS")}</div><h2>${esc(title || (won ? tr("Hebat, penjelajah!", "Well done, explorer!") : reason))}</h2>${rating ? `<div class="stars">${"★".repeat(rating)}${"☆".repeat(3 - rating)}</div>` : ""}<p>${Math.floor(seconds)} ${tr("detik", "seconds")}</p>${button(won ? tr("Lanjutkan", "Continue") : tr("Coba lagi", "Try again"), "result-next")}${button(won ? tr("Main ulang", "Play again") : tr("Kembali ke menu", "Return to menu"), "result-retry", "secondary")}</section></div>`;
  click("result-next", won ? next : retry);
  click("result-retry", won ? retry : () => home());
}
let currentDifficulty: Difficulty = "medium";
function setup() {
  if (!profile) return home();
  begin(
    "setup",
    `<main class="page narrow"><div class="eyebrow">MODERN HIDDEN MAZE</div><h1>${tr("Apa yang ada<br>di balik kabut?", "What’s waiting<br>beyond the mist?")}</h1><p class="lead">${tr("Temukan gerbang emas bersama sahabat rimba. Peta terbuka saat kamu menjelajah.", "Find the golden gate with your forest friend. Reveal the world as you explore.")}</p><label>${tr("Tingkat tantangan", "Choose your challenge")}</label><div class="difficulty">${(["medium", "hard", "extreme"] as Difficulty[]).map((d) => `<button id="difficulty-${d}" class="${d === currentDifficulty ? "selected" : ""}"><b>${d.toUpperCase()}</b><small>${modernSettings[d].vision} ${tr("jarak pandang", "vision radius")}</small></button>`).join("")}</div><div class="setup-actions">${button(tr("Jelajahi sendiri", "Explore solo"), "solo")}<div class="divider">${tr("ATAU BERSAMA TEMAN", "OR EXPLORE TOGETHER")}</div><div class="input-row">${button("Race · 2–4", "race", "secondary", lab || !multiplayerConfigured())}${button("Co-op · 2–4", "coop", "secondary", lab || !multiplayerConfigured())}</div><form id="join-form"><label for="room-code">${tr("Punya kode room?", "Have a room code?")}</label><div class="input-row"><input id="room-code" maxlength="6" minlength="6" placeholder="ABC234" autocomplete="off" ${lab || !multiplayerConfigured() ? "disabled" : ""}>${button(tr("Gabung", "Join"), "join", "secondary", lab || !multiplayerConfigured())}</div></form></div><p class="small">${lab ? tr("Room online memerlukan akun Google dan backend Firebase nyata.", "Online rooms require Google sign-in and a real Firebase backend.") : !multiplayerConfigured() ? tr("Room menunggu konfigurasi Realtime Database dan Netlify Function.", "Rooms require Realtime Database and Netlify Function configuration.") : tr("Room privat · tanpa chat · maksimal empat pemain", "Private rooms · no chat · up to four players")}</p></main>`,
  );
  for (const d of ["medium", "hard", "extreme"] as Difficulty[])
    click(`difficulty-${d}`, () => {
      currentDifficulty = d;
      setup();
    });
  click("solo", () => playModern(currentDifficulty));
  click("race", () => createRoom("race"));
  click("coop", () => createRoom("coop"));
  el("join-form").addEventListener("submit", (e) => {
    e.preventDefault();
    void joinRoom(
      el<HTMLInputElement>("room-code").value.trim().toUpperCase(),
    ).catch(showError);
  });
}
let modernTimer: ReturnType<typeof setInterval> | null = null;
async function playModern(difficulty: Difficulty, room?: Room) {
  if (!profile) return;
  currentDifficulty = difficulty;
  if (!navigator.onLine && !lab) {
    toast(
      tr(
        "Modern memerlukan koneksi internet. Retro tersedia offline.",
        "Modern needs an internet connection. Retro is available offline.",
      ),
    );
    return;
  }
  begin(
    "modern",
    hud(
      room ? `${room.mode.toUpperCase()} · ${room.id}` : "MODERN · SOLO",
      difficulty.toUpperCase(),
      true,
    ),
  );
  const token = generation;
  el("play-hint").textContent = tr(
    "Joystick / WASD / tombol arah · cari gerbang emas",
    "Joystick / WASD / arrow keys · find the gold gate",
  );
  click("pause-game", () => pauseOverlay(!!room));
  click("exit-game", () => (room ? confirmLeave() : pauseOverlay()));
  const { ModernGame } = await import("./game/modern");
  if (token !== generation) return;
  const me = room?.players[playerKey];
  const modern = new ModernGame(el("game-stage"), {
    difficulty,
    seed: room?.seed ?? crypto.getRandomValues(new Uint32Array(1))[0],
    entrance: me?.slot ?? Math.floor(Math.random() * 4),
    outfit: profile.outfit,
    online: !!room,
    onTick: (seconds, explored) => {
      const elapsed = room
        ? Math.max(
            0,
            (serverNow() - (activeRoom?.startsAt || serverNow())) / 1000,
          )
        : seconds;
      el("hud-stats").textContent =
        `${Math.max(0, Math.ceil(modernSettings[difficulty].seconds - elapsed))}s · ${explored} ${tr("area", "tiles")}`;
    },
    onFinish: (won) => {
      tone(won ? 720 : 120, 0.18, "sine", 0.025);
      if (won && profile) {
        profile.modernWins++;
        void save();
      }
      result(
        won,
        modern.elapsed,
        0,
        tr("Waktu habis", "Time is up"),
        () => playModern(difficulty),
        () => setup(),
      );
    },
  });
  game = modern;
  const stick = el("joystick"),
    knob = el("stick");
  let pointer: number | null = null;
  const control = (e: PointerEvent) => {
    const r = stick.getBoundingClientRect(),
      dx = (e.clientX - r.left - r.width / 2) / (r.width * 0.32),
      dy = (e.clientY - r.top - r.height / 2) / (r.height * 0.32),
      n = Math.max(1, Math.hypot(dx, dy));
    modern.joystick = {
      x: Math.abs(dx) < 0.08 ? 0 : dx / n,
      y: Math.abs(dy) < 0.08 ? 0 : dy / n,
    };
    knob.style.transform = `translate(${(dx / n) * 27}px,${(dy / n) * 27}px)`;
  };
  stick.addEventListener("pointerdown", (e) => {
    pointer = e.pointerId;
    stick.setPointerCapture(pointer);
    control(e);
  });
  stick.addEventListener("pointermove", (e) => {
    if (pointer === e.pointerId) control(e);
  });
  const release = () => {
    pointer = null;
    modern.joystick = { x: 0, y: 0 };
    knob.style.transform = "";
  };
  stick.addEventListener("pointerup", release);
  stick.addEventListener("pointercancel", release);
  stick.addEventListener("lostpointercapture", release);
  if (room) {
    modern.position = { x: me!.x, y: me!.y };
    modern.paused = true;
    let inFlight = false,
      seq = 0,
      buffer: Point[] = [];
    let sample = 0;
    modernTimer = setInterval(() => {
      if (screen !== "modern" || !activeRoom) return;
      const started = serverNow() >= activeRoom.startsAt && navigator.onLine;
      modern.paused = !started;
      el("play-hint").textContent = started
        ? tr("Jelajahi labirin", "Explore the maze")
        : String(
            Math.max(1, Math.ceil((activeRoom.startsAt - serverNow()) / 1000)),
          );
      if (started)
        el("play-hint").textContent = tr(
          "Joystick / WASD · room privat online",
          "Joystick / WASD · private online room",
        );
      if (!started || modern.ended) return;
      sample++;
      if (buffer.length < 20) buffer.push({ ...modern.position });
      if (inFlight || sample % 5) return;
      inFlight = true;
      const points = buffer;
      buffer = [];
      void roomAction("move", {
        code: room.id,
        profileId: profile!.id,
        points,
        angle: modern.angle,
        seq: ++seq,
      })
        .then(({ room: r }) => applyRoom(r))
        .catch((e) => {
          modern.position = {
            x: activeRoom!.players[playerKey].x,
            y: activeRoom!.players[playerKey].y,
          };
          buffer = [];
          modern.clearInput();
          toast(
            tr("Posisi disinkronkan ulang: ", "Position resynchronized: ") +
              (e instanceof Error ? e.message : ""),
          );
        })
        .finally(() => (inFlight = false));
    }, 50);
    cleanup = () => {
      if (modernTimer) clearInterval(modernTimer);
      modernTimer = null;
    };
    applyRoom(room);
  }
}
function wardrobe() {
  if (!profile) return;
  const stars = Object.values(profile.retro).reduce((n, r) => n + r.stars, 0),
    outfits = [
      ["classic", tr("Sahabat Rimba", "Forest Friend"), 0],
      ["explorer", tr("Penjelajah", "Explorer"), 10],
      ["raincoat", tr("Hujan Ceria", "Happy Rain"), 20],
      ["space", tr("Penjelajah Bintang", "Star Explorer"), 50],
    ] as const;
  begin(
    "wardrobe",
    `<main class="page wardrobe-page"><section><div class="eyebrow">${tr("KARAKTER & KOSTUM", "CHARACTER & OUTFITS")}</div><h1>${tr("Gaya kecil.<br>Petualangan besar.", "Little style.<br>Big adventure.")}</h1><p>${tr("Binturong fantasi · semua kostum memiliki kemampuan setara.", "Fantasy binturong · every outfit has equal abilities.")}</p><div id="outfit-preview"></div></section><section class="outfit-options"><p class="eyebrow">${stars} ★ ${tr("DIKUMPULKAN", "COLLECTED")}</p>${outfits.map(([id, name, min]) => `<button id="outfit-${id}" class="outfit ${profile!.outfit === id ? "selected" : ""}" ${stars < min ? "disabled" : ""}><b>${name}</b><span>${stars < min ? `${min} ★` : profile!.outfit === id ? tr("DIPAKAI", "EQUIPPED") : tr("PAKAI", "EQUIP")}</span></button>`).join("")}<div class="parent-note"><b>${tr("Area orang tua", "Parent area")}</b><p>${tr("Koleksi awal diperoleh melalui permainan. Pembelian kostum dan langganan belum diaktifkan pada tahap ini.", "The initial collection is earned by playing. Outfit purchases and subscriptions are not activated in this stage.")}</p><p>${adFree ? tr("Status akun: bebas iklan", "Account: ad-free") : tr("Status akun: gratis", "Account: free")}</p></div></section></main>`,
  );
  void preview("outfit-preview", profile.outfit);
  for (const [id, , min] of outfits)
    click(`outfit-${id}`, () => {
      if (stars < min) return;
      profile!.outfit = id;
      profile!.updatedAt = Date.now();
      void save();
      wardrobe();
    });
}
async function createRoom(mode: "race" | "coop") {
  await save();
  const r = await roomAction("create", {
    profileId: profile!.id,
    mode,
    difficulty: currentDifficulty,
  });
  await enterRoom(r.room, r.playerKey);
}
async function joinRoom(code: string) {
  await save();
  const r = await roomAction("join", { profileId: profile!.id, code });
  await enterRoom(r.room, r.playerKey);
}
async function enterRoom(room: Room, key: string) {
  roomUnwatch();
  activeRoom = room;
  playerKey = key;
  endPresence = await roomPresence(room.id, key);
  roomUnwatch = watchRoom(
    room.id,
    (r) => {
      if (r) applyRoom(r);
      else {
        toast(tr("Room ditutup", "Room closed"));
        void leaveRoom().then(() => home());
      }
    },
    showError,
  );
  lobby();
}
function lobby() {
  if (!activeRoom) return setup();
  const room = activeRoom;
  begin(
    "lobby",
    `<main class="page narrow"><div class="eyebrow">${room.mode.toUpperCase()} · ${room.difficulty.toUpperCase()}</div><h1>${tr("Berkumpul sebelum<br>berpetualang.", "Gather your<br>fellow explorers.")}</h1><div class="room-code">${room.id}</div><p>${tr("Bagikan kode ini kepada teman atau keluarga.", "Share this code with friends or family.")}</p><div id="room-players"></div><div class="input-row">${button(tr("Siap / batal siap", "Ready / unready"), "ready")}${button(tr("Mulai pertandingan", "Start match"), "start-match", "secondary", room.host !== playerKey)}</div>${button(tr("Tinggalkan room", "Leave room"), "leave", "quiet")}<p class="small">${tr("Semua pemain harus siap. Pertandingan berakhir jika seorang pemain keluar.", "All players must be ready. Leaving ends an active match.")}</p></main>`,
  );
  updateLobby();
  click("ready", async () => {
    const { room: r } = await roomAction("ready", {
      profileId: profile!.id,
      code: room.id,
      ready: !activeRoom!.players[playerKey].ready,
    });
    applyRoom(r);
  });
  click("start-match", async () => {
    const { room: r } = await roomAction("start", {
      profileId: profile!.id,
      code: room.id,
    });
    applyRoom(r);
  });
  click("leave", async () => {
    await leaveRoom();
    setup();
  });
}
function updateLobby() {
  if (!activeRoom || !el("room-players")) return;
  const r = activeRoom;
  el("room-players").innerHTML = Object.entries(r.players)
    .map(
      ([k, p]) =>
        `<div class="room-player"><span class="avatar">${esc(p.name.slice(0, 1))}</span><b>${esc(p.name)} ${k === r.host ? "♛" : ""}</b><span>${p.ready ? tr("Siap ✓", "Ready ✓") : tr("Menunggu", "Waiting")}</span></div>`,
    )
    .join("");
  el<HTMLButtonElement>("start-match").disabled =
    r.host !== playerKey ||
    Object.keys(r.players).length < 2 ||
    Object.values(r.players).some((p) => !p.ready);
}
function applyRoom(r: Room) {
  if (activeRoom && activeRoom.id === r.id && r.revision < activeRoom.revision)
    return;
  activeRoom = r;
  if (r.state === "lobby") {
    updateLobby();
    return;
  }
  if (r.state === "playing" && screen === "lobby") {
    void playModern(r.difficulty, r);
    return;
  }
  if (screen === "modern" && game) {
    const m = game as ModernGame;
    m.setPeers(r.players, playerKey, r.mode === "coop");
    if (r.mode === "coop")
      m.reveal(
        Object.keys(
          (r as Room & { explored?: Record<string, boolean> }).explored || {},
        ).map((k) => k.replace("_", ",")),
      );
    if (r.state === "finished" && !m.ended) {
      m.ended = true;
      m.clearInput();
      const won =
        r.mode === "race"
          ? r.winner === playerKey
          : Object.values(r.players).length >= 2 &&
            Object.values(r.players).every((p) => p.finishedAt);
      m.outcome = won ? "won" : "lost";
      if (won && profile) {
        profile.modernWins++;
        void save();
      }
      result(
        won,
        Math.max(0, ((r.finishedAt || Date.now()) - r.startsAt) / 1000),
        0,
        tr("Pertandingan berakhir", "Match ended"),
        async () => {
          await leaveRoom();
          setup();
        },
        async () => {
          await leaveRoom();
          setup();
        },
        won
          ? tr("Tim menemukan jalan!", "A path to victory!")
          : tr("Pertandingan selesai", "Match complete"),
      );
    }
  }
}
function confirmLeave() {
  if (!activeRoom) return;
  el("game-overlay").innerHTML =
    `<div class="modal-backdrop"><section class="modal"><h2>${tr("Tinggalkan pertandingan?", "Leave this match?")}</h2><p>${tr("Pertandingan ini akan berakhir untuk semua pemain.", "This match will end for all players.")}</p>${button(tr("Tetap bermain", "Keep playing"), "stay")}${button(tr("Keluar", "Leave"), "leave-match", "secondary")}</section></div>`;
  click("stay", () => (el("game-overlay").innerHTML = ""));
  click("leave-match", async () => {
    await leaveRoom();
    setup();
  });
}
async function leaveRoom() {
  roomUnwatch();
  roomUnwatch = () => {};
  if (endPresence) {
    try {
      await endPresence();
    } catch (e) {
      console.error(e);
    }
    endPresence = null;
  }
  const room = activeRoom;
  activeRoom = null;
  if (room && profile && !lab) {
    try {
      await roomAction("leave", { profileId: profile.id, code: room.id });
    } catch (e) {
      showError(e);
    }
  }
}
window.addEventListener("online", () => {
  if (profile && !lab) void save();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && game) {
    if (activeRoom) (game as ModernGame).clearInput();
    else if (!el("game-overlay")?.textContent) pauseOverlay();
  }
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && game && !el("game-overlay")?.textContent)
    pauseOverlay(!!activeRoom);
});
window.addEventListener("beforeunload", () => {
  cleanup();
  game?.dispose();
});
watchAuth(async (user) => {
  if (lab) return;
  generation++;
  uid = user?.uid || "";
  accountName = user?.displayName || "";
  profile = undefined;
  family = uid ? readFamily(uid) : emptyFamily();
  if (!user) {
    home();
    return;
  }
  profile = family.profiles.find((p) => p.id === family.active);
  if (profile) lang = profile.language;
  home();
  if (!navigator.onLine) {
    if (!profile)
      toast(
        tr(
          "Hubungkan internet untuk memuat profil keluarga.",
          "Connect to load family profiles.",
        ),
      );
    return;
  }
  try {
    const remote = await getProfiles(user.uid);
    if (uid !== user.uid) return;
    for (const p of remote) {
      const i = family.profiles.findIndex((q) => q.id === p.id);
      if (i < 0) family.profiles.push(p);
      else family.profiles[i] = mergeProfile(family.profiles[i], p);
    }
    profile = family.profiles.find((p) => p.id === family.active);
    cache();
    if (screen === "home") {
      if (!profile) profiles();
      else home();
    }
    for (const p of family.profiles) {
      const merged = await syncProfile(uid, p);
      const i = family.profiles.findIndex((q) => q.id === p.id);
      if (i >= 0) family.profiles[i] = merged;
    }
    cache();
    try {
      adFree = await getEntitlement(uid);
    } catch (e) {
      console.error(e);
    }
    if (!adFree) loadAds();
  } catch (e) {
    showError(e);
  }
});
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (reg) => {
        if (reg.active && profile)
          toast(
            tr(
              "Retro siap dimainkan offline.",
              "Retro is ready to play offline.",
            ),
          );
      })
      .catch(showError);
  });
}
