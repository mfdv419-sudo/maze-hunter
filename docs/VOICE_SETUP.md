# Voice setup and recovery

Deploy frontend and Netlify Functions together. Use the current Firebase project/database, HTTPS, and a signed-in profile in a room. Do not create a new database or expose service-account credentials.

- The primary transport uses mazeVoice realtime signaling with the existing database.rules.json additions. Publish those rules if you want that fast transport, merging any project-specific rules that are not part of this source.
- If realtime join/status/subscription/signaling returns PERMISSION_DENIED, the new frontend switches automatically to member-authenticated Function signaling. This fallback does not require publishing new client RTDB permissions. The latest Functions must be deployed; older ones do not support the voice-* endpoints.
- The fallback polls signaling/presence every 1.8 seconds. Audio is WebRTC, not Firebase/HTTP audio streaming. Extra requests can increase Function usage. This is not proof of working two-way audio.
- Enable voice, grant the browser mic permission, then turn Mic ON or use PTT. Voice starts muted. Speaker autoplay may require tapping the speaker button. Mic is muted when the tab is hidden; leaving/logout stops tracks, peer connections and polling.
- Firebase PERMISSION_DENIED is a signaling access failure. Browser NotAllowedError indicates mic/OS/browser policy; the UI distinguishes them. Granting browser mic access cannot grant Firebase database access.

## Relay settings
If no TURN service exists, leave VOICE_TURN_URLS and VOICE_TURN_SECRET blank. This does not cause a database permission error. Some cellular/NAT networks still need a relay for actual audio connectivity.
For a coturn REST-compatible service, set server-only VOICE_TURN_URLS (comma-separated turn:/turns: URLs) and VOICE_TURN_SECRET (shared REST secret), then redeploy Functions. Do not prefix the secret with VITE_. Temporary credentials expire after one hour. Audio is a mesh with up to 9 peers per player, targeted at up to 24 kbps per peer plus overhead.

## Real-device acceptance test
Two accounts/devices in the same new room, one Wi-Fi and one cellular: enable voice, unmute, confirm two-way audio while moving and collecting items. Test PTT, speaker, individual mute, volume, backgrounding, leave/rejoin, and relay behavior. Confirm the mic indicator stops after leaving. The source does not record audio. Synthetic/mock tests do not replace this test.

QA limitations: previous browser RTC testing produced stable SDP but zero ICE candidates/audio. This release's Function signaling, access validation and fallback lifecycle were tested locally; no production Firebase rules or real TURN/mic were accessed.
References: https://firebase.google.com/docs/database/web/offline-capabilities and https://webrtc.org/getting-started/turn-server
