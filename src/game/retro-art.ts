import type Phaser from 'phaser';
export function drawBinturong(g:Phaser.GameObjects.Graphics,x:number,y:number,s:number,alpha=1) {
 g.lineStyle(s*.11,0x485951,alpha).beginPath().moveTo(x-s*.3,y+s*.22).lineTo(x-s*.53,y+s*.1).lineTo(x-s*.57,y-s*.18).strokePath();
 g.fillStyle(0x34494a,alpha).fillRoundedRect(x-s*.33,y-s*.24,s*.66,s*.54,s*.13);
 g.fillTriangle(x-s*.31,y-s*.15,x-s*.27,y-s*.43,x-s*.09,y-s*.21);g.fillTriangle(x+s*.31,y-s*.15,x+s*.27,y-s*.43,x+s*.09,y-s*.21);
 g.fillStyle(0x94a49b,alpha).fillTriangle(x-s*.15,y+s*.04,x+s*.15,y+s*.04,x,y+s*.29);
 for(const side of [-1,1]) {
  g.fillStyle(0xf6e8b3,alpha).fillCircle(x+side*s*.17,y-s*.03,s*.064);
  g.fillStyle(0x142f35,alpha).fillCircle(x+side*s*.17,y-s*.025,s*.035);
  g.lineStyle(Math.max(1,s*.018),0xede7c6,alpha);
  for(let i=0;i<3;i++)g.lineBetween(x+side*s*.1,y+s*(.13+i*.05),x+side*s*.43,y+s*(.09+i*.09));
 }
 g.fillStyle(0x142f35,alpha).fillCircle(x,y+s*.16,s*.05);
 g.fillStyle(0x3ac5a5,alpha).fillTriangle(x-s*.1,y+s*.3,x+s*.12,y+s*.3,x+s*.03,y+s*.43);
}
export function drawFigs(g:Phaser.GameObjects.Graphics,x:number,y:number,s:number) {
 g.fillStyle(0xdeb97a).fillEllipse(x,y+s*.24,s*.88,s*.27);
 for(const [dx,dy] of [[-.19,.05],[.15,.03],[0,-.19]]) {
  g.fillStyle(0x9d5b96).fillEllipse(x+dx*s,y+dy*s,s*.37,s*.45);
  g.fillStyle(0xc27fb1).fillEllipse(x+dx*s-s*.05,y+dy*s-s*.02,s*.13,s*.24);
  g.fillStyle(0x5c9858).fillTriangle(x+dx*s,y+dy*s-s*.19,x+(dx+.17)*s,y+(dy-.34)*s,x+(dx+.12)*s,y+(dy-.13)*s);
 }
}
