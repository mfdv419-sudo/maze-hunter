import Phaser from 'phaser';
import { SECTORS, getSector } from '../systems/levels';
import { loadProgress } from '../systems/progress';
import { getLanguage, setLanguage, t } from '../systems/i18n';
import { isMuted, setMuted, tone } from '../systems/audio';

const C = { bg: 0x101712, deep: 0x18241c, moss: 0x486642, lime: 0xb4d77c, gold: 0xd9b66b, stone: 0x777b66, paper: '#d9dfc7', muted: '#879582' };
export class MenuScene extends Phaser.Scene {
  private lang = getLanguage(); private retro = localStorage.getItem('mh-retro') === '1'; private reduced = localStorage.getItem('mh-reduced-motion') === '1';
  constructor() { super('Menu'); }
  create() {
    const { width:w, height:h } = this.scale; this.cameras.main.setBackgroundColor(C.bg);
    const bg = this.add.graphics(); bg.fillStyle(C.bg,1).fillRect(0,0,w,h); bg.fillStyle(C.deep,1);
    // A hand-built, asymmetrical maze illustration, not a card-based web layout.
    const s = Math.min(w/960,h/600), ox = w*.47, oy = h*.48;
    for (let i=0;i<15;i++) { const x=ox+(i%5-2)*48*s, y=oy+(Math.floor(i/5)-1)*46*s; bg.fillStyle(i%4===0?C.moss:0x26342a,.8); bg.fillRect(x,y,34*s,34*s); bg.fillStyle(C.bg,1); bg.fillRect(x+7*s,y+7*s,20*s,20*s); }
    bg.lineStyle(2*s,0x607a4b,.45); for(let i=0;i<8;i++){const x=ox-155*s+i*42*s;bg.strokeRect(x,oy-100*s,42*s,200*s);}
    bg.fillStyle(0x9cc86c,.08).fillCircle(ox,oy,140*s); bg.fillStyle(0x9cc86c,.035).fillCircle(ox,oy,200*s);
    for(let i=0;i<45;i++){const x=(i*97%997)/997*w,y=(i*173%719)/719*h;this.add.circle(x,y,(i%3+1)*s, i%4===0?C.gold:C.lime,.2).setBlendMode(Phaser.BlendModes.ADD);}
    this.add.text(w*.07,h*.075,'A FORGOTTEN WORLD  /  EST. BELOW',{fontFamily:'monospace',fontSize:`${Math.max(9,10*s)}px`,color:C.muted,letterSpacing:2});
    this.add.text(w*.065,h*.17,'MAZE',{fontFamily:'Georgia, serif',fontStyle:'bold',fontSize:`${Math.min(100,Math.max(48,w*.105))}px`,color:C.paper,stroke:'#101712',strokeThickness:5}).setShadow(4,5,'#000000',8);
    this.add.text(w*.07,h*.17+Math.min(88,w*.085),'HUNTER',{fontFamily:'Georgia, serif',fontStyle:'bold',fontSize:`${Math.min(100,Math.max(48,w*.105))}px`,color:'#a9c979',stroke:'#101712',strokeThickness:5}).setShadow(4,5,'#000000',8);
    this.add.rectangle(w*.075,h*.17+Math.min(100,w*.1),3,36*s,C.gold).setOrigin(0,.5);
    this.add.text(w*.095,h*.17+Math.min(100,w*.1),'THE MAZE IS ALIVE. IT KNOWS YOUR NAME.',{fontFamily:'monospace',fontSize:`${Math.max(10,12*s)}px`,color:C.gold,letterSpacing:1});
    const p = loadProgress(); const startLabel = p.unlocked > 1 ? t('continue',this.lang) : t('play',this.lang);
    this.menuButton(w*.075,h*.62,Math.min(290,w*.38),48*s,`▶   ${startLabel}`,true,()=>this.scene.start('LevelSelect'));
    this.menuButton(w*.075,h*.62+60*s,Math.min(290,w*.38),42*s,`◈   ${t('solo',this.lang)}`,false,()=>this.scene.start('LevelSelect'));
    this.menuButton(w*.075,h*.62+112*s,Math.min(290,w*.38),42*s,`⚔   ${t('race',this.lang)}`,false,()=>this.scene.start('RaceIntro'));
    this.menuButton(w*.075,h*.62+164*s,Math.min(138,w*.19),38*s,`▧  ${t('retro',this.lang)}`,false,()=>{this.retro=!this.retro;localStorage.setItem('mh-retro',this.retro?'1':'0');tone(500);this.scene.restart();});
    this.menuButton(w*.075+148*s,h*.62+164*s,Math.min(138,w*.19),38*s,t('settings',this.lang),false,()=>this.scene.start('Settings'));
    this.add.text(w*.075,h*.91,`DESCENT ${String(p.unlocked).padStart(2,'0')} / 100     ${p.cleared.length} CLEARED`,{fontFamily:'monospace',fontSize:`${Math.max(10,11*s)}px`,color:C.muted,letterSpacing:1});
    this.add.text(w*.95,h*.94,'V1.0  •  LOCAL SAVE',{fontFamily:'monospace',fontSize:'10px',color:C.muted}).setOrigin(1);
    // The right-hand art shifts gently to give the title screen a living atmosphere.
    if(!this.reduced) this.tweens.add({targets:bg,alpha:.75,duration:2600,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  }
  private menuButton(x:number,y:number,w:number,h:number,label:string,primary:boolean,action:()=>void){const base=this.add.rectangle(x,y,w,h,primary?0x354d31:0x17231b,primary?1:.88).setOrigin(0).setInteractive({useHandCursor:true});const edge=this.add.rectangle(x,y,w,h,0x000000,0).setOrigin(0);edge.setStrokeStyle(1,primary?0xb4d77c:0x52624d,.9);const text=this.add.text(x+16,y+h/2,label,{fontFamily:'monospace',fontSize:`${Math.max(11,Math.min(15,h*.32))}px`,color:primary?'#e5efcf':'#aab7a0',letterSpacing:1}).setOrigin(0,.5);base.on('pointerover',()=>{base.setFillStyle(primary?0x4a693f:0x26382a);text.setColor('#f1f5df');tone(330,.035,'sine',.008);});base.on('pointerout',()=>{base.setFillStyle(primary?0x354d31:0x17231b);text.setColor(primary?'#e5efcf':'#aab7a0');});base.on('pointerdown',()=>{tone(220,.06);action();}); }
}
export class LevelSelectScene extends Phaser.Scene {
  private lang=getLanguage();
  constructor(){super('LevelSelect');}
  create(){const {width:w,height:h}=this.scale;this.cameras.main.setBackgroundColor(0x101712);this.add.text(32,22,'THE DESCENT',{fontFamily:'Georgia,serif',fontSize:'32px',color:'#d9dfc7',fontStyle:'bold'});this.add.text(34,62,'CHOOSE YOUR PATH  /  100 CHAMBERS',{fontFamily:'monospace',fontSize:'11px',color:'#879582',letterSpacing:2});
    const p=loadProgress(), compact=w<650, cols=compact?5:10, gap=compact?7:10, cell=Math.min(compact?46:58,(w-64-gap*(cols-1))/cols), rows=Math.ceil(100/cols), totalH=rows*(cell+gap), top=compact?112:125;
    // Sector strips anchor the map; nodes are navigable and reflect real saved progress.
    for(let i=0;i<100;i++){const col=i%cols,row=Math.floor(i/cols),x=32+col*(cell+gap),y=top+row*(cell+gap);const id=i+1,sector=getSector(id),cleared=p.cleared.includes(id),unlocked=id<=p.unlocked;const color=cleared?0x6d8e4f:unlocked?0x283c2b:0x191f1a;const node=this.add.rectangle(x,y,cell,cell,color,1).setOrigin(0).setStrokeStyle(1,cleared?0xb4d77c:unlocked?sector.color:0x343b32,.9);this.add.text(x+cell/2,y+cell/2,String(id).padStart(2,'0'),{fontFamily:'monospace',fontSize:`${Math.max(10,cell*.25)}px`,color:cleared?'#f0f4d8':unlocked?'#d4ddc7':'#626a5f'}).setOrigin(.5);if(unlocked){node.setInteractive({useHandCursor:true});node.on('pointerover',()=>node.setStrokeStyle(2,0xd9b66b));node.on('pointerout',()=>node.setStrokeStyle(1,cleared?0xb4d77c:sector.color));node.on('pointerdown',()=>{tone(240);this.scene.start('Game',{level:id,mode:'solo'});});}}
    const sectorY=h-42;const labels=SECTORS.map(s=>`${s.from}–${s.to} ${s.name.toUpperCase()}`);this.add.text(32,sectorY,labels.join('    /    '),{fontFamily:'monospace',fontSize:`${Math.max(8,Math.min(11,w/90))}px`,color:'#879582',letterSpacing:1});this.add.text(w-28,26,'← ESC / BACK',{fontFamily:'monospace',fontSize:'11px',color:'#b4d77c'}).setOrigin(1,0).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('Menu'));this.input.keyboard?.on('keydown-ESC',()=>this.scene.start('Menu'));this.input.on('wheel',(_p:unknown,_objs:unknown,_dx:number,dy:number)=>{this.cameras.main.scrollY=Phaser.Math.Clamp(this.cameras.main.scrollY+dy,0,Math.max(0,totalH+top-h+75));});
  }
}
export class SettingsScene extends Phaser.Scene {
 constructor(){super('Settings');}
 create(){const {width:w,height:h}=this.scale;this.cameras.main.setBackgroundColor(0x101712);this.add.text(40,35,'FIELD NOTES / SETTINGS',{fontFamily:'Georgia,serif',fontSize:'32px',color:'#d9dfc7'});let y=125;const row=(label:string,value:string,fn:()=>void)=>{const t=this.add.text(48,y,`${label}     ${value}   ↻`,{fontFamily:'monospace',fontSize:'17px',color:'#b4d77c'}).setInteractive({useHandCursor:true});t.on('pointerdown',fn);y+=62;};row(settingLabel('language'),getLanguage()==='en'?'English':'Bahasa Indonesia',()=>{setLanguage(getLanguage()==='en'?'id':'en');this.scene.restart();});row(settingLabel('sound'),isMuted()?'Off':'On',()=>{setMuted(!isMuted());this.scene.restart();});row(settingLabel('reduced'),localStorage.getItem('mh-reduced-motion')==='1'?'On':'Off',()=>{localStorage.setItem('mh-reduced-motion',localStorage.getItem('mh-reduced-motion')==='1'?'0':'1');this.scene.restart();});this.add.text(48,h-60,'← BACK TO TITLE',{fontFamily:'monospace',fontSize:'13px',color:'#d9b66b'}).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('Menu'));this.input.keyboard?.on('keydown-ESC',()=>this.scene.start('Menu'));}
}
function settingLabel(key:'language'|'sound'|'reduced'){return ({language:'LANGUAGE',sound:'SOUND',reduced:'REDUCE MOTION'} as const)[key];}
export class RaceIntroScene extends Phaser.Scene {constructor(){super('RaceIntro');}create(){const {width:w,height:h}=this.scale;this.cameras.main.setBackgroundColor(0x101712);this.add.text(w/2,h*.25,'RACE THE WARDEN',{fontFamily:'Georgia,serif',fontSize:'38px',color:'#d9dfc7'}).setOrigin(.5);this.add.text(w/2,h*.4,'LOCAL PRACTICE  /  AI OPPONENT\nRace AI is playable locally. Online multiplayer requires a server.',{fontFamily:'monospace',fontSize:'14px',color:'#879582',align:'center',lineSpacing:9}).setOrigin(.5);const b=this.add.text(w/2,h*.58,'[ START RACE ]',{fontFamily:'monospace',fontSize:'20px',color:'#b4d77c',padding:{x:18,y:14},backgroundColor:'#26382a'}).setOrigin(.5).setInteractive({useHandCursor:true});b.on('pointerdown',()=>this.scene.start('Game',{level:Math.max(1,loadProgress().unlocked),mode:'race'}));this.add.text(w/2,h*.76,'← BACK',{fontFamily:'monospace',fontSize:'13px',color:'#d9b66b'}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerdown',()=>this.scene.start('Menu'));this.input.keyboard?.on('keydown-ESC',()=>this.scene.start('Menu'));}}
