import { defineConfig, type Plugin } from "vite";
function offlineRetro(): Plugin {
  return {
    name: "maze-offline-retro",
    generateBundle(_options, bundle) {
      const assets = [
        "/",
        "/index.html",
        "/manifest.webmanifest",
        "/icon.svg",
        ...Object.keys(bundle).map((n) => "/" + n),
      ];
      const version = Object.keys(bundle).join("|");
      let hash = 0;
      for (const c of version)
        hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
      const cache = `maze-hunter-${hash >>> 0}`;
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: `const CACHE=${JSON.stringify(cache)};const FILES=${JSON.stringify(assets)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('maze-hunter-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/.netlify/'))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));return;}if(FILES.includes(url.pathname))e.respondWith(caches.open(CACHE).then(cache=>cache.match(url.pathname,{ignoreVary:true})).then(c=>c||fetch(e.request)));});`,
      });
    },
  };
}
export default defineConfig({
  base: "/",
  plugins: [offlineRetro()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/phaser/")) return "phaser";
          if (id.includes("/node_modules/three/")) return "three";
          if (
            id.includes("/node_modules/@firebase/") ||
            id.includes("/node_modules/firebase/")
          )
            return "firebase";
        },
      },
    },
  },
  server: { port: 5173 },
});
