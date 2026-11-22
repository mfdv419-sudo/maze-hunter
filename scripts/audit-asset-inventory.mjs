import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
function compile(file, deps={}) {
 const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,require(name){assert.ok(Object.hasOwn(deps,name),`Unexpected dependency: ${name}`);return deps[name];}},{filename:file,timeout:3000});
 return JSON.parse(JSON.stringify(module.exports));
}
const progression=compile('src/game/forest-progression.ts');
const expedition=compile('src/game/expedition-equipment.ts',{'./forest-progression':progression});
const catalog=compile('src/services/cosmetics.ts',{'./local':{},'../game/forest-progression':progression,'../game/expedition-equipment':expedition});
if(process.argv.includes('--dump')){console.log(JSON.stringify({cosmetics:catalog.cosmetics,slots:catalog.slots,defaults:catalog.defaults,paletteColors:catalog.paletteColors,forestEarnedEquipment:progression.forestEarnedEquipment,stages:progression.forestStages,benefits:expedition.equipmentBenefits},null,2));process.exit(0);}
const inv=JSON.parse(fs.readFileSync(path.join(root,'assets/production/binturong-asset-inventory.json'),'utf8'));
const items=inv.catalog_items;
assert.equal(items.length,catalog.cosmetics.length);
const keys=new Set(items.map(x=>x.key));assert.equal(keys.size,items.length);
assert.equal(JSON.stringify(inv.default_appearance),JSON.stringify(catalog.defaults));
for(const c of catalog.cosmetics){
 const key=`${c.slot}:${c.id}`,item=items.find(x=>x.key===key);assert.ok(item,key);
 for(const k of ['id','slot','name','rarity','stars','wins','zones'])assert.deepEqual(item.catalog[k]??null,c[k]??null,`${key} ${k}`);
 assert.deepEqual(item.catalog.expedition??null,c.expedition??null,`${key} expedition`);
 assert.ok(item.design_id && item.parts?.length && item.production_status,`${key} production fields`);
 if(item.type==='mesh')assert.ok(item.outputs?.glb&&item.outputs?.blend&&item.outputs?.shop_icon&&item.outputs?.equipped_preview,`${key} missing outputs`);
 if(c.expedition){assert.equal(item.unlock.stage,c.expedition.stage);assert.equal(item.unlock.area,c.expedition.area);}
}
const aliases=inv.forest_legacy_reward_links;
assert.deepEqual(aliases.map(a=>a.legacy_key),progression.forestEarnedEquipment.map(a=>a.shopKey));
assert.ok(aliases.every(a=>keys.has(a.legacy_key)&&keys.has(a.reward_key)));
assert.equal(new Set(items.filter(x=>x.type==='mesh').map(x=>x.outputs.glb)).size,items.filter(x=>x.type==='mesh').length);
assert.ok(items.filter(x=>x.type==='palette').every(x=>x.outputs.glb===undefined));
assert.ok(items.filter(x=>x.type==='none').every(x=>x.outputs.glb===undefined));
console.log(`PASS ${items.length}/${catalog.cosmetics.length} catalog entries, ${catalog.cosmetics.filter(x=>x.expedition).length} expedition rewards, ${aliases.length} legacy links; exact IDs, price, rarity, slots, reward stage, unique asset paths. This is an inventory audit, not a 3D/render test.`);
