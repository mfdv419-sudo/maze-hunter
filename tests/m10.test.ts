import {it,expect} from 'vitest';
import {retroBoard,boardRoute,neighbors} from '../src/game/retro-board';
import {fieldGuideContent} from '../src/game/field-guide';
it('distinguishes real collection effects and currencies in the illustrated ID and EN handbook',()=>{for(const lang of ['id','en']as const){const html=fieldGuideContent(lang);expect(html.match(/class="guide-card"/g)).toHaveLength(8);expect(html.match(/<svg/g)).toHaveLength(8);expect(html).toContain('Adventure');expect(html).toContain('Retro');expect(html).toContain('diamond');}expect(fieldGuideContent('id')).toContain('belum tersedia');expect(fieldGuideContent('en')).toContain('currently do not unlock');});
