// Show safe diagnostic codes, never provider responses, tokens, or credentials.
export function authErrorInfo(error: unknown, language: "id" | "en") {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = String(error.code);
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
