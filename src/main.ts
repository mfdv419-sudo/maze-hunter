import {screenArt} from './game/screen-art';
import {adventureAreas,areaThemes,areaName,areaSize,type AdventureArea} from './game/areas';
import {expeditionQuests} from './game/expedition-quests';
import {fieldGuideContent} from './game/field-guide';
import {mazeTransition} from './systems/transitions';
import {appearanceOf,permittedAppearance,cosmetics,slots,stats,cosmeticQuests,type Slot} from './services/cosmetics';
import {primaryObjective,areaInformation,nearbyInformation} from './game/navigation';
import {recordExpedition} from './services/local';
import {zones} from './game/adventure-zones';
import {recordRun,readRuns} from "./services/records";
import {adventureRules,nextMap} from "./game/adventure-layout";
import {readPreferences,writePreferences,furColors} from "./services/preferences";
import {bindJoystick} from "./game/touch-controls";
import "./style.css";
import "./presentation.css";
import { authErrorInfo, loginErrorDetails, safeLoginText } from "./services/auth-errors";
import { tone, isMuted, setMuted,unlockAudio,setAudioScene,sfx,audioVolumes,setAudioVolumes } from "./systems/audio";
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
  clearSegment,
  modernSettings,
  type Difficulty,
  type Point,
} from "./game/maze";
import type { ModernGame } from "./game/modern";
import type { RetroGame } from "./game/retro";
import { loadAds, betweenLevels } from "./services/ads";
const root = document.querySelector<HTMLDivElement>("#game")!;
window.addEventListener('pointerdown',unlockAudio,{once:true,capture:true});
window.addEventListener('keydown',unlockAudio,{once:true,capture:true});
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
const buildLabel = "26.10.26";
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
  return `<button id="${id}" class="game-button ${cls}" ${disabled ? "disabled" : ""}>${label}</button>`;
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
  if(screen==="modern")document.querySelector(".game-toast")?.remove();
  n.className = screen==="modern"?"toast game-toast":"toast";
  n.role = "status";
  n.textContent = message;
  document.body.append(n);
  setTimeout(() => n.remove(), screen==="modern"?2800:6000);
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
  return `<header><a href="#" id="brand" aria-label="Maze Hunter home"><span class="brand-mark">▥</span> MAZE<span>HUNTER</span></a><div class="header-right">${profile ? `<button class="profile-pill" id="profiles"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg>${esc(profile.name)}</button>` : ""}<button class="quiet" id="sound-toggle" aria-label="${tr("Suara", "Sound")}">${isMuted() ? "♪ ×" : "♪"}</button><button class="language" id="language" aria-label="Change language">${lang === "id" ? "ID / EN" : "EN / ID"}</button>${uid && !lab ? `<button class="quiet" id="logout">${tr("Keluar akun", "Sign out")}</button>` : ""}</div></header>`;
}
function rememberAdventure(){const state=(game as ModernGame|null)?.adventure;if(!state||!profile||state.sample)return;recordExpedition(profile,state.area==='classic'?`${state.difficulty}-${state.mapIndex}`:`${state.area}-${state.difficulty}-${state.mapIndex}`,{coins:state.coins,stars:state.stars.size,chests:state.chests.size,zones:[...state.visitedZones]});void save();}
function begin(name: string, html: string) {
  mazeTransition(root,root.dataset.screen||'',name);rememberAdventure();
  generation++;
  setAudioScene(name);
  cleanup();
  cleanup = () => {};
  game?.dispose();
  game = null;
  screen = name;
  root.dataset.screen = name;
  root.style.setProperty('--scene-art',`url("${screenArt(name==='scores'?'mountain':name==='profiles'?'coast':name==='collection'?'desert':name==='map'?'forest':selectedArea||'forest',name.length%4)}")`);
  root.innerHTML = `${lab ? `<div class="lab-banner">${tr("LAB KONTROL LOKAL · Tanpa login, cloud, pembelian, atau multiplayer", "LOCAL CONTROL LAB · No login, cloud, purchases, or multiplayer")}</div>` : ""}${header()}${html}`;
  if(['setup','lobby','modern'].includes(name)){
   const rotate=document.createElement('div');rotate.className='adventure-rotation';rotate.innerHTML=`<section><svg width="88" height="88" viewBox="0 0 88 88" fill="none" stroke="currentColor" stroke-width="3"><rect x="18" y="28" width="52" height="32" rx="6"/><path d="M18 16A35 35 0 0 1 78 40m-7-8 7 8 5-10M70 73A35 35 0 0 1 9 48m7 8-7-8-5 10"/></svg><h2>${tr('Putar perangkatmu','Rotate your device')}</h2><p>${tr('Adventure dimainkan dalam landscape. Retro bisa dimainkan dalam portrait maupun landscape.','Adventure plays in landscape. Retro supports portrait and landscape.')}</p><small>${activeRoom?tr('Pertandingan online tetap berlangsung.','Your online match continues.'):tr('Permainan Solo berhenti sementara saat layar portrait.','Solo gameplay pauses while the screen is portrait.')}</small>${button(tr('Kembali ke Home','Back to Home'),'rotate-home','secondary')}</section>`;root.append(rotate);click('rotate-home',()=>activeRoom?confirmLeave():home());
  }
  click("brand", () =>
    activeRoom ? confirmLeave() : game ? pauseOverlay() : home(),
  );
  click("profiles", () =>
    activeRoom ? confirmLeave() : game ? pauseOverlay() : profiles(),
  );
  click("language", () => {
    lang = lang === "id" ? "en" : "id";
    localStorage.setItem("mh-language", lang);
    el("language").textContent=lang==="id"?"ID / EN":"EN / ID";
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
    if(screen==="scores")scores();
    else if (screen === "map") journey();
    else if (screen === "profiles") profiles();
    else if(screen==="collection")collection();
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
async function preview(id: string, outfit = "classic",view:'front'|'back'|'tail'='front',focus:Slot|'full'='full') {
  const token = generation;
  try {
    const { characterPreview } = await import("./game/modern");
    if (token !== generation) return;
    cleanup = characterPreview(el(id), outfit,furColors[readPreferences().fur],profile?appearanceOf(profile,readPreferences().fur):undefined,view,focus);
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
      <div class="mode-selector" role="group" aria-label="${tr("Pilih petualangan", "Choose your adventure")}">
        <button id="retro-mode" class="mode-tile" aria-pressed="${homeMode === "retro"}"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 8h36v32H6V8m9 0v12h16v12H15v8m27-20H31V8"/><path class="mode-route" d="M7 28h16v-8h17"/><circle cx="7" cy="28" r="3"/></svg><span><b>RETRO JOURNEY</b><small>${tr("Sentuh & telusuri jalurnya", "Touch & trace your path")}</small></span><i>✓</i></button>
        <button id="modern-mode" class="mode-tile" aria-pressed="${homeMode === "modern"}"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m5 19 19-11 19 11v20L24 28 5 39V19m19-11v20m-10 6V21l10-6 10 6v13"/><path class="mode-route" d="m18 33 6-4 6 4"/></svg><span><b>ADVENTURE</b><small>${tr("Jelajahi labirin dalam 3D", "Explore the maze in 3D")}</small></span><i>✓</i></button>
      </div>
      <div class="scene-caption"><span class="scene-eyebrow">${tr("SAHABAT PETUALANGANMU", "YOUR ADVENTURE COMPANION")}</span><strong>${profile?esc(profile.name):tr("Sahabat Rimba", "Forest Friend")}</strong><span id="scene-description">${homeMode === "retro" ? tr("Temukan buah favorit binturong", "Find the binturong’s favorite figs") : tr("Temukan jalan di balik kabut", "Find your way through the fog")}</span></div>
      <div class="mascot-hint">${tr("Ketuk untuk lompat · tahan & geser untuk putar", "Tap to jump · hold & drag to rotate")} <span>↗</span></div>
      <div class="title-tools">${button("⚙", "settings", "round-tool")}${profile?button('<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 3h10v6a5 5 0 0 1-10 0V3Zm0 2H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 2v7m-5 0h10"/></svg>',"scores","round-tool"):""}${button("?", "how", "round-tool")}${profile ? button('<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3-6 4 3 5 3-1v10h8V11l3 1 3-5-6-4c-1 3-7 3-8 0Z"/></svg>', "wardrobe", "round-tool") : ""}${button('<svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>', "fullscreen", "round-tool")}</div>
      ${profile ? `<div class="title-progress">★ ${Object.values(profile.retro).reduce((n, r) => n + r.stars, 0)} <span>${tr("LEVEL", "LEVEL")} ${unlocked(profile)}</span></div>` : ""}
      ${profile?`<div class="home-collection"><button id="collection-open"><b>◉ ${stats(profile).coins}</b><span>${tr('KOLEKSI & MISI','COLLECTION & QUESTS')}</span><small>${cosmetics.filter(c=>{const s=stats(profile!);return s.stars>=c.stars&&s.wins>=(c.wins||0);}).length}/${cosmetics.length}</small></button></div>`:''}
      ${import.meta.env.DEV && !profile ? button("Uji kontrol", "lab", "dev-lab") : ""}
    </main>`,
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
        const world = menuWorld(el("title-world"), profile?.outfit, lang, homeMode,furColors[readPreferences().fur],profile?appearanceOf(profile,readPreferences().fur):undefined);
        cleanup = world.dispose;
        setPreview = world.setMode;
      }
    })
    .catch(showError);
  const enterMode = async (play:HTMLButtonElement) => {
    if (profile) return homeMode === "retro" ? journey() : setup();
    if (cloudConfigured) {
      if ([el<HTMLButtonElement>('retro-mode'),el<HTMLButtonElement>('modern-mode')].some(b=>b.disabled)) return;
      signInPanel(tr("Membuka Google…", "Opening Google…"), tr("Selesaikan masuk di jendela Google. Tunggu sampai proses masuk selesai.", "Complete sign-in in the Google window. Wait for this attempt to finish."));
      const label = play.innerHTML;
      for(const id of ['retro-mode','modern-mode'])el<HTMLButtonElement>(id).disabled=true;
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
        if (play.isConnected) {for(const id of ['retro-mode','modern-mode'])el<HTMLButtonElement>(id).disabled=false;play.innerHTML = label;}
      }
    } else toast(
            tr(
              "Petualangan belum tersedia. Coba lagi sebentar.",
              "Adventure is unavailable. Please try again shortly.",
            ),
          );
  };
  const version = document.createElement("small");
  version.className = "build-label";
  version.textContent = buildLabel;
  el("title-world").parentElement!.append(version);
  el("scores")?.setAttribute("aria-label",tr("Peringkat keluarga", "Family records"));
  click("scores",()=>scores());
  click("settings", () => settings());
  click("how", () => instructions());
  function chooseMode(mode: "retro" | "modern") {
    homeMode = mode;
    if (profile) return mode === "retro" ? journey() : setup();
    void enterMode(el<HTMLButtonElement>(mode === "retro" ? "retro-mode" : "modern-mode"));
    el("retro-mode").setAttribute("aria-pressed", String(mode === "retro"));
    el("modern-mode").setAttribute("aria-pressed", String(mode === "modern"));
    el("scene-description").textContent = mode === "retro" ? tr("Temukan buah favorit binturong", "Find the binturong’s favorite figs") : tr("Temukan jalan di balik kabut", "Find your way through the fog");
    setPreview?.(mode);
    tone(mode === "retro" ? 520 : 660);
  }
  click("retro-mode", () => chooseMode("retro"));
  click("modern-mode", () => chooseMode("modern"));
  click("wardrobe", () => wardrobe());click("collection-open",()=>collection());
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
function settings() {
  const prefs=readPreferences(),volumes=audioVolumes(),overlay=document.createElement('div');overlay.className='modal-backdrop';
  overlay.innerHTML=`<section class="modal settings-modal" role="dialog" aria-modal="true"><div class="eyebrow">${tr('PENGATURAN','SETTINGS')}</div><h2>${tr('Nyaman di tanganmu.','Made for your hands.')}</h2><label>${tr('Warna bulu','Fur color')}<select id="fur-choice">${profile?.appearance&&!["charcoal","brown","silver"].includes(profile.appearance.palette)?`<option value="custom">${tr("Palet kostum yang dipakai","Equipped costume palette")}</option>`:""}<option value="charcoal">${tr('Abu arang','Charcoal')}</option><option value="brown">${tr('Cokelat hangat','Warm brown')}</option><option value="silver">${tr('Perak','Silver')}</option></select></label><label>Joystick<select id="stick-choice"><option value="fixed">${tr('Tetap (bawaan)','Fixed (default)')}</option><option value="floating">${tr('Mengikuti sentuhan','Touch position')}</option></select></label><label>${tr('Ukuran kontrol','Control size')}<input id="control-size" type="range" min="0.8" max="1.25" step=".05" value="${prefs.controlScale}"></label><label>${tr('Jarak dari kiri','Left margin')}<input id="control-left" type="range" min="10" max="90" value="${prefs.left}"></label><label>${tr('Jarak dari bawah','Bottom margin')}<input id="control-bottom" type="range" min="35" max="180" value="${prefs.bottom}"></label><label>${tr('Kamera Adventure','Adventure camera')}<select id="camera-choice"><option value="follow">${tr('Sudut nyaman · bebas','Comfortable · free camera')}</option><option value="overview">${tr('Pandangan tinggi','High view')}</option><option value="level">${tr('Sejajar karakter','Character eye level')}</option></select></label><label>${tr('Musik','Music')}<input id="music-volume" type="range" min="0" max="1" step=".05" value="${volumes.music}"></label><label>${tr('Efek suara','Sound effects')}<input id="effects-volume" type="range" min="0" max="1" step=".05" value="${volumes.effects}"></label>${button(tr('SIMPAN','SAVE'),'save-settings')}${button(tr('Batal','Cancel'),'cancel-settings','quiet')}</section>`;
  document.body.append(overlay);el<HTMLSelectElement>('fur-choice').value=profile?.appearance?(['charcoal','brown','silver'].includes(profile.appearance.palette)?profile.appearance.palette:'custom'):prefs.fur;el<HTMLSelectElement>('stick-choice').value=prefs.joystick;el<HTMLSelectElement>('camera-choice').value=prefs.camera;
  click('cancel-settings',()=>overlay.remove());click('save-settings',()=>{writePreferences({fur:(el<HTMLSelectElement>('fur-choice').value==='custom'?prefs.fur:el<HTMLSelectElement>('fur-choice').value) as typeof prefs.fur,joystick:el<HTMLSelectElement>('stick-choice').value as typeof prefs.joystick,controlScale:Number(el<HTMLInputElement>('control-size').value),left:Number(el<HTMLInputElement>('control-left').value),bottom:Number(el<HTMLInputElement>('control-bottom').value),camera:el<HTMLSelectElement>('camera-choice').value as typeof prefs.camera});if(profile?.appearance&&el<HTMLSelectElement>('fur-choice').value!=='custom'){profile.appearance.palette=el<HTMLSelectElement>('fur-choice').value;profile.updatedAt=Date.now();void save();}setAudioVolumes(Number(el<HTMLInputElement>('music-volume').value),Number(el<HTMLInputElement>('effects-volume').value));overlay.remove();home();});
}
function fieldGuide(){
 if(document.getElementById('field-guide'))return;
 const current=game,token=generation,wasRunning=!!game&&(screen==='retro'?(game as RetroGame).state.phase==='playing':screen==='modern'&&!(game as ModernGame).paused);
 if(wasRunning)current?.setPaused(true);
 const overlay=document.createElement('div');overlay.id='field-guide';overlay.className='modal-backdrop';overlay.innerHTML=`<section class="modal field-guide" role="dialog" aria-modal="true" aria-labelledby="field-guide-title"><div class="guide-heading"><div><div class="eyebrow">${tr('BUKU PENJELAJAH','EXPLORER HANDBOOK')}</div><h2 id="field-guide-title">${tr('Kenali benda di rimbamu','Know your forest items')}</h2></div>${button('×','close-field-guide','round-tool')}</div>${activeRoom?`<p class="guide-online">${tr('Pertandingan online tetap berjalan saat buku dibuka.','Online matches keep running while this book is open.')}</p>`:''}<div class="guide-grid">${fieldGuideContent(lang,game&&'adventure' in game&&game.adventure?{sample:game.adventure.sample,expedition:game.adventure.expedition,sealGoal:game.adventure.sealGoal}:undefined)}</div></section>`;document.body.append(overlay);el('close-field-guide').focus();
 const close=()=>{overlay.remove();document.removeEventListener('keydown',escape,true);if(token===generation&&current===game&&wasRunning)current?.setPaused(false);el('item-guide')?.focus();};
 const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopImmediatePropagation();close();}};document.addEventListener('keydown',escape,true);click('close-field-guide',close);
}
function instructions() {
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop";
  overlay.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><div class="eyebrow">MAZE HUNTER</div><h2>${tr("Dua cara menemukan jalan.", "Two ways to find your path.")}</h2><p><b>Retro:</b> ${tr("Bantu binturong menemukan buah. Pilih cabang dengan teliti. Masuk jalan buntu mengurangi satu nyawa dan kembali ke Start. Menyentuh tembok atau mengangkat jari tidak mengurangi nyawa. Mulai level 41, gerbang membawa ke peta berikutnya dalam level yang sama. Waktu dan nyawa berlanjut; buah hanya ada di peta terakhir. Jalan buntu mengembalikanmu ke Start level di peta pertama.", "Help the binturong find figs. Reaching a dead end costs a life and returns you to Start. Touching walls or lifting your finger costs no life. From level 41, gates lead to another map in the same level. Time and lives carry over; figs appear only on the last map. A dead end returns you to the level Start on map 1.")}</p><p><b>Adventure:</b> ${tr("Joystick mengikuti arah layar. Karakter menghadap arah jalan. Geser kanan layar untuk kamera. Lompat ke tepian batu untuk berpegangan, lalu A untuk naik. Ambil tiga Segel Rimba berupa kristal toska melayang dengan mendekatinya. Di arena Raja, kue otomatis bertambah 1 tiap 2 detik (maksimal 8); hindari serangan saat menunggu. Hadapi Raja tiga fase, lalu berlomba melewati gerbang sebelum hitung mundur habis. A / Spasi: lompat sungai. B / J: lempar kue atau tebas pagar rumput. Minimap menyimpan area yang ditemukan. Kalah dari Raja pada Hard/Extreme menghapus penemuan peta, bukan segel.", "Joystick follows the screen; drag the right side to orbit. Jump toward marked ledges to grab, then A to climb. Walk into three floating turquoise crystals to collect Forest Seals. In the King arena, cakes refill by 1 every 2 seconds (maximum 8); dodge while waiting. Defeat the three-phase King, then escape before the countdown ends. A / Space: jump rivers. B / J: throw cake or cut grass. The minimap remembers discoveries. Losing to a King on Hard/Extreme resets discoveries, but preserves seals.")}</p>${button(tr("Panduan benda", "Item guide"), "help-items")}${button(tr("Mengerti", "Got it"), "close-help")}</section>`;
  document.body.append(overlay);
  click("help-items",()=>{overlay.remove();fieldGuide();});
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
    `<main class="page journey-page"><div class="page-top"><div><div class="eyebrow">RETRO JOURNEY · ${String(r + 1).padStart(2, "0")} / 10</div><h1>${regions[r][lang === "id" ? 0 : 1]}</h1><p>${tr("Ikuti jalurmu, satu belokan pada satu waktu.", "Follow your path, one turn at a time.")}</p></div>${button(tr("Cara bermain", "How to play"), "help", "secondary")}</div><div class="journey-land"><div class="landmark mountain mountain-a"></div><div class="landmark mountain mountain-b"></div><svg class="journey-path" viewBox="0 0 1000 460" preserveAspectRatio="none"><path d="M 70 280 C 200 100, 240 100, 360 260 S 550 420, 620 240 S 810 80, 930 220"/></svg>${Array.from(
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
  return `<main class="play-screen"><div class="playbar"><button id="exit-game" class="icon-button" aria-label="${tr("Keluar permainan", "Exit game")}">←</button><div><b>${title}</b><small>${sub}</small></div><div id="hud-stats" class="hud-stats"></div><button id="item-guide" class="icon-button" aria-label="${tr("Panduan benda","Item guide")}" title="${tr("Panduan benda","Item guide")}">?</button><button id="pause-game" class="icon-button" aria-label="${tr("Jeda", "Pause")}">Ⅱ</button></div><div id="game-stage" class="game-stage"></div><div id="play-hint" class="play-hint"></div>${touch ? `<div id="joystick" class="joystick" role="group" aria-label="${tr("Joystick gerakan", "Movement joystick")}"><span id="stick"></span></div><div class="action-controls"><button id="hit-action" class="action-button action-hit" aria-label="${tr("Lempar kue / tebas rumput", "Throw cake / cut grass")}"><b>B</b><small>${tr("KUE", "CAKE")}</small></button><button id="jump-action" class="action-button action-jump" aria-label="${tr("Lompat", "Jump")}"><b>A</b><small>${tr("LOMPAT", "JUMP")}</small></button></div>` : ""}<div id="game-overlay"></div></main>`;
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
      : playModern(currentDifficulty,undefined,true),
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
    button("+", "zoom-in", "icon-button") + button("⊡", "zoom-fit", "icon-button");
  el("pause-game").before(zoom);
  el("zoom-fit").setAttribute("aria-label",tr("Lihat seluruh peta","View full map"));
  click("zoom-fit",()=>{(game as RetroGame)?.overview();});
  click("zoom-in", () => {
    (game as RetroGame)?.zoom(0.5);
    toast(
      tr(
        "Saat zoom: geser area di luar binturong untuk menggeser peta.",
        "While zoomed: drag away from the binturong to pan.",
      ),
    );
  });
  click("zoom-out", () => {
    (game as RetroGame)?.zoom(-0.5);
  });
  const token = generation;
  el("play-hint").textContent = tr(
    "Bantu binturong mencari buah · jalan buntu: kembali ke Start, −1 nyawa",
    "Help the binturong find figs · dead end: back to Start, −1 life",
  );
  click("item-guide",fieldGuide);
  click("pause-game", () => pauseOverlay());
  click("exit-game", () => pauseOverlay());
  const { RetroGame } = await import("./game/retro");
  if (token !== generation) return;
  game = new RetroGame(el("game-stage"), {
    level,language:lang,
    onTick: (s) => {
      el("hud-stats").innerHTML =
        `<span class="lives">${"♥".repeat(s.lives)}${"♡".repeat(3 - s.lives)}</span><span>${s.boards.length>1?`${tr("PETA","MAP")} ${s.pageIndex+1}/${s.boards.length} · `:""}${Math.ceil(s.config.seconds - s.elapsed)}s</span>`;
      const subtitle=el("play-hint");subtitle.textContent=s.finalPage?tr("Cari buah · jalan buntu: kembali ke Start level, −1 nyawa","Find figs · dead end: back to the level Start, −1 life"):tr("Cari gerbang ke peta berikutnya · jalan buntu: kembali ke peta 1, −1 nyawa","Find the gate to the next map · dead end: back to map 1, −1 life");
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
let currentDifficulty:Difficulty='medium';
let selectedArea:AdventureArea='forest';
const backdropCache=new Map<string,string>();
async function adventurePreview(area:AdventureArea){
 const target=el('adventure-preview');if(!target)return;const token=generation,key=area+':'+JSON.stringify(profile?appearanceOf(profile):{});target.style.backgroundImage=`url("${screenArt(area)}")`;if(backdropCache.has(key)){target.style.backgroundImage=`url("${backdropCache.get(key)}")`;return;}
 try{const{ModernGame}=await import('./game/modern');if(token!==generation)return;const host=document.createElement('div');host.style.cssText='position:fixed;width:960px;height:620px;left:-2000px;top:0;pointer-events:none';document.body.append(host);const capture=new ModernGame(host,{difficulty:'medium',seed:15025,adventureMap:0,area,entrance:0,outfit:profile?.outfit||'classic',appearance:profile?appearanceOf(profile):undefined,onTick:()=>{},onFinish:()=>{}});try{const data=capture.captureBackdrop();backdropCache.set(key,data);if(backdropCache.size>12)backdropCache.delete(backdropCache.keys().next().value!);if(token===generation&&target.isConnected)target.style.backgroundImage=`url("${data}")`;}finally{capture.dispose();host.remove();}}
 catch(e){console.warn('Scene preview unavailable',e);}
}
function adventureHelp(){const overlay=document.createElement('div');overlay.className='modal-backdrop';overlay.innerHTML=`<section class="modal adventure-help" role="dialog" aria-modal="true"><div class="eyebrow">MAZE HUNTER · ADVENTURE</div><h2>${tr('Siap menjelajah?','Ready to explore?')}</h2><ol><li>${tr('Pilih area dan tingkat kesulitan, lalu main Solo atau Online. Labirin Asli mempertahankan rute Solo yang sudah ada.','Choose an area and difficulty, then play Solo or Online. Original Maze retains the existing Solo routes.')}</li><li>${tr('Joystick kiri untuk berjalan; geser sisi kanan untuk kamera. A untuk lompat dua kali atau panjat, B untuk lempar kue, tebas dan cari bekal. Di air dalam gunakan Selam / Permukaan (V); kelapa dengan cincin emas bisa dipanjat.','Left joystick moves; drag the right side for camera. A double jumps or climbs; B throws cakes, cuts and gathers supplies. In deep water use Dive / Surface (V); beach palms with gold rings can be climbed.')}</li><li>${tr('Buka jurnal untuk petunjuk quest. Cari segel, kalahkan penjaga dan Raja, lalu capai gerbang. Minimap menyimpan area yang ditemukan.','Open the journal for quest clues. Collect seals, defeat guardians and the King, then reach the gate. The minimap remembers discoveries.')}</li><li>${tr('Online: pilih area lalu Race atau Co-op. Medium 4, Hard 8, Extreme 10 pemain. Co-op membutuhkan 3 segel per anggota tim.','Online: choose an area, then Race or Co-op. Medium 4, Hard 8, Extreme 10 players. Co-op needs three seals per team member.')}</li></ol>${button(tr('Panduan benda','Item guide'),'setup-guide-items','secondary')}${button(tr('Mengerti','Got it'),'setup-guide-close')}</section>`;document.body.append(overlay);click('setup-guide-close',()=>overlay.remove());click('setup-guide-items',()=>{overlay.remove();fieldGuide();});}
function setup(){
 if(!profile)return home();const theme=areaThemes[selectedArea];
 begin('setup',`<main class="page adventure-select"><section class="adventure-poster"><div id="adventure-preview"></div><div class="poster-copy"><span class="eyebrow">MAZE HUNTER</span><h1>ADVENTURE</h1><p>${theme.hint[lang==='id'?0:1]}</p><span class="poster-chip">${areaName(selectedArea,lang)} · ${areaSize(selectedArea,currentDifficulty)} × ${areaSize(selectedArea,currentDifficulty)}</span></div></section><section class="expedition-picker"><div class="picker-heading"><div><span class="eyebrow">${tr('PILIH PETUALANGANMU','CHOOSE YOUR EXPEDITION')}</span><h2>${tr('Dunia di balik labirin','Worlds beyond the maze')}</h2></div>${button('?','setup-guide','round-tool')}</div><div class="area-options" role="group" aria-label="${tr('Pilihan area','Area selection')}">${adventureAreas.map((area,i)=>`<button id="area-${area}" class="area-option ${selectedArea===area?'selected':''}" aria-pressed="${selectedArea===area}" style="--area-color:#${areaThemes[area].wall.toString(16)};background-image:linear-gradient(#153b4244,#153b42cc),url('${screenArt(area,i)}')"><b>${areaName(area,lang)}</b></button>`).join('')}</div><div class="difficulty">${(['medium','hard','extreme']as Difficulty[]).map(d=>`<button id="difficulty-${d}" class="${d===currentDifficulty?'selected':''}"><b>${d.toUpperCase()}</b><small>${areaSize(selectedArea,d)} × ${areaSize(selectedArea,d)} · ${{medium:4,hard:8,extreme:10}[d]} ${tr('pemain maks.','players max.')}</small></button>`).join('')}</div><div class="picker-objectives"><span><i class="seal-example"></i>${tr('Cari segel','Find seals')}</span><span>♛ ${tr('Hadapi Raja','Face the King')}</span><span>▥ ${tr('Temukan gerbang','Find the gate')}</span></div><div class="setup-actions">${button(tr('MAIN SOLO','PLAY SOLO'),'explore-area')}${button('ONLINE','online-menu','secondary')}</div></section></main>`);
 click('setup-guide',adventureHelp);for(const area of adventureAreas)click('area-'+area,()=>{selectedArea=area;setup();});for(const d of['medium','hard','extreme']as Difficulty[])click('difficulty-'+d,()=>{currentDifficulty=d;setup();});
 click('explore-area',()=>playModern(currentDifficulty,undefined,false,false,selectedArea));void adventurePreview(selectedArea);
 click('online-menu',()=>{
  if(lab||!multiplayerConfigured()){toast(tr('Main online memerlukan login Google dan koneksi server.','Online play needs Google login and a configured server.'));return;}
  const overlay=document.createElement('div');overlay.className='modal-backdrop';overlay.innerHTML=`<section class="modal online-modal" role="dialog" aria-modal="true"><div class="eyebrow">${areaName(selectedArea,lang)} · ${currentDifficulty.toUpperCase()}</div><h2>${tr('Petualangan bersama','Explore together')}</h2><label>${tr('Jenis pertandingan','Match type')}<select id="online-mode"><option value="race">Race</option><option value="coop">Co-op</option></select></label>${button(tr('CARI PEMAIN ACAK','FIND RANDOM PLAYERS'),'random-room')}${button(tr('BUAT ROOM PRIVAT','CREATE PRIVATE ROOM'),'private-room','secondary')}<div class="input-row"><input id="join-code" maxlength="6" placeholder="ABC234" aria-label="Room code">${button(tr('GABUNG','JOIN'),'join-room','secondary')}</div>${button(tr('Tutup','Close'),'close-online','quiet')}</section>`;document.body.append(overlay);
  const resume=sessionStorage.getItem('mh-active-room');if(resume){const b=document.createElement('button');b.textContent=tr('LANJUTKAN ROOM ','RECONNECT ROOM ')+resume;b.onclick=()=>{void roomAction('reconnect',{profileId:profile!.id,code:resume}).then(r=>enterRoom(r.room,r.playerKey)).then(()=>overlay.remove()).catch(showError);};overlay.querySelector('section')!.prepend(b);}
  const mode=()=>el<HTMLSelectElement>('online-mode').value as 'race'|'coop',run=async(action:()=>Promise<void>)=>{try{await action();overlay.remove();}catch(e){showError(e);}};
  click('random-room',()=>run(async()=>{await save();const r=await roomAction('random',{profileId:profile!.id,difficulty:currentDifficulty,mode:mode(),area:selectedArea});await enterRoom(r.room,r.playerKey);}));click('private-room',()=>run(()=>createRoom(mode())));click('join-room',()=>run(()=>joinRoom(el<HTMLInputElement>('join-code').value.trim())));click('close-online',()=>overlay.remove());
 });
}
let currentAdventure:{difficulty:Difficulty;map:number;seed:number;sample?:boolean;area?:AdventureArea}|undefined;
let modernTimer: ReturnType<typeof setInterval> | null = null;
async function playModern(difficulty: Difficulty, room?: Room, reuse=false,forestSample=false,areaChoice:AdventureArea='classic') {
  if (!profile) return;
  const activeArea=room?.area||(reuse?currentAdventure?.area:areaChoice)||'classic';
  const sample=!room&&(forestSample||(reuse&&!!currentAdventure?.sample));
  currentDifficulty = difficulty;
  if (!navigator.onLine && !lab) {
    toast(
      tr(
        "Adventure memerlukan koneksi internet. Retro tersedia offline.",
        "Adventure needs an internet connection. Retro is available offline.",
      ),
    );
    return;
  }
  begin(
    "modern",
    hud(
      room ? `${room.mode.toUpperCase()} · ${room.id}` : sample?tr("HUTAN RIMBUN · SOLO","FOREST GROVE · SOLO"):areaName(activeArea,lang)+" · SOLO",
      difficulty.toUpperCase(),
      true,
    ),
  );
  const token = generation;
  el("play-hint").textContent = tr(
    "Joystick: arah layar · Geser kanan: kamera · A lompat 2× / panjat · B interaksi · ↕ sudut kamera",
    "Joystick: screen direction · Right drag: camera · A double jump / climb · B interact · ↕ camera angle",
  );
  click("item-guide",fieldGuide);
  click("pause-game", () => pauseOverlay(!!room));
  click("exit-game", () => (room ? confirmLeave() : pauseOverlay()));
  const { ModernGame } = await import("./game/modern");
  if (token !== generation) return;
  const me = room?.players[playerKey];
  if(!room&&(!reuse||!currentAdventure||currentAdventure.difficulty!==difficulty||currentAdventure.sample!==sample||currentAdventure.area!==activeArea))currentAdventure={difficulty,map:sample?0:nextMap(difficulty),seed:sample?12025:crypto.getRandomValues(new Uint32Array(1))[0],sample,area:activeArea};
  const objectives=document.createElement('div');objectives.className='adventure-objectives';objectives.id='adventure-objectives';el('game-stage').after(objectives);const tracker=document.createElement('div');tracker.id='objective-tracker';tracker.className='objective-tracker';objectives.after(tracker);const area=document.createElement('div');area.id='area-info';area.className='area-info';tracker.after(area);const interaction=document.createElement('div');interaction.id='interaction-info';interaction.className='interaction-info';area.after(interaction);
  const dive=document.createElement('button');dive.id='dive-action';dive.className='aquatic-action game-button secondary';dive.hidden=true;dive.textContent=tr('SELAM','DIVE');el('game-stage').after(dive);dive.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();modern.useAction('dive');});
  const shownLoot=new Set<number>();
  const journal=document.createElement('button');journal.id='quest-log';journal.className='quest-log icon-button';journal.setAttribute('aria-label',tr('Jurnal petualangan','Adventure journal'));journal.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/></svg>';el('game-stage').after(journal);
  journal.onclick=()=>{const s=modern.adventure!;const wasPaused=modern.paused;if(!room)modern.setPaused(true);const overlay=el('game-overlay');overlay.innerHTML=`<div class="modal-backdrop"><section class="modal expedition-journal" role="dialog" aria-modal="true"><div class="eyebrow">${tr('JURNAL PENJELAJAH','EXPLORER JOURNAL')}</div><h2>${tr('Jejak tiga segel','The seal trails')}</h2>${s.sealGoal>3?`<p>${tr('Target tim','Team goal')}: ◆ ${s.seals.size}/${s.sealGoal} · ${tr('Cari kristal tambahan di lorong yang ditemukan.','Find additional crystals along discovered corridors.')}</p>`:''}${s.expedition?expeditionQuests(s,lang).map((q,i)=>`<article class="expedition-task ${q.done?'complete':''}"><b>${q.done?'✓':'◆'} ${esc(q.title)}</b><p>${esc(q.clue)}</p><small>${q.done?tr('SELESAI','COMPLETE'):`${esc(q.direction)} · ${q.guardDone?tr('Penjaga dikalahkan — ambil segelnya','Guardian defeated — collect the seal'):tr('Penjaga masih melindungi segel','Guardian still protecting the seal')}`}</small></article>`).join(''):`<p>${tr('Jelajahi lorong dan cari kristal toska di area yang ditemukan.','Explore the corridors and look for turquoise crystals in discovered areas.')} ◆ ${s.seals.size}/${s.sealGoal}</p>`}<p>${tr('Setelah semua segel: cari arena Raja. Hindari serangannya lalu capai gerbang.','After collecting every seal, find the King arena. Dodge its attacks, then reach the gate.')}</p>${button(tr('LANJUTKAN','CONTINUE'),'journal-close')}</section></div>`;click('journal-close',()=>{overlay.innerHTML='';if(!room&&!wasPaused)modern.setPaused(false);});};
  let feedbackAt=-1,lastZone=-1;const bossMeter=document.createElement('div');bossMeter.id='boss-meter';bossMeter.className='boss-meter';bossMeter.hidden=true;el('game-stage').after(bossMeter);
  const modern = new ModernGame(el("game-stage"), {
    questTeam:room?.adventure?.questSlots?{slots:room.adventure.questSlots,slot:me!.slot,shared:room.mode==='coop'}:undefined,area:activeArea,enforceLandscape:true,forestSample:sample,difficulty,
    seed: room?.seed ?? currentAdventure!.seed,
    adventureMap:room?room.adventure?.map:currentAdventure!.map,
    color:furColors[readPreferences().fur],
    appearance:appearanceOf(profile,readPreferences().fur),
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
    onAdventure:(state)=>{
      const bossName=areaThemes[state.sample?'forest':state.area].boss[lang==='id'?0:1];
      if(state.lastLoot&&!shownLoot.has(state.lastLoot.id)){
       const loot=state.lastLoot;shownLoot.add(loot.id);const wasPaused=modern.paused;if(!room)modern.setPaused(true);const overlay=el('game-overlay');overlay.innerHTML=`<div class="modal-backdrop"><section class="modal loot-reveal center" role="dialog" aria-modal="true"><div class="loot-emblem">✦</div><div class="eyebrow">${tr('HARTA DITEMUKAN','TREASURE FOUND')}</div><h2>${tr('Bekal petualanganmu','Supplies for your journey')}</h2><div class="loot-items"><span>◉ <b>+${loot.coins}</b>${tr('Koin','Coins')}</span><span>⚿ <b>+${loot.keys}</b>${tr('Kunci','Key')}</span><span>▰ <b>+${loot.cakes}</b>${tr('Kue','Cakes')}</span><span>♥ <b>+${loot.hearts}</b>${tr('Nyawa','Hearts')}</span></div><p>${tr('Kue maksimal 8 · Nyawa maksimal 3','Maximum 8 cakes · Maximum 3 hearts')}</p>${button(tr('AMBIL & LANJUTKAN','COLLECT & CONTINUE'),'loot-close')}</section></div>`;click('loot-close',()=>{overlay.innerHTML='';if(!room&&!wasPaused)modern.setPaused(false);});
      }
      el('hud-stats').innerHTML=`<span class="lives">${'♥'.repeat(state.lives)}${'♡'.repeat(3-state.lives)}</span><span>${Math.ceil(state.remaining)}s</span>`;
      const nearbyBoss=state.guards.find(g=>g.boss&&!g.dead&&Math.hypot(g.position.x-state.position.x,g.position.y-state.position.y)<6&&clearSegment(state.grid,state.position,g.position,.05));
      if(state.expedition){const king=state.guards.find(g=>g.boss);bossMeter.hidden=!(king&&!king.dead&&state.stage==='boss');if(!bossMeter.hidden){const warning=state.hazards.find(h=>!h.resolved);bossMeter.innerHTML=`<strong>${areaThemes[state.sample?'forest':state.area].boss[lang==='id'?0:1]} · ${tr('FASE','PHASE')} ${state.bossPhase}</strong><progress max="${state.bossMaxHP}" value="${king!.hp}"></progress><small>${warning?`${warning.kind==='rockfall'?tr('RUNTUHAN BATU','FALLING ROCKS'):warning.kind==='lightning'?tr('PETIR','LIGHTNING'):warning.kind==='roots'?tr('AKAR','ROOTS'):tr('SERANGAN AREA','AREA ATTACK')} · ${Math.max(0,warning.at-state.elapsed).toFixed(1)}s`:state.bossVulnerable?tr('PELIN­DUNG PADAM · SERANG!','SHIELD DOWN · ATTACK!'):tr('PELIN­DUNG AKTIF · HINDARI','SHIELD ACTIVE · DODGE')}</small>`;}}
      tracker.textContent=primaryObjective(state,lang);const info=areaInformation(state,lang);area.innerHTML=`<strong>${esc(info.name)} · ${tr('Bahaya','Danger')}: ${esc(info.danger)}</strong><small>${esc(info.description)}</small>`;area.dataset.danger=String(info.level);area.title=info.description;interaction.textContent=nearbyInformation(state,lang);
      if(lastZone!==state.zone){lastZone=state.zone;const discovery=document.createElement('div');discovery.className='zone-discovery';discovery.innerHTML=`<strong>${esc(info.name)}</strong><span>${esc(info.description)}</span><small>${tr('Bahaya','Danger')}: ${esc(info.danger)} · +3 ${tr('koin penemuan pertama','coins on first discovery')}</small>`;document.querySelector('.zone-discovery')?.remove();el('game-stage').parentElement!.append(discovery);setTimeout(()=>discovery.remove(),3200);}
      objectives.classList.toggle('escape-active',state.stage==='escape');
      el('play-hint').textContent=state.stage==='escape'?tr('LARI! Gerbang terbuka — pilih jalurmu.','RUN! The gate is open — choose your route.'):state.stage==='boss'?`${bossName} · ${tr('FASE','PHASE')} ${state.bossPhase}`:state.expedition?info.name:zones[state.zone][lang==='id'?'idName':'enName'];
      dive.hidden=!state.swimming;dive.textContent=state.diving?tr('↑ PERMUKAAN','↑ SURFACE'):tr('↓ SELAM','↓ DIVE');dive.setAttribute('aria-pressed',String(state.diving));const jumpButton=el('jump-action');const jumpCaption=jumpButton.querySelector('small');if(jumpCaption)jumpCaption.textContent=state.climber.state.phase==='hanging'?tr('NAIK','CLIMB'):state.swimming?tr('NAIK','RISE'):tr('LOMPAT','JUMP');
      const action=el('hit-action');action.dataset.interaction=state.interaction;const caption=action.querySelector('small');if(caption)caption.textContent=state.interaction==='cut'?tr('TEBAS','CUT'):state.interaction==='harvest'?tr('CARI','SEARCH'):tr('KUE','CAKE');
      objectives.textContent=`${state.stage==='escape'?'⏳ '+Math.ceil(state.remaining)+'s · ':''}◆ ${state.seals.size}/${state.sealGoal}   ★ ${state.stars.size}/9   ${tr('KUE','CAKES')} ${state.ammo}/8   ♛ ${state.bossCleared?'✓':nearbyBoss?`${bossName} ${nearbyBoss.hp}♥`:tr('RAJA','KING')} · ${tr('PETA','MAP')} ${state.sample?tr("CONTOH HUTAN","FOREST SAMPLE"):areaName(state.area,lang)+" "+String(state.mapIndex+1)+"/10"} · ◉ ${state.coins} · ⚿ ${state.keys}${state.shield?' · ◇':''}`;
      if(state.messageAt!==feedbackAt&&state.message){feedbackAt=state.messageAt;const messages:Record<string,[string,string]>={'king-armored':['Pelindung Raja aktif. Hindari serangan; balas saat cahaya pelindung padam.','King armor active. Dodge, then counter when its shield fades.'],climb:['Tepian ditaklukkan! +5 koin.','Ledge climbed! +5 coins.'],'key-needed':['Perlu satu kunci untuk membuka jalan rahasia ini.','A key is needed to open this hidden route.'],escape:['Gerbang terbuka! Lari sebelum waktu habis!','Gate open! Escape before time runs out!'],fortress:['Raja penjaga bangkit. Perhatikan tanda serangannya!','The gate King awakens. Watch the attack indicators!'],tall:['Kue dan koin ditemukan.','Found cakes and coins.'],rare:['Hadiah langka! Kunci, pelindung dan kecepatan sementara.','Rare reward! A key, a shield and a temporary speed boost.'],danger:['Hadiah ditemukan, tetapi penjaga kecil terbangun!','Reward found, but a sapling guardian awakens!'],roots:['Akar memperlambatmu.','Roots slow you down.'],shield:['Pelindung menyerap serangan.','Shield absorbed the hit.'],'king-seals':['Temukan tiga segel untuk melemahkan pelindung Raja.','Find three seals to weaken the King’s shield.'],grass:['Jalur baru terbuka! Penjaga mendengar tebasanmu.','Shortcut opened! Guardians heard the cut.'],ammo:state.bossRefilling?['Kue habis: hindari serangan. Bekal arena mengisi +1 kue tiap 2 detik.','No cakes: dodge attacks. Arena supplies refill +1 cake every 2 seconds.']:['Kue habis. Cari peti atau kembali ke checkpoint.','No cakes left. Find a chest or return to your checkpoint.'],slow:['Terkena serangan! Melambat sebentar.','Hit! Slowed briefly.'],stun:['Terjebak! Berhenti sesaat.','Caught! Briefly stunned.'],respawn:['Kembali ke checkpoint. Peta tetap terbuka.','Back to checkpoint. Discoveries are kept.'],'boss-reset':['Kembali ke Start. Minimap tertutup; segel tetap tersimpan.','Back to Start. Map resets; seals are kept.'],'boss-win':['Raja dikalahkan! Fase pelarian dimulai.','King defeated! The final escape begins.'],'guard-win':['Penjaga menyerah. Kue bertambah!','Guardian defeated. More cakes!'],seal:['Segel ditemukan! Checkpoint tersimpan.','Seal found! Checkpoint saved.'],star:['Bintang ditemukan!','Star found!'],chest:['Peti harta! Kue dan nyawa dipulihkan.','Treasure! Cakes and a heart restored.'],gate:['Gerbang perlu 3 segel dan satu Raja dikalahkan.','The gate needs 3 seals and one defeated King.']};const text=messages[state.message];if(text){if(state.message!=='chest')toast(text[lang==='id'?0:1]);if(['seal','star','chest'].includes(state.message))sfx('pickup');if(state.message==='grass')sfx('cut');}}
    },
    onTick: (seconds, explored) => {
      if(modern.adventure)return;
      const elapsed = room
        ? Math.max(
            0,
            (serverNow() - (activeRoom?.startsAt || serverNow())) / 1000,
          )
        : seconds;
      el("hud-stats").textContent =
        `${Math.max(0, Math.ceil((room?modernSettings[difficulty].seconds:adventureRules[difficulty].seconds) - elapsed))}s · ${explored} ${tr("area", "tiles")}`;
    },
    onFinish: (won) => {
      rememberAdventure();tone(won ? 720 : 120, 0.18, "sine", 0.025);
      if (won && profile&&!sample) {
        profile.modernWins++;
        if(modern.adventure)recordRun(uid,{profileId:profile.id,name:profile.name,area:modern.adventure.area,difficulty,map:modern.adventure.mapIndex,seconds:modern.elapsed,stars:modern.adventure.stars.size});
        void save();
      }
      result(
        won,
        modern.elapsed,
        0,
        modern.adventure?.reason==='lives'?tr("Nyawa habis", "No lives left"):modern.adventure?.reason==='escape'?tr('Waktu pelarian habis','Escape time expired'):tr("Waktu habis", "Time is up"),
        () => playModern(difficulty,undefined,true),
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
  const cameraButton=document.createElement('button');cameraButton.id='camera-angle';cameraButton.className='icon-button';cameraButton.textContent='↕';cameraButton.setAttribute('aria-label',tr('Ganti ketinggian kamera','Change camera elevation'));el('pause-game').before(cameraButton);cameraButton.onclick=()=>{const pitch=modern.cycleCameraView();toast(pitch===0?tr('Kamera sejajar · geser kanan layar untuk mengatur bebas','Eye-level camera · drag the right side to adjust freely'):pitch===22?tr('Kamera sudut nyaman','Comfortable camera angle'):tr('Kamera pandangan tinggi','High camera angle'));};
  const unbind=bindJoystick(el('game-stage').parentElement!,modern,readPreferences());
  cleanup=unbind;
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
      modern.paused = !started||!!(modern.adventure&&modern.adventure.phase!=='playing');
      if(!room.adventure||!started)el("play-hint").textContent = started
        ? tr("Jelajahi labirin", "Explore the maze")
        : String(
            Math.max(1, Math.ceil((activeRoom.startsAt - serverNow()) / 1000)),
          );
      if (started&&!room.adventure)
        el("play-hint").textContent = tr(
          "Joystick / WASD · room privat online",
          "Joystick / WASD · private online room",
        );
      if (!started || modern.ended) return;
      sample++;
      if (buffer.length < 20) buffer.push({ ...modern.position });
      if (inFlight || sample % 10) return;
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
      unbind();
      if (modernTimer) clearInterval(modernTimer);
      modernTimer = null;
    };
    applyRoom(room);
  }
}
let wardrobeSlot:Slot='head';
function collection(){
 if(!profile)return;const p=profile,s=stats(p),quests=cosmeticQuests(p);
 begin('collection',`<main class="page collection-page"><div class="inventory-heading"><div><div class="eyebrow">${tr('JEJAK PETUALANGANKU','MY ADVENTURE TRAIL')}</div><h1>${esc(p.name)}</h1></div>${button('×','collection-close','round-tool')}</div><div class="collection-totals"><span>★ ${s.stars}</span><span>◉ ${s.coins}</span><span>${tr('Zona','Zones')} ${s.zones}/7</span><span>${tr('Peti','Chests')} ${s.chests}</span></div><div class="quest-grid">${quests.map(q=>`<article class="quest-card ${q.value>=q.target?'complete':''}"><span>${q.value>=q.target?'✓':'◇'}</span><h2>${q.name[lang==='id'?0:1]}</h2><progress max="${q.target}" value="${q.value}"></progress><p>${q.value}/${q.target} · ${q.value>=q.target?tr('PENCAPAIAN TERBUKA','ACHIEVEMENT UNLOCKED'):tr('DALAM PETUALANGAN','IN PROGRESS')}</p></article>`).join('')}</div><p>${tr('Koin dihitung dari catatan terbaik tiap peta. Bintang membuka koleksi kosmetik.','Coins come from your best record on each map. Stars unlock cosmetic pieces.')}</p>${button(tr('BUKA KOLEKSI KOSTUM','OPEN WARDROBE'),'collection-wardrobe')}</main>`);
 click('collection-close',()=>home());click('collection-wardrobe',()=>wardrobe());
}
function wardrobe(){
 if(!profile)return;const p=profile,a=appearanceOf(p,readPreferences().fur),s=stats(p),items=cosmetics.filter(c=>c.slot===wardrobeSlot),slotNames={head:['Kepala','Head'],face:['Wajah','Face'],body:['Badan','Body'],back:['Punggung','Back'],tail:['Ekor','Tail'],palette:['Warna','Palette']};
 begin('wardrobe',`<main class="page wardrobe-page"><section class="wardrobe-stage"><div class="wardrobe-title"><span>${tr('PETUALANGANKU, GAYAKU','MY ADVENTURE, MY STYLE')}</span><h1>${esc(p.name)}</h1></div><div id="outfit-preview"></div><div class="wardrobe-caption">★ ${s.stars} · ◉ ${s.coins}<small>${tr("Geser karakter untuk melihat semua sisi","Swipe the character to see every side")}</small></div></section><section class="outfit-options"><div class="inventory-heading"><h2>${tr('Koleksi Rimba','Forest Collection')}</h2>${button('×','wardrobe-close','round-tool')}</div><div class="cosmetic-tabs" role="tablist">${slots.map(slot=>`<button id="slot-${slot}" role="tab" aria-selected="${slot===wardrobeSlot}">${slotNames[slot][lang==='id'?0:1]}</button>`).join('')}</div><div class="outfit-grid cosmetic-grid">${items.map((c,i)=>{const locked=s.stars<c.stars||s.wins<(c.wins||0);return`<button id="piece-${i}" class="outfit outfit-card rarity-${c.rarity} ${a[wardrobeSlot]===c.id?'selected':''}" ${locked?'disabled':''}><span class="avatar-portrait"><img id="portrait-${i}" alt="${esc(c.name[lang==='id'?0:1])}"></span><small class="rarity-label">${c.rarity.toUpperCase()}</small><b>${c.name[lang==='id'?0:1]}</b><span class="outfit-state">${locked?`${c.stars} ★${c.wins?' + '+tr('1 kemenangan','1 win'):''}`:a[wardrobeSlot]===c.id?tr('DIPAKAI ✓','EQUIPPED ✓'):tr('PAKAI','EQUIP')}</span></button>`;}).join('')}</div></section></main>`);
 click('wardrobe-close',()=>home());for(const slot of slots)click('slot-'+slot,()=>{wardrobeSlot=slot;wardrobe();});
 void preview('outfit-preview',a.body,wardrobeSlot==='back'?'back':wardrobeSlot==='tail'?'tail':'front',wardrobeSlot);
 const token=generation;void import('./game/modern').then(({avatarPortraits})=>{if(token!==generation)return;const pictures=avatarPortraits(p.outfit,items.map(c=>({...a,[wardrobeSlot]:c.id})),wardrobeSlot==='back'?'back':wardrobeSlot==='tail'?'tail':'front',wardrobeSlot);pictures.forEach((url,i)=>{const img=el<HTMLImageElement>('portrait-'+i);if(img)img.src=url;});}).catch(showError);
 items.forEach((c,i)=>click('piece-'+i,()=>{if(s.stars<c.stars||s.wins<(c.wins||0))return;p.appearance={...a,[wardrobeSlot]:c.id};if(wardrobeSlot==='body')p.outfit=['classic','explorer','raincoat','space'].includes(c.id)?c.id:'space';p.updatedAt=Date.now();void save();wardrobe();}));
}
function scores(kind:'retro'|'adventure'='retro',level=1,map=0,difficulty:Difficulty='medium',scoreArea:AdventureArea='classic') {
 if(!profile)return home();
 const rows=kind==='retro'?family.profiles.filter(p=>p.retro[String(level)]).map(p=>({name:p.name,seconds:p.retro[String(level)].seconds,stars:p.retro[String(level)].stars})).sort((a,b)=>b.stars-a.stars||a.seconds-b.seconds):readRuns(uid).filter(r=>(r.area||'classic')===scoreArea&&r.map===map&&r.difficulty===difficulty).sort((a,b)=>b.stars-a.stars||a.seconds-b.seconds);
 begin('scores',`<main class="page scores-page"><div class="inventory-heading"><div><div class="eyebrow">${tr('CATATAN KELUARGA','FAMILY RECORDS')}</div><h1>${tr('Papan pencapaian','Best adventures')}</h1></div>${button('×','scores-close','round-tool')}</div><div class="score-filters"><button id="score-retro" class="${kind==='retro'?'selected':''}">RETRO JOURNEY</button><button id="score-adventure" class="${kind==='adventure'?'selected':''}">ADVENTURE</button>${kind==='retro'?`<select id="score-level" aria-label="Level">${Array.from({length:100},(_,i)=>`<option value="${i+1}" ${i+1===level?'selected':''}>LEVEL ${i+1}</option>`).join('')}</select>`:`<select id="score-area" aria-label="Area">${adventureAreas.map(a=>`<option value="${a}" ${a===scoreArea?'selected':''}>${areaName(a,lang)}</option>`).join('')}</select><select id="score-difficulty" aria-label="Difficulty">${['medium','hard','extreme'].map(d=>`<option ${d===difficulty?'selected':''}>${d}</option>`).join('')}</select><select id="score-map" aria-label="Map">${Array.from({length:10},(_,i)=>`<option value="${i}" ${i===map?'selected':''}>MAP ${i+1}</option>`).join('')}</select>`}</div><p class="small">${kind==='retro'?tr('Catatan terbaik profil dalam akun keluarga.','Best results for profiles in your family account.'):tr('Catatan kemenangan Adventure pada perangkat ini.','Adventure wins recorded on this device.')}</p><div class="score-list">${rows.length?rows.map((r,i)=>`<div class="score-row"><strong>${i+1}</strong><b>${esc(r.name)}</b><span>★ ${r.stars}</span><span>${r.seconds.toFixed(1)}s</span></div>`).join(''):`<div class="empty-record">☆<p>${tr('Belum ada kemenangan pada pilihan ini.','No completed runs for this selection yet.')}</p></div>`}</div></main>`);
 click('scores-close',()=>home());click('score-retro',()=>scores('retro',level,map,difficulty));click('score-adventure',()=>scores('adventure',level,map,difficulty));
 el('score-area')?.addEventListener('change',()=>scores(kind,level,map,difficulty,el<HTMLSelectElement>('score-area').value as AdventureArea));el('score-level')?.addEventListener('change',()=>scores(kind,Number(el<HTMLSelectElement>('score-level').value),map,difficulty));el('score-map')?.addEventListener('change',()=>scores(kind,level,Number(el<HTMLSelectElement>('score-map').value),difficulty,scoreArea));el('score-difficulty')?.addEventListener('change',()=>scores(kind,level,map,el<HTMLSelectElement>('score-difficulty').value as Difficulty,scoreArea));
}
async function createRoom(mode: "race" | "coop") {
  await save();
  const r = await roomAction("create", {
    profileId: profile!.id,
    mode,
    difficulty: currentDifficulty,area:selectedArea,
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
  sessionStorage.setItem('mh-active-room',room.id);
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
  if(room.state==='playing')void playModern(room.difficulty,room);else lobby();
}
function lobby() {
  if (!activeRoom) return setup();
  const room = activeRoom;
  begin(
    "lobby",
    `<main class="page narrow"><div class="eyebrow">${areaName(room.area||'classic',lang)} · ${room.mode.toUpperCase()} · ${room.difficulty.toUpperCase()}</div><h1>${tr("Berkumpul sebelum<br>berpetualang.", "Gather your<br>fellow explorers.")}</h1><div class="room-code">${room.id}</div><p>${tr("Bagikan kode ini kepada teman atau keluarga.", "Share this code with friends or family.")}</p><div id="room-players"></div>${button(tr("Panduan Adventure","Adventure guide"),"lobby-guide","secondary")}<div class="input-row">${button(tr("Siap / batal siap", "Ready / unready"), "ready")}${button(tr("Mulai pertandingan", "Start match"), "start-match", "secondary", room.host !== playerKey)}</div>${button(tr("Tinggalkan room", "Leave room"), "leave", "quiet")}<p class="small">${tr("Semua pemain harus siap. Pemain terputus dapat kembali selama pertandingan masih berjalan.", "All players must be ready. Disconnected players can return while the match is active.")}</p></main>`,
  );
  updateLobby();click("lobby-guide",adventureHelp);
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
    const state=r.adventure?.states?.[playerKey];if(state){m.syncAdventure(state);if(state.phase!=='playing')el('play-hint').textContent=state.phase==='won'?tr('Gerbang terlewati! Menunggu hasil pertandingan.','Escaped! Waiting for match results.'):tr('Petualangan berakhir. Menunggu hasil tim.','Run ended. Waiting for team results.');}
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
      const board=document.createElement('div');board.className='match-ranking';const finishers=Object.values(r.players).filter(p=>p.finishedAt).sort((a,b)=>a.finishedAt!-b.finishedAt!);board.innerHTML=`<h3>${tr('URUTAN FINISH','FINISH ORDER')}</h3>${finishers.length?finishers.map((p,i)=>`<p><b>${i+1}. ${esc(p.name)}</b> · ${((p.finishedAt!-r.startsAt)/1000).toFixed(2)}s</p>`).join(''):`<p>${tr('Belum ada pemain melewati gerbang.','No player reached the gate.')}</p>`}`;el('game-overlay').querySelector('.result')?.append(board);
    }
  }
}
function confirmLeave() {
  if (!activeRoom) return;
  el("game-overlay").innerHTML =
    `<div class="modal-backdrop"><section class="modal"><h2>${tr("Tinggalkan pertandingan?", "Leave this match?")}</h2><p>${tr("Kamu meninggalkan pertandingan ini.", "You will leave this match.")}</p>${button(tr("Tetap bermain", "Keep playing"), "stay")}${button(tr("Keluar", "Leave"), "leave-match", "secondary")}</section></div>`;
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
  sessionStorage.removeItem('mh-active-room');
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
