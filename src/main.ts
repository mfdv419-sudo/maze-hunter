import "./style.css";
import { authErrorInfo, loginErrorDetails, safeLoginText } from "./services/auth-errors";
import { tone, isMuted, setMuted } from "./systems/audio";
import {
  serverNow,
  watchAuth,
  login,
  loginContext,
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
const buildLabel = "24.10.24-M4";
let homeMode: "retro" | "modern" = "retro";
function signInPanel(title: string, message: string, code = "", detail = "") {
  document.getElementById("auth-error")?.remove();
  const panel = document.createElement("section");
  panel.id = "auth-error";
  panel.className = "auth-error";
  panel.setAttribute("role", "alert");
  panel.innerHTML = `<strong>${esc(title)}</strong><p>${esc(message)}</p>${code ? `<code>${esc(code)}</code>` : ""}${detail ? `<pre class="login-detail">${esc(detail)}</pre>` : ""}<small>${buildLabel}</small><button type="button">${tr("Tutup", "Close")}</button>`;
  panel.querySelector("button")!.onclick = () => panel.remove();
  document.body.append(panel);
}
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
    // Start popup login directly in the user's click handler.
    try { Promise.resolve(fn()).catch(showError); }
    catch (error) { showError(error); }
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
  const authIssue = authErrorInfo(error, lang);
  if (authIssue) {
    signInPanel(tr("Masuk belum selesai", "Sign-in incomplete"), authIssue.message, authIssue.code);
    console.error(error);
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  toast(
    /Firebase|permission|auth\/|cloud|configured|token|functions/i.test(message)
      ? tr(
          "Belum bisa terhubung. Coba lagi sebentar.",
          "Unable to connect. Please try again shortly.",
        )
      : message,
  );
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
  root.dataset.screen = name;
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
    `<main class="title-screen">
      <div id="title-world" class="title-world" aria-label="${tr("Pratinjau labirin Rimba Pagi", "Morning Forest maze preview")}"></div>
      <div class="title-vignette"></div>
      <div class="home-kicker"><span></span> ${tr("PETUALANGAN KECIL, DUNIA LUAS", "LITTLE PAWS. BIG ADVENTURES.")}</div>
      <h1 class="game-title" aria-label="Maze Hunter"><span class="title-maze">MAZE</span><span class="title-hunter">HUNTER</span></h1>
      <p class="home-tagline">${tr("Setiap belokan, petualangan baru.", "A new adventure around every corner.")}</p>
      <section class="title-menu">
        ${button(`<span class="play-triangle">▶</span> ${tr("MAIN", "PLAY")}`, "play", "game-play")}
        <span class="play-note">${profile ? esc(profile.name) + " · " + tr("Petualanganmu menunggu", "Your adventure awaits") : tr("Mulai dengan akun Google", "Start with your Google account")}</span>
      </section>
      <div class="mode-selector" role="group" aria-label="${tr("Pilih petualangan", "Choose your adventure")}">
        <button id="retro-mode" class="mode-tile" aria-pressed="${homeMode === "retro"}"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 8h36v32H6V8m9 0v12h16v12H15v8m27-20H31V8"/><path class="mode-route" d="M7 28h16v-8h17"/><circle cx="7" cy="28" r="3"/></svg><span><b>RETRO JOURNEY</b><small>${tr("Sentuh & telusuri jalurnya", "Touch & trace your path")}</small></span><i>✓</i></button>
        <button id="modern-mode" class="mode-tile" aria-pressed="${homeMode === "modern"}"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m5 19 19-11 19 11v20L24 28 5 39V19m19-11v20m-10 6V21l10-6 10 6v13"/><path class="mode-route" d="m18 33 6-4 6 4"/></svg><span><b>HIDDEN MAZE</b><small>${tr("Jelajahi labirin dalam 3D", "Explore the maze in 3D")}</small></span><i>✓</i></button>
      </div>
      <div class="scene-caption"><span class="scene-eyebrow">${tr("INTIP DUNIANYA", "A PEEK AT THE WORLD")}</span><strong>${tr("Rimba Pagi", "Morning Forest")}</strong><span id="scene-description">${homeMode === "retro" ? tr("Ikuti jejak menuju gerbang emas", "Follow the trail to the golden gate") : tr("Temukan jalan di balik kabut", "Find your way through the fog")}</span></div>
      <div class="mascot-hint">${tr("Ketuk binturong!", "Tap the binturong!")} <span>↗</span></div>
      <div class="title-tools">${button("?", "how", "round-tool")}${profile ? button('<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3-6 4 3 5 3-1v10h8V11l3 1 3-5-6-4c-1 3-7 3-8 0Z"/></svg>', "wardrobe", "round-tool") : ""}${button('<svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>', "fullscreen", "round-tool")}</div>
      ${profile ? `<div class="title-progress">★ ${Object.values(profile.retro).reduce((n, r) => n + r.stars, 0)} <span>${tr("LEVEL", "LEVEL")} ${unlocked(profile)}</span></div>` : ""}
      ${import.meta.env.DEV && !profile ? button("Uji kontrol", "lab", "dev-lab") : ""}
    </main>`,
  );
  el("play").setAttribute(
    "aria-label",
    profile
      ? tr("Main", "Play")
      : tr("Main — masuk dengan Google", "Play — sign in with Google"),
  );
  el("how").setAttribute("aria-label", tr("Cara bermain", "How to play"));
  el("fullscreen").setAttribute("aria-label", tr("Layar penuh", "Fullscreen"));
  if (el("wardrobe"))
    el("wardrobe").setAttribute(
      "aria-label",
      tr("Karakter dan kostum", "Character and outfits"),
    );
  const token = generation;
  let setPreview: ((mode: "retro" | "modern") => void) | undefined;
  void import("./game/menu-world")
    .then(({ menuWorld }) => {
      if (token === generation) {
        const world = menuWorld(el("title-world"), profile?.outfit, lang, homeMode);
        cleanup = world.dispose;
        setPreview = world.setMode;
      }
    })
    .catch(showError);
  click("play", async () => {
    if (profile) return homeMode === "retro" ? journey() : setup();
    if (cloudConfigured) {
      const play = el<HTMLButtonElement>("play");
      if (play.disabled) return;
      signInPanel(tr("Membuka Google…", "Opening Google…"), tr("Selesaikan masuk di jendela Google. Jangan tekan Play lagi selama proses berjalan.", "Complete sign-in in the Google window. Wait for this attempt to finish."));
      const label = play.innerHTML;
      play.disabled = true;
      play.textContent = tr("MEMBUKA GOOGLE…", "OPENING GOOGLE…");
      const waiting = setTimeout(() => {
        signInPanel(tr("Masih menunggu Google", "Still waiting for Google"), tr("Jika jendela Google sudah tertutup sendiri, foto pesan ini. Proses login belum mengembalikan hasil.", "If the Google window closed itself, take a screenshot of this message. Sign-in has not returned a result."), "login/pending");
      }, 20000);
      try {
        await login();
        document.getElementById("auth-error")?.remove();
      } catch (error) {
        const info = loginErrorDetails(error, lang);
        const context = loginContext();
        const details = `${info.name}: ${info.detail}${info.frames ? `\n${info.frames}` : ""}\nProject: ${safeLoginText(context.project, 100)}\nAuth domain: ${safeLoginText(context.authDomain, 180)}\nGame: ${safeLoginText(context.origin.replace(/^https?:\/\//, ""), 180)}\nMethod: ${context.method}\nSigned in: ${context.signedIn ? "yes" : "no"}`;
        signInPanel(tr("Masuk belum selesai", "Sign-in incomplete"), info.message, info.code ?? info.name, details);
        console.error("Sign-in failed", info.code ?? info.name, details);
      }
      finally {
        clearTimeout(waiting);
        if (play.isConnected) { play.disabled = false; play.innerHTML = label; }
      }
    } else toast(
            tr(
              "Petualangan belum tersedia. Coba lagi sebentar.",
              "Adventure is unavailable. Please try again shortly.",
            ),
          );
  });
  const version = document.createElement("small");
  version.className = "build-label";
  version.textContent = buildLabel;
  el("title-world").parentElement!.append(version);
  click("how", () => instructions());
  function chooseMode(mode: "retro" | "modern") {
    homeMode = mode;
    if (profile) return mode === "retro" ? journey() : setup();
    el("retro-mode").setAttribute("aria-pressed", String(mode === "retro"));
    el("modern-mode").setAttribute("aria-pressed", String(mode === "modern"));
    el("scene-description").textContent = mode === "retro" ? tr("Ikuti jejak menuju gerbang emas", "Follow the trail to the golden gate") : tr("Temukan jalan di balik kabut", "Find your way through the fog");
    setPreview?.(mode);
    tone(mode === "retro" ? 520 : 660);
  }
  click("retro-mode", () => chooseMode("retro"));
  click("modern-mode", () => chooseMode("modern"));
  click("wardrobe", () => wardrobe());
  click("fullscreen", async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen)
      await document.documentElement.requestFullscreen();
    else
      toast(
        tr(
          "Gunakan tombol layar penuh pada browser.",
          "Use your browser’s fullscreen option.",
        ),
      );
  });
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
  overlay.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><div class="eyebrow">MAZE HUNTER</div><h2>${tr("Dua cara menemukan jalan.", "Two ways to find your path.")}</h2><p><b>Retro:</b> ${tr("Sentuh titik putih di START, lalu telusuri koridor ke gerbang emas. Angkat jari kapan saja dan lanjutkan dari titik terakhir. Menembus dinding mengurangi satu nyawa.", "Touch the white START marker, then trace the corridor to the gold gate. Lift your finger freely and resume at the last point. Crossing a wall costs one life.")}</p><p><b>Modern:</b> ${tr("Gunakan joystick kiri atau WASD. A biru / Spasi untuk lompat; B merah / J untuk menebas semak. Cari gerbang emas. Lompat tidak melewati dinding.", "Use the left joystick or WASD. Blue A / Space to jump; red B / J to clear shrubs. Find the golden gate. Jumping cannot cross walls.")}</p>${button(tr("Mengerti", "Got it"), "close-help")}</section>`;
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
        "Progres tersimpan di perangkat. Belum bisa disinkronkan.",
        "Progress saved on this device. Sync is not complete yet.",
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
  return `<main class="play-screen"><div class="playbar"><button id="exit-game" class="icon-button" aria-label="${tr("Keluar permainan", "Exit game")}">←</button><div><b>${title}</b><small>${sub}</small></div><div id="hud-stats" class="hud-stats"></div><button id="pause-game" class="icon-button" aria-label="${tr("Jeda", "Pause")}">Ⅱ</button></div><div id="game-stage" class="game-stage"></div><div id="play-hint" class="play-hint"></div>${touch ? `<div id="joystick" class="joystick" role="group" aria-label="${tr("Joystick gerakan", "Movement joystick")}"><span id="stick"></span></div><div class="action-controls"><button id="hit-action" class="action-button action-hit" aria-label="${tr("Tebas semak", "Clear shrubs")}"><b>B</b><small>${tr("TEBAS", "HIT")}</small></button><button id="jump-action" class="action-button action-jump" aria-label="${tr("Lompat", "Jump")}"><b>A</b><small>${tr("LOMPAT", "JUMP")}</small></button></div>` : ""}<div id="game-overlay"></div></main>`;
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
    `<main class="page narrow"><div class="eyebrow">MODERN HIDDEN MAZE</div><h1>${tr("Apa yang ada<br>di balik kabut?", "What’s waiting<br>beyond the mist?")}</h1><p class="lead">${tr("Temukan gerbang emas bersama sahabat rimba. Peta terbuka saat kamu menjelajah.", "Find the golden gate with your forest friend. Reveal the world as you explore.")}</p><label>${tr("Tingkat tantangan", "Choose your challenge")}</label><div class="difficulty">${(["medium", "hard", "extreme"] as Difficulty[]).map((d) => `<button id="difficulty-${d}" class="${d === currentDifficulty ? "selected" : ""}"><b>${d.toUpperCase()}</b><small>${modernSettings[d].vision} ${tr("jarak pandang", "vision radius")}</small></button>`).join("")}</div><div class="setup-actions">${button(tr("Jelajahi sendiri", "Explore solo"), "solo")}<div class="divider">${tr("ATAU BERSAMA TEMAN", "OR EXPLORE TOGETHER")}</div><div class="input-row">${button("Race · 2–4", "race", "secondary", lab || !multiplayerConfigured())}${button("Co-op · 2–4", "coop", "secondary", lab || !multiplayerConfigured())}</div><form id="join-form"><label for="room-code">${tr("Punya kode room?", "Have a room code?")}</label><div class="input-row"><input id="room-code" maxlength="6" minlength="6" placeholder="ABC234" autocomplete="off" ${lab || !multiplayerConfigured() ? "disabled" : ""}>${button(tr("Gabung", "Join"), "join", "secondary", lab || !multiplayerConfigured())}</div></form></div><p class="small">${lab ? tr("Main bersama tidak tersedia dalam uji kontrol lokal.", "Play together is unavailable in the local control lab.") : !multiplayerConfigured() ? tr("Main bersama belum tersedia.", "Play together is currently unavailable.") : tr("Room privat · tanpa chat · maksimal empat pemain", "Private rooms · no chat · up to four players")}</p></main>`,
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
    "Joystick / WASD · A / Spasi: lompat · B / J: tebas semak",
    "Joystick / WASD · A / Space: jump · B / J: clear shrubs",
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
    onActionChange: (kind, active) => {
      const b = el(kind === "jump" ? "jump-action" : "hit-action");
      b?.classList.toggle("active", active);
      b?.setAttribute("aria-pressed", String(active));
    },
    onFeedback: (count) => {
      if (count) toast(tr("Semak terbuka!", "Shrub cleared!"));
    },
    onAction: room
      ? async (kind) => {
          try {
            const { room: r } = await roomAction("ability", {
              code: room.id,
              profileId: profile!.id,
              kind,
            });
            if (activeRoom?.id === r.id) applyRoom(r);
            return true;
          } catch (e) {
            showError(e);
            return false;
          }
        }
      : undefined,
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
  for (const [id, kind] of [
    ["jump-action", "jump"],
    ["hit-action", "hit"],
  ] as const) {
    const b = el(id);
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      modern.useAction(kind);
    });
    b.addEventListener("click", (e) => {
      if (e.detail === 0) modern.useAction(kind);
    });
  }
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
    `<main class="page wardrobe-page"><section><div class="eyebrow">${tr("KARAKTER & KOSTUM", "CHARACTER & OUTFITS")}</div><h1>${tr("Gaya kecil.<br>Petualangan besar.", "Little style.<br>Big adventure.")}</h1><p>${tr("Binturong fantasi · semua kostum memiliki kemampuan setara.", "Fantasy binturong · every outfit has equal abilities.")}</p><div id="outfit-preview"></div></section><section class="outfit-options"><p class="eyebrow">${stars} ★ ${tr("DIKUMPULKAN", "COLLECTED")}</p>${outfits.map(([id, name, min]) => `<button id="outfit-${id}" class="outfit ${profile!.outfit === id ? "selected" : ""}" ${stars < min ? "disabled" : ""}><b>${name}</b><span>${stars < min ? `${min} ★` : profile!.outfit === id ? tr("DIPAKAI", "EQUIPPED") : tr("PAKAI", "EQUIP")}</span></button>`).join("")}<div class="parent-note"><b>${tr("Area orang tua", "Parent area")}</b><p>${tr("Kumpulkan bintang untuk membuka kostum baru. Semua kostum memiliki kemampuan setara.", "Collect stars to unlock new outfits. Every outfit has equal abilities.")}</p><p>${adFree ? tr("Status akun: bebas iklan", "Account: ad-free") : tr("Status akun: gratis", "Account: free")}</p></div></section></main>`,
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
    m.syncActions(r.players, playerKey, r.broken || {}, serverNow());
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
