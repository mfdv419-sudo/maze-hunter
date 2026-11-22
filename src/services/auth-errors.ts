// Read only a small error allowlist. Never serialize provider responses or credentials.
function field(value: unknown, key: string): unknown {
  try { return value && (typeof value === "object" || typeof value === "function") ? (value as Record<string, unknown>)[key] : undefined; }
  catch { return undefined; }
}
function chain(error: unknown) {
  const values: unknown[] = [];
  const pending = [error];
  while (pending.length && values.length < 6) {
    const current = pending.shift();
    if (current == null || values.includes(current)) continue;
    values.push(current);
    pending.push(field(current, "cause"));
    const nested = field(current, "error");
    if (nested && typeof nested === "object") pending.push(nested);
  }
  return values;
}
function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  const parts = ["message", "error_description", "details", "reason", "error"]
    .map(key => field(error, key)).filter((v): v is string => typeof v === "string" && !!v);
  return [...new Set(parts)].join("; ");
}
/** Diagnostics are shown locally only. Remove secrets before truncating for display. */
export function safeLoginText(value: string, limit = 420): string {
  return value.slice(0, 16000)
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?(?:-----END [^-]*PRIVATE KEY-----|$)/gi, "[private key removed]")
    .replace(/(["']?(?:access[_-]?token|id[_-]?token|refresh[_-]?token|authorization|api[_-]?key|password|credential|client[_-]?secret|private[_-]?key|secret|oauth[_-]?token|code)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)/gi, "$1[removed]")
    .replace(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, "[authorization removed]")
    .replace(/https?:\/\/[^\s"'<>]+/gi, "[URL removed]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email removed]")
    .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g, "[API key removed]")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[token removed]")
    .replace(/\b[A-Za-z0-9_-]{40,}\b/g, "[long value removed]")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .slice(0, limit);
}
function firebaseCode(error: unknown) {
  for (const value of chain(error)) {
    const code = field(value, "code");
    if (typeof code === "string" && (/^auth\/[a-z0-9-]+$/.test(code) || code === "permission-denied")) return code;
    const fromMessage = errorMessage(value).match(/\b(auth\/[a-z0-9-]+)\b/);
    if (fromMessage) return fromMessage[1];
  }
  return null;
}
export function authErrorInfo(error: unknown, language: "id" | "en") {
  const code = firebaseCode(error);
  if (!code) return null;
  const messages: Record<string, [string, string]> = {
    "auth/popup-blocked": ["Browser memblokir jendela masuk Google. Izinkan pop-up untuk situs game ini, lalu coba lagi.", "Your browser blocked Google sign-in. Allow pop-ups for this game and retry."],
    "auth/popup-closed-by-user": ["Jendela Google tertutup sebelum proses masuk selesai. Jika tertutup sendiri, kirim screenshot pesan ini untuk pemeriksaan.", "The Google window closed before sign-in finished. If it closed itself, send a screenshot of this message for diagnosis."],
    "auth/cancelled-popup-request": ["Ada proses masuk Google lain yang sedang berjalan. Selesaikan satu jendela masuk, lalu coba lagi.", "Another Google sign-in is in progress. Finish one sign-in window and retry."],
    "auth/unauthorized-domain": ["Domain game belum diizinkan oleh proyek Firebase yang digunakan aplikasi ini. Periksa Authorized domains dan konfigurasi Netlify.", "This domain is not authorized by the Firebase project used by this app. Check Authorized domains and the Netlify configuration."],
    "auth/operation-not-allowed": ["Login Google belum diizinkan oleh proyek Firebase yang digunakan aplikasi ini. Periksa provider Google dan konfigurasi Netlify.", "Google sign-in is not enabled in the Firebase project used by this app. Check the Google provider and Netlify configuration."],
    "auth/network-request-failed": ["Tidak dapat menghubungi layanan login. Periksa koneksi internet lalu coba lagi.", "Cannot reach the sign-in service. Check your internet connection and retry."],
    "auth/invalid-api-key": ["Konfigurasi API key Firebase aplikasi tidak valid. Periksa konfigurasi build di Netlify.", "The app's Firebase API key is invalid. Check the Netlify build configuration."],
    "auth/app-not-authorized": ["Aplikasi belum diizinkan menggunakan konfigurasi Firebase ini. Periksa pembatasan API key dan konfigurasi proyek.", "This app is not authorized to use this Firebase configuration. Check API key restrictions and project configuration."],
    "auth/web-storage-unsupported": ["Penyimpanan browser tidak tersedia untuk login. Coba tab Chrome biasa dengan penyimpanan situs diizinkan.", "Browser storage is unavailable for sign-in. Try a regular Chrome tab with site storage allowed."],
    "auth/too-many-requests": ["Terlalu banyak percobaan masuk. Tunggu sebentar sebelum mencoba lagi.", "Too many sign-in attempts. Wait a little before retrying."],
    "permission-denied": ["Akun sudah masuk, tetapi akses data profil ditolak. Periksa rules Firestore pada proyek yang digunakan aplikasi.", "Your account is signed in, but profile data access was denied. Check Firestore rules in the app's project."],
  };
  if (!/^auth\/[a-z0-9-]+$/.test(code) && code !== "permission-denied") return null;
  const text = messages[code] || ["Login belum selesai. Kirim screenshot kode ini agar penyebabnya dapat diperiksa.", "Sign-in did not finish. Send a screenshot of this code for diagnosis."];
  return { code, message: text[language === "id" ? 0 : 1] };
}

/** Preserve browser/JavaScript exceptions that do not have a Firebase error code. */
export function loginErrorDetails(error: unknown, language: "id" | "en") {
  const known = authErrorInfo(error, language);
  const values = chain(error);
  const name = field(error, "name");
  const rawName = typeof name === "string" && name ? name : typeof error === "string" ? "String rejection" : error === null ? "Null rejection" : "Uncoded rejection";
  const messages = values.map(errorMessage).filter(Boolean);
  const detail = messages.length ? safeLoginText([...new Set(messages)].join("\nCause: ")) : language === "id" ? `Tidak ada pesan pada error (${typeof error}).` : `The error has no message (${typeof error}).`;
  const stack = field(error, "stack");
  const frames = typeof stack === "string" ? stack.split("\n").slice(1, 3).map(line => safeLoginText(line.replace(/https?:\/\/[^\s)]+/g, url => {
    const filename = url.split("/").pop()!.split(/[?#]/)[0];
    return /^[\w.-]+\.js(?::\d+){0,2}$/.test(filename) ? filename : "[source removed]";
  }), 160)).join("\n") : "";
  const label = safeLoginText(rawName, 80);
  return {
    code: known?.code ?? null,
    name: label,
    message: known?.message ?? (language === "id"
      ? "Login berhenti karena error browser atau aplikasi. Detail yang tersedia ditampilkan di bawah; foto panel ini untuk pemeriksaan."
      : "Sign-in stopped with a browser or app error. Available details are shown below; take a screenshot for diagnosis."),
    detail,
    frames,
  };
}
