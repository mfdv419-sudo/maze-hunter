type LegacyDocument=Document&{webkitFullscreenElement?:Element;webkitExitFullscreen?:()=>void};
type LegacyElement=HTMLElement&{webkitRequestFullscreen?:()=>void};
/** Called directly from the click gesture; no awaits before requesting fullscreen. */
export async function toggleFullscreen(doc:Document=document):Promise<'entered'|'exited'|'unavailable'>{
 const d=doc as LegacyDocument,root=doc.documentElement as LegacyElement;
 try{
  if(d.fullscreenElement||d.webkitFullscreenElement){if(d.exitFullscreen)await d.exitFullscreen();else if(d.webkitExitFullscreen)d.webkitExitFullscreen();else return 'unavailable';return 'exited';}
  if(root.requestFullscreen){await root.requestFullscreen();return 'entered';}
  if(root.webkitRequestFullscreen){root.webkitRequestFullscreen();return 'entered';}
 }catch{return 'unavailable';}
 return 'unavailable';
}
