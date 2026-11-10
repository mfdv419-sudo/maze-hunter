# Realtime migration status

The Node/WebSocket implementation is now in realtime/, with frontend integration in src/services/realtime-client.ts. Local integration tests are available. It is opt-in and has not been deployed. Follow REALTIME_SETUP.md. Horizontal multi-instance routing, production host capacity validation, physical-device/WSS validation and server-side historical lag compensation are not implemented/verified. Preserve the existing Firebase project and data.
