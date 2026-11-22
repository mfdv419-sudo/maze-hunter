interface AdConfig {
  type: "next";
  name: string;
  beforeAd: () => void;
  afterAd: () => void;
  adBreakDone: () => void;
}
declare global {
  interface Window {
    adsbygoogle?: unknown[];
    adBreak?: (config: AdConfig) => void;
  }
}
let count = 0,
  last = 0,
  loaded = false;
export function loadAds() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  if (!client || loaded || !navigator.onLine) return;
  loaded = true;
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak =
    window.adBreak || ((config) => window.adsbygoogle!.push(config));
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.crossOrigin = "anonymous";
  script.dataset.adFrequencyHint = "120s";
  document.head.append(script);
}
export async function betweenLevels(level: number, adFree: boolean) {
  count++;
  if (
    adFree ||
    level < 4 ||
    count % 3 ||
    Date.now() - last < 120000 ||
    !loaded ||
    !navigator.onLine ||
    !window.adBreak
  )
    return;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 12000);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    window.adBreak!({
      type: "next",
      name: "retro-level-break",
      beforeAd: () => {
        last = Date.now();
      },
      afterAd: done,
      adBreakDone: done,
    });
  });
}
