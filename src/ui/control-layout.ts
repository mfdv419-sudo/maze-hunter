/** Reserve the actual joystick and action-pad rectangles, including user joystick settings. */
export function mountControlLayout(screen:HTMLElement){
 const belt=screen.querySelector<HTMLElement>('.supply-belt'),stick=screen.querySelector<HTMLElement>('.joystick'),actions=screen.querySelector<HTMLElement>('.action-controls');
 if(!belt||!stick||!actions)return()=>{};
 const layout=()=>{const r=screen.getBoundingClientRect(),l=stick.getBoundingClientRect(),a=actions.getBoundingClientRect();const left=Math.max(12,l.right-r.left+12),right=Math.min(r.width-12,a.left-r.left-12),width=Math.max(44,Math.min(260,right-left));belt.style.left=`${left+Math.max(0,(right-left-width)/2)}px`;belt.style.width=`${width}px`;};
 const observer=new ResizeObserver(layout);[screen,stick,actions].forEach(e=>observer.observe(e));layout();return()=>observer.disconnect();
}
