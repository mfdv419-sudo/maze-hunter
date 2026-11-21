import {describe,expect,it} from 'vitest';
import {adventureBackdrop,expeditionPicker} from '../src/ui/adventure-picker';

describe('Adventure page: separate from Home and crisp at any viewport',()=>{
 it('keeps low-resolution world thumbnails out of large posters',()=>{
  for(const area of ['classic','coast','desert','gorge','mountain','sea','volcano'] as const){
   expect(adventureBackdrop(area)).toMatch(/^data:image\/svg\+xml/);
   expect(adventureBackdrop(area)).not.toContain('/adventure/'+area+'.webp');
  }
  expect(adventureBackdrop('forest')).toBe('/adventure/forest-panorama.webp');
  expect(adventureBackdrop('forest','extreme')).toBe('/adventure/forest-expanded-extreme.webp');
 });
 it('keeps Expanded at the difficulty row and background selection in Adventure',()=>{
  const html=expeditionPicker('gorge','medium','id',undefined,2,[],false,true,()=>true,true,false);
  expect(html).toContain('id="forest-world-open"');
  expect(html).toContain('id="equip-world-background"');
  expect(html).toContain('id="explore-area"');
 });
});
