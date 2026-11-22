import {describe,it,expect} from 'vitest';
import {newProfile} from '../src/services/local';
import {cosmetics,appearanceOf,permittedAppearance,owns,redeem,settleWardrobe,starBalance,cosmeticKey} from '../src/services/cosmetics';

describe('Shop preview and purchase isolation',()=>{
 it('catalog contains all 90 existing cosmetics and expedition rewards',()=>{
   expect(cosmetics).toHaveLength(90);
   expect(new Set(cosmetics.map(c=>cosmeticKey(c))).size).toBe(90);
 });
 it('a selected unowned cosmetic cannot become equipped merely by viewing it',()=>{
   const p=newProfile('Tester','id');
   const item=cosmetics.find(c=>c.slot==='head'&&c.id==='moon')!;
   const before=JSON.stringify(p.appearance||{});
   const previewOnly={...appearanceOf(p),[item.slot]:item.id};
   expect(previewOnly.head).toBe('moon');
   expect(owns(p,item)).toBe(false);
   expect(JSON.stringify(p.appearance||{})).toBe(before);
   expect(permittedAppearance({...p,appearance:previewOnly}).head).toBe('bare');
 });
 it('pending purchases reserve stars, but ownership and equip only follow server settlement',()=>{
   const p=newProfile('Tester','id');
   for(let i=1;i<=20;i++)p.retro[String(i)]={stars:3,seconds:15,errors:0};
   const item=cosmetics.find(c=>c.slot==='hands'&&c.id==='trail')!;
   const original=starBalance(p);
   expect(redeem(p,item)).toBe(true);
   expect(starBalance(p)).toBe(original-item.stars);
   expect(owns(p,item)).toBe(false);
   expect(permittedAppearance({...p,appearance:{...appearanceOf(p),hands:item.id}}).hands).toBe('bare');
   expect(redeem(p,item)).toBe(true);
   expect(p.wardrobe?.pending).toEqual([cosmeticKey(item)]);
   const receipt=settleWardrobe(p,undefined,p.wardrobe!.pending);
   p.wardrobe=receipt.wallet;
   expect(owns(p,item)).toBe(true);
   expect(permittedAppearance({...p,appearance:{...appearanceOf(p),hands:item.id}}).hands).toBe(item.id);
 });
});
