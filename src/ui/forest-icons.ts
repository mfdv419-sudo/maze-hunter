const line = (body:string) => `<g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

/** Original vector artwork. Decorative SVGs inherit accessible button labels. */
export function forestIcon(name:string){
 const drawings:Record<string,string>={wave:'<path d="M15 25V13q0-4 4-4t4 4v10-15q0-4 4-4t4 4v16-12q0-4 4-4t4 4v17q0 12-13 14-9 0-13-8l-5-8q-2-5 3-5z" fill="#f1d296"/><path d="m5 8-2-4m7 2V2M3 15H0" stroke="#8ddde0" stroke-width="2"/>',
 cake:'<path fill="#f6cbb9" d="M8 17h32v22H8z"/><path fill="#fff1cd" d="M8 23h32v5H8z"/><path fill="#e68aa2" d="M8 30h32v4H8z"/><path fill="#fff1cd" d="M7 17q3-8 11-5 6-7 14 0 8-1 9 5z"/><circle fill="#e95249" cx="27" cy="10" r="5"/><path d="m27 6 4-4" stroke="#71b257"/>',
 chili:'<path fill="#e95546" d="M34 11C40 31 23 43 7 39c14-3 15-19 21-24z"/><path d="M29 16q-3-8 7-12" stroke="#78b44a" stroke-width="5"/><path d="m27 20-5 11" stroke="#ffaaa0" stroke-width="3"/>',
 spinach:'<path fill="#8fbd42" d="M24 40C3 29 4 7 16 7c9 1 9 16 8 33Z"/><path fill="#b8d35b" d="M24 40c-6-23 5-38 17-32 6 8-2 25-17 32Z"/><path d="m13 15 11 25L36 15" stroke="#e4ec9c" stroke-width="2"/>',
 watermelon:'<path fill="#62aa58" d="M4 17h40a20 22 0 0 1-40 0"/><path fill="#f6efbd" d="M7 17h34a17 18 0 0 1-34 0"/><path fill="#ed7c7a" d="M10 17h28a14 14 0 0 1-28 0"/><g fill="#403e35"><ellipse cx="17" cy="23" rx="1.2" ry="2"/><ellipse cx="25" cy="28" rx="1.2" ry="2"/><ellipse cx="32" cy="23" rx="1.2" ry="2"/></g>',
 merge:line('<path d="M8 13h7c8 0 8 11 16 11h9M8 35h7c8 0 8-11 16-11m2-7 7 7-7 7"/>'),
 ability:'<path fill="currentColor" d="M27 4 10 27h12l-1 17 17-24H26l1-16Z"/>',
 jump:line('<circle cx="30" cy="9" r="4" fill="currentColor" stroke="none"/><path d="m9 19 11 4 6-6 7 4 7-5M24 21l-5 10-9 7m9-7 9 1 7 8M7 44h34"/>'),
 dive:'<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 7v26m-9-8 9 9 9-9M6 40q5-5 9 0t9 0 9 0 9 0"/></g>',
 lift:'<path fill="currentColor" d="M24 5 13 17h7v11h8V17h7z"/><path fill="#a5b4a3" d="m11 31 8-4 16 4 5 11H8z"/>',
 rune:'<g fill="none" stroke="currentColor" stroke-width="3"><path d="m24 6 15 18-15 18L9 24zM24 14v20m-7-14 7 6 7-6"/></g>',
 grenade:'<circle fill="#d76838" cx="24" cy="29" r="13"/><path d="M24 16V9l7-4" fill="none" stroke="#eed696" stroke-width="4"/><path fill="#ffcb66" d="m33 2 3 6-7-1z"/>',
 throw:line('<path d="M21 23h18v13H21zM20 23c2-3 5-6 10-6 4 0 7 3 10 6m-19 7h18M31 17l4-5M8 22h7m-9 8h9m-6 7h6"/>'),
 shop:line('<path d="M9 19h30l3 21H6l3-21Zm8 1v-5a7 7 0 0 1 14 0v5"/>'),
 talk:line('<path d="M9 12h30a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H25l-10 7v-7H9a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3Z"/><path d="M15 23h18"/>'),
 interact:line('<path d="M17 28V12a3 3 0 0 1 6 0v10l4-2 10 4v8l-6 8H18l-9-13a3 3 0 0 1 4-4l4 5Z"/><path d="M10 9 8 7m19 2 2-3"/>'),
 surface:line('<path d="M24 32V8m-8 9 8-9 8 9M6 39q5-5 9 0t9 0 9 0 9 0"/>'),
 play:'<path fill="currentColor" d="M15 8a2 2 0 0 0-3 2v28a2 2 0 0 0 3 2l24-14a2.3 2.3 0 0 0 0-4Z"/>',
 users:line('<circle cx="18" cy="16" r="6"/><path d="M6 38v-3a10 10 0 0 1 10-10h4a10 10 0 0 1 10 10v3M31 10a6 6 0 0 1 0 12m3 4a9 9 0 0 1 8 9v3"/>'),
 gamepad:line('<path d="M16 13h16c6 0 8 6 10 15l1 5c0 5-5 6-8 3l-5-5H18l-5 5c-3 3-8 2-8-3l1-5c2-9 4-15 10-15Z"/><path d="M11 23h10m-5-5v10m14-3h.1m6-5h.1"/>'),
 compass:line('<circle cx="24" cy="24" r="17"/><path d="m31 16-4 11-11 4 4-11 11-4Z"/>'),
 help:line('<circle cx="24" cy="24" r="17"/><path d="M19 18a5 5 0 1 1 8 4c-2 2-3 2-3 5m0 6h.1"/>'),
 check:line('<path d="m12 24 8 8 16-16"/>'),
 back:line('<path d="M37 24H11m11-11L11 24l11 11"/>'),
 close:line('<path d="m13 13 22 22m0-22L13 35"/>'),
 lock:line('<rect x="12" y="22" width="24" height="17" rx="3"/><path d="M17 22v-6a7 7 0 0 1 14 0v6m-7 7v4"/>'),
 maze:line('<rect x="7" y="7" width="34" height="34" rx="4"/><path d="M17 7v22h14v-9h-8m8-3h10m-24 12v12"/>'),
 volume:line('<path d="M8 19h7l10-9v28l-10-9H8V19Zm22 0a8 8 0 0 1 0 10m4-15a14 14 0 0 1 0 20"/>'),
 muted:line('<path d="M8 19h7l10-9v28l-10-9H8V19Zm22 0 10 10m0-10L30 29"/>'),
 settings:line('<path d="m19 7-1 5-4 2-5-1-4 7 4 4v4l-3 4 4 7 5-1 4 2 1 4h8l2-5 3-2 5 1 4-7-4-4v-4l4-3-4-7-5 1-4-2-1-5h-9Z"/><circle cx="24" cy="25" r="6"/>'),
 bag:line('<path d="M17 13v-2a7 7 0 0 1 14 0v2m-11 11h8m-13 1h18v10H15z"/><rect x="9" y="13" width="30" height="28" rx="6"/>'),

 };
 return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${Object.hasOwn(drawings,name)?drawings[name]:drawings.cake}</svg>`;
}
