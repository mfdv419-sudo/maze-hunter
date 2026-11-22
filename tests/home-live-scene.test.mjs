import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const main=read('src/main.ts');
const css=read('src/home-ui.css');
const avatar=read('src/game/home-character.ts');

test('Home renders the real equipped Binturong instead of a flat hero cutout',()=>{
  assert.match(main,/mountHomeCharacter\(/);
  assert.match(main,/appearanceOf\(profile,readPreferences\(\)\.fur\)/);
  assert.doesNotMatch(main,/home-approved\/hero\.png/);
  assert.doesNotMatch(main,/home-hero-inspect/);
  assert.match(avatar,/createBinturong\(outfit,color,appearance\)/);
  assert.match(avatar,/character\.animate\(/);
  assert.match(avatar,/pointermove/);
});

test('Home still has exactly two mode entrances, no Play CTA',()=>{
  const markup=main.slice(main.indexOf('function home()'),main.indexOf('function journey()'));
  assert.match(markup,/id="retro-mode"/);
  assert.match(markup,/id="modern-mode"/);
  assert.doesNotMatch(markup,/id="home-play"|id="play-now"/);
});

test('Only home-ui.css owns Home layout; no forced CSS rules',()=>{
  assert.match(css,/home-hero-render/);
  assert.doesNotMatch(css,/!important/);
  assert.doesNotMatch(read('src/style.css'),/#game\[data-screen="home"\] header/);
  assert.doesNotMatch(main,/@ts-ignore|@ts-nocheck/);
});

test('Forest Home backdrop is large enough for desktop; assets are mounted',()=>{
  const backdrop=new URL('../public/adventure/home-approved/forest-backdrop.webp',import.meta.url);
  const info=statSync(backdrop);
  assert.ok(info.size>100_000);
  assert.match(main,/home-approved\/forest-backdrop\.webp/);
});
