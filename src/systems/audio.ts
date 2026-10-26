let ctx:AudioContext|null=null,music:GainNode|null=null,effects:GainNode|null=null,timer:ReturnType<typeof setInterval>|null=null;
let muted=localStorage.getItem('mh-muted')==='1',musicVolume=Number(localStorage.getItem('mh-music-volume')??.22),effectsVolume=Number(localStorage.getItem('mh-effects-volume')??.55);
let scene='home',beat=0,next=0;
export const isMuted=()=>muted;
export function audioVolumes(){return{music:musicVolume,effects:effectsVolume};}
function levels(){if(!ctx)return;music?.gain.setTargetAtTime(muted?0:musicVolume*.1,ctx.currentTime,.08);effects?.gain.setTargetAtTime(muted?0:effectsVolume,ctx.currentTime,.03);}
export function setAudioVolumes(m:number,e:number){musicVolume=Math.max(0,Math.min(1,m));effectsVolume=Math.max(0,Math.min(1,e));localStorage.setItem('mh-music-volume',String(musicVolume));localStorage.setItem('mh-effects-volume',String(effectsVolume));levels();}
export function setMuted(v:boolean){muted=v;localStorage.setItem('mh-muted',v?'1':'0');levels();if(!v)unlockAudio();}
export function setAudioScene(value:string){scene=value;}
function note(freq:number,at:number,duration:number,volume:number,wave:OscillatorType,dest:GainNode){
 if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type=wave;o.frequency.value=freq;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g);g.connect(dest);o.start(at);o.stop(at+duration+.03);o.onended=()=>{o.disconnect();g.disconnect();};
}
export function unlockAudio(){try{
 if(!ctx){ctx=new AudioContext();music=ctx.createGain();effects=ctx.createGain();music.connect(ctx.destination);effects.connect(ctx.destination);levels();}
 if(ctx.state==='suspended')void ctx.resume();
 if(!timer){next=ctx.currentTime+.08;timer=setInterval(()=>{
  if(!ctx||muted||document.hidden||ctx.state!=='running'){next=ctx?ctx.currentTime+.08:0;return;}
  while(next<ctx.currentTime+.25){const melody=scene==='modern'?[0,7,12,14,7,4,9,7,0,4,12,7,9,4,2,7]:[0,4,7,12,7,4,9,7,2,5,9,12,9,5,7,4];
   const base=scene==='retro'?220:scene==='boss'?146.83:scene==='deep'?174.61:196,f=base*Math.pow(2,melody[beat%16]/12);note(f*2,next,.33,.22,'sine',music!);if(beat%4===0)note(base*Math.pow(2,[0,5,7,0][Math.floor(beat/4)%4]/12),next,1.5,.12,'triangle',music!);beat++;next+=scene==='escape'?.18:scene==='boss'?.24:scene==='modern'?.3:.37;
  }
 },100);}
}catch{}}
export function tone(freq=440,duration=.07,wave:OscillatorType='sine',volume=.025){if(muted)return;unlockAudio();if(ctx&&effects)note(freq,ctx.currentTime,duration,volume,wave,effects);}
export function sfx(kind:'jump'|'throw'|'splat'|'water'|'pickup'|'step'|'cut'|'warning'|'fall'|'impact'|'awakening'|'bubble'|'charge') {
 const spec={jump:[440,.15],throw:[220,.09],splat:[95,.16],water:[320,.23],pickup:[880,.22],step:[130,.045],cut:[165,.12],warning:[660,.18],fall:[120,.6],impact:[55,.38],awakening:[73.42,1.5],bubble:[520,.22],charge:[150,.3]}[kind];
 tone(spec[0],spec[1],kind==='splat'||kind==='cut'?'triangle':'sine',kind==='step'?.012:.06);
 if(kind==='awakening'){tone(110,1.4,'triangle',.08);setTimeout(()=>tone(146.83,.9,'sine',.06),350);}
 if(kind==='pickup')setTimeout(()=>tone(1175,.18,'sine',.04),75);
}
if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden&&ctx?.state==='running')void ctx.suspend();else if(!document.hidden&&ctx)void ctx.resume().catch(()=>{});});
/** Original synthesized ambience. No samples, external recordings or third-party audio licences. */
export function environmentSound(kind:'waterfall'|'lava',proximity:number){
 if(muted||proximity<=0)return;unlockAudio();if(!ctx||!effects)return;
 const duration=1.45,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);let low=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;low=(low+white*.025)/1.025;data[i]=kind==='lava'?low*4:white*.35+low;}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=kind==='lava'?380:1800;const now=ctx.currentTime;gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(Math.min(1,proximity)*(kind==='lava'?.13:.07),now+.15);gain.gain.linearRampToValueAtTime(.0001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(effects);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
}
