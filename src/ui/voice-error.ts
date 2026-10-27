export function voiceError(error:unknown,lang:string){const e=error as {name?:string;message?:string},tr=(id:string,en:string)=>lang==='id'?id:en,message=e?.message||String(error);
 if(e?.name==='NotAllowedError')return tr('Mikrofon diblokir browser atau perangkat. Periksa izin mikrofon dan buka game langsung melalui HTTPS.','Microphone blocked by browser or device. Check microphone access and open the game directly over HTTPS.');
 if(e?.name==='NotFoundError')return tr('Mikrofon tidak ditemukan pada perangkat.','No microphone found on this device.');
 if(/permission.denied/i.test(message))return tr('Akses layanan suara ditolak. Izin mikrofon berbeda dari izin room; keluar lalu masuk room kembali.','Voice service access denied. Microphone permission is separate from room access; leave and rejoin the room.');
 if(/Unknown action|Invalid action/.test(message))return tr('Layanan suara belum diperbarui. Deploy Netlify Functions bersama frontend terbaru.','Voice service needs updating. Deploy Netlify Functions with the latest frontend.');return message;
}
