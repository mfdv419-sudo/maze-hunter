/** Original vector artwork. Decorative SVGs inherit accessible button labels. */
export function forestIcon(name:string){
 const drawings:Record<string,string>={wave:'<path d="M15 25V13q0-4 4-4t4 4v10-15q0-4 4-4t4 4v16-12q0-4 4-4t4 4v17q0 12-13 14-9 0-13-8l-5-8q-2-5 3-5z" fill="#f1d296"/><path d="m5 8-2-4m7 2V2M3 15H0" stroke="#8ddde0" stroke-width="2"/>',
 cake:'<path fill="#f6cbb9" d="M8 17h32v22H8z"/><path fill="#fff1cd" d="M8 23h32v5H8z"/><path fill="#e68aa2" d="M8 30h32v4H8z"/><path fill="#fff1cd" d="M7 17q3-8 11-5 6-7 14 0 8-1 9 5z"/><circle fill="#e95249" cx="27" cy="10" r="5"/><path d="m27 6 4-4" stroke="#71b257"/>',
 chili:'<path fill="#e95546" d="M34 11C40 31 23 43 7 39c14-3 15-19 21-24z"/><path d="M29 16q-3-8 7-12" stroke="#78b44a" stroke-width="5"/><path d="m27 20-5 11" stroke="#ffaaa0" stroke-width="3"/>',
 spinach:'<path fill="#8fbd42" d="M24 40C3 29 4 7 16 7c9 1 9 16 8 33Z"/><path fill="#b8d35b" d="M24 40c-6-23 5-38 17-32 6 8-2 25-17 32Z"/><path d="m13 15 11 25L36 15" stroke="#e4ec9c" stroke-width="2"/>',
 watermelon:'<path fill="#62aa58" d="M4 17h40a20 22 0 0 1-40 0"/><path fill="#f6efbd" d="M7 17h34a17 18 0 0 1-34 0"/><path fill="#ed7c7a" d="M10 17h28a14 14 0 0 1-28 0"/><g fill="#403e35"><ellipse cx="17" cy="23" rx="1.2" ry="2"/><ellipse cx="25" cy="28" rx="1.2" ry="2"/><ellipse cx="32" cy="23" rx="1.2" ry="2"/></g>',
 merge:'<g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M9 15c4-12 22-12 29 0M39 31C32 44 15 44 9 33"/><path d="m32 14 7 3 2-8M16 33l-8-3-2 8"/><path d="m18 24 6-6 6 6-6 6z"/></g>',
 ability:'<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M36 15C24-1 4 13 12 28c7 14 29 6 25-5-3-9-17-10-19-1-2 8 10 9 11 2"/><path d="m36 6 2 10-9 1"/></g>',
 jump:'<g fill="currentColor"><circle cx="27" cy="10" r="4"/><path d="m23 16 8 2 8-7 3 3-10 10-5-1-2 8 10 6-3 4-13-8-1-6-7 8-4-3 12-15-7 2-5-5 3-3 4 4z"/></g><path d="m6 43 6-4m7 5 6-3" stroke="currentColor" stroke-width="2"/>',
 dive:'<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M24 7v26m-9-8 9 9 9-9M6 40q5-5 9 0t9 0 9 0 9 0"/></g>',
 lift:'<path fill="currentColor" d="M24 5 13 17h7v11h8V17h7z"/><path fill="#a5b4a3" d="m11 31 8-4 16 4 5 11H8z"/>',
 rune:'<g fill="none" stroke="currentColor" stroke-width="3"><path d="m24 6 15 18-15 18L9 24zM24 14v20m-7-14 7 6 7-6"/></g>',
 grenade:'<circle fill="#d76838" cx="24" cy="29" r="13"/><path d="M24 16V9l7-4" fill="none" stroke="#eed696" stroke-width="4"/><path fill="#ffcb66" d="m33 2 3 6-7-1z"/>',
 throw:'<path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" d="M8 36Q12 9 38 11m-8-6 9 6-7 8"/><path fill="#acb8a0" d="m8 32 10-3 6 10-13 4z"/>',
 };
 return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${drawings[name]||drawings.cake}</svg>`;
}
