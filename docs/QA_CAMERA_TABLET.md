# Camera and tablet controls QA

Baseline: realtime-server-rocks release (40-file delta / 211-file full source).

Validated in this revision:

- `npm test`: 35 suites, 211 tests pass. Four new checks cover swept camera volume, edge clipping, changed wall instances, hidden/batched wall terrain collision, floor contact, and fullscreen standard/WebKit/rejection/unsupported paths.
- `npm run build`: TypeScript and Vite pass. Existing large-chunk advisory remains.
- `npm run build:realtime`: pass; backend source unchanged.
- `npm run check:public-env`: pass, six permitted public fields.
- Playwright Chromium touch emulation: 3/3 pass at 1024x768, 844x390, 640x320. Closed and expanded weapon picker stay inside the viewport and do not intersect joystick, Hit or Jump. Available cake selection closes the menu and equips Hit. Empty watermelon stock remains disabled. Rejected fullscreen displays feedback without an uncaught page error. Tablet camera orbit retains the selected pitch and a positive camera distance.
- Screenshots inspected internally for the expanded bottom weapon dock.
- Delta application: every baseline source file plus the delta reconstructs the intended source exactly; no deletions required.

Not validated: physical iPad/Android tablet browser, native fullscreen on those devices, or production two-device multiplayer. Native fullscreen availability depends on the browser and embedding permissions. This frontend-only revision does not deploy or alter the realtime host.
