export const cakeKinds=['normal','red','yellow','green']as const;
export type CakeKind=typeof cakeKinds[number];
export const cakeColors={normal:0xffe3d2,red:0xf17676,yellow:0xffd45d,green:0x86d497};
export const cakeNames={normal:['Asli','Classic'],red:['Merah · kuat','Red · power'],yellow:['Kuning · stun','Yellow · stun'],green:['Hijau · lambat','Green · slow']}as const;
