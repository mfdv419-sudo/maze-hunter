let ctx: AudioContext | null = null;
let muted = localStorage.getItem("mh-muted") === "1";
export function isMuted() {
  return muted;
}
export function setMuted(v: boolean) {
  muted = v;
  localStorage.setItem("mh-muted", v ? "1" : "0");
}
export function tone(
  freq = 440,
  duration = 0.07,
  wave: OscillatorType = "square",
  volume = 0.025,
) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    /* audio is an optional enhancement */
  }
}
