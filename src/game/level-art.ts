const cache=new Map<number,string>();
/** Ten regional environments and ten original landmark silhouettes: one illustrated destination per level. */
export function levelArt(level:number):string{
 const id=Math.max(1,Math.min(100,Math.floor(level)));if(cache.has(id))return cache.get(id)!;const region=Math.floor((id-1)/10),kind=(id-1)%10;
 const themes=[['#9fc8bb','#e9e4b5','#6b9868'],['#aed2ce','#f1e8bd','#86a773'],['#89b8c4','#cae3cf','#548c7c'],['#91bbb0','#d9e0b3','#4b8463'],['#8ab9d0','#edf0dc','#849a8c'],['#9ab7a1','#dcddad','#6b8b69'],['#668aab','#b5c7cd','#556c87'],['#e5b09c','#f4d9ad','#a6b48b'],['#2b466a','#698b98','#416f70'],['#9cbec4','#f2e4b1','#a2ad7e']];
 const [sky,haze,ground]=themes[region],gold='#e8c68a',rock=region===6?'#9ab8c4':'#a4a287',wood='#947653',leaf=region===8?'#658f82':'#4b7e59';
 const bush=(x:number,y:number,s=1)=>`<g fill="${leaf}" transform="translate(${x} ${y}) scale(${s})"><ellipse rx="30" ry="20"/><ellipse cx="-17" cy="5" rx="24" ry="16"/><ellipse cx="20" cy="5" rx="24" ry="16"/></g>`;
 let environment=`<path d="M0 160Q160 100 360 150v90H0Z" fill="${ground}"/>`;
 if(region===0||region===1||region===8)environment+=`<path d="M35 168V60m290 102V45" stroke="${wood}" stroke-width="12"/>${bush(30,55,1.4)}${bush(325,50,1.6)}`;
 if(region===2)environment+=`<path d="M50 240q175-88 120-113l43-6q92 46-40 119Z" fill="#83c4c4"/>${bush(30,150,.8)}${bush(330,130,1)}`;
 if(region===3)environment+=`<path d="M25 165V38m19 120V25m285 133V35m-18 128V54" stroke="#52816b" stroke-width="9"/><path d="M21 85h9m10-22h9m-28 70h9m10-22h9m281-30h9m-27 40h9" stroke="#c5d29b" stroke-width="3"/>`;
 if(region===4)environment=`<path d="m0 170 75-98 62 70 90-112 133 132v78H0Z" fill="#a7b8b5"/><path d="m173 97 54-67 60 62-43-21-15 25-17-20-16 26Z" fill="#eff0dc"/><g fill="#edf1e4"><ellipse cx="50" cy="206" rx="90" ry="21"/><ellipse cx="330" cy="195" rx="95" ry="25"/></g>`;
 if(region===5)environment+=`<path d="M19 167V85h30v82Zm292-10V66h27v91Z" fill="#85977b"/>${bush(42,160,.8)}${bush(323,152,.8)}`;
 if(region===6)environment=`<path d="M0 0h360v240H0V0Zm48 240V105q0-65 70-65h119q69 0 69 65v135Z" fill="#4d637b" fill-rule="evenodd"/><path d="M0 200 75 179 140 200 240 180 360 202v38H0Z" fill="#71969b"/><path d="m30 187 15-64 16 64Zm279 17 21-84 16 84Z" fill="#abc9cf"/>`;
 if(region===7)environment=`<circle cx="285" cy="57" r="29" fill="#ffe3a7"/><path d="M0 142q160-18 360 0v98H0Z" fill="#78afb5"/><path d="M0 191q120-75 360-6v55H0Z" fill="#e6cda3"/><path d="m24 181 7-76" stroke="${wood}" stroke-width="8"/><path d="m31 106-28-16 26 3 19-26-8 29 31 1-29 11 14 17Z" fill="${leaf}"/>`;
 if(region===9)environment=`<path d="M0 180 70 112 130 165 246 85 360 159v81H0Z" fill="#b0bea3"/><path d="M0 210q160-45 360-21v51H0Z" fill="${ground}"/><path d="m72 240 93-76h30l93 76Z" fill="#e1d1a1"/>`;
 if(region===8)environment+=`<g fill="#efddb0">${Array.from({length:12},(_,i)=>`<circle cx="${19+i*29%330}" cy="${15+i*17%95}" r="${i%3===0?2.6:1.5}"/>`).join('')}</g>`;
 const icons=[
 `<path d="M-20 0V-71H8V0Z" fill="${wood}"/><path d="m-38-56 17-54 54 18-21 61Z" fill="${leaf}"/><path d="m-9-87 20 5m-23 5 17 5" stroke="#aac593" stroke-width="5"/><path d="M-42 0h83v12h-83Z" fill="${rock}"/>`,
 `<path d="M-64 0v-45q0-53 64-53t64 53V0H40v-45q0-29-40-29t-40 29V0Z" fill="${rock}"/><path d="M-70 0h140v12H-70Z" fill="${gold}"/><path d="m-55-54 21 5m25-35v22m42 2 17-12" stroke="#d7cea6" stroke-width="7"/>`,
 `<path d="M-88-12q85-38 176 0" stroke="${wood}" stroke-width="18" fill="none"/><path d="M-88-46q85-38 176 0m-176-12v50m35-58v43m34-51v43m35-43v43m35-35v43m37-35v50" stroke="${gold}" stroke-width="5" fill="none"/>`,
 `<path d="M-57 0V-69H57V0Z" fill="${wood}"/><path d="m-72-65 72-56 72 56Z" fill="${leaf}"/><path d="M-14 0v-49h28V0Z" fill="#36575b"/><path d="M-45-52h20v23h-20Zm70 0h20v23H25Z" fill="${gold}"/>`,
 `<path d="m-49 0 11-62 35-18 35 24 20 56Z" fill="${rock}"/><path d="m-24-41 30-76 27 76Z" fill="#83d1c4"/><path d="m6-117 27 76H8Z" fill="#c1e8d1"/><path d="m-50 4 102-1" stroke="${gold}" stroke-width="9"/>`,
 `<path d="M-46 0v-51h92V0Z" fill="#9b704c"/><path d="M-46-50v-18q0-36 46-36t46 36v18Z" fill="#bb925e"/><path d="M-27-94v94m54-94v94" stroke="${gold}" stroke-width="10"/><path d="M-9-59H9v23H-9Z" fill="${gold}"/><path d="m-65-119 8 13 16 3-15 7-3 15-8-13-15-3 13-8Z" fill="#f5e5b4"/>`,
 `<path d="M-36 0v-102h72V0Z" fill="${rock}"/><path d="M-47-100h94v-17h-94ZM-48 0h96v15h-96Z" fill="${gold}"/><path d="m-21-117 21-36 21 36Z" fill="${leaf}"/><path d="M-15-84h30v27h-30Z" fill="#37585b"/><path d="M-15-32h30v32h-30Z" fill="#455b58"/>`,
 `<path d="M-67 0v-22h134V0Z" fill="${rock}"/><path d="M-52-22v-85h24v85Zm80 0v-85h24v85Z" fill="${rock}"/><path d="M-66-108H66v-17H-66Z" fill="${gold}"/><path d="m-78-123 78-38 78 38Z" fill="${rock}"/><path d="M-18-22v-47h36v47" fill="#36565a"/>`,
 `<path d="M-72 0q15-50 61-50l63 7 22 43Z" fill="${rock}"/><path d="m-25-43 19-27 37 7 16 24Z" fill="${gold}"/><path d="m-18-53 10-16 23 8-9 15Z" fill="#b8dcd1"/><path d="m-60 0 127-1" stroke="#5b6e67" stroke-width="8"/><path d="m-70-86 18 5m98-7 23-11" stroke="${gold}" stroke-width="6"/>`,
 `<path d="M-60 0v-82q0-64 60-64t60 64V0H31v-82q0-34-31-34t-31 34V0Z" fill="${gold}"/><path d="M-78 0H78v18H-78Z" fill="${rock}"/><path d="m0-165 18 19-18 19-18-19Z" fill="#fff0bb"/><path d="M-15 0v-83q0-16 15-16t15 16V0Z" fill="#b5dfce" opacity=".65"/>`
 ];
 const x=180+(kind%3-1)*8,svg=`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240"><defs><linearGradient id="s" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${haze}"/></linearGradient></defs><path fill="url(#s)" d="M0 0h360v240H0z"/>${environment}<ellipse cx="${x}" cy="192" rx="85" ry="16" fill="#294f50" opacity=".16"/><g transform="translate(${x} 182)">${icons[kind]}</g></svg>`;
 const result='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);cache.set(id,result);return result;
}
