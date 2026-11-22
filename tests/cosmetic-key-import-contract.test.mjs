import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

// Regression check for Netlify TS2552 (2026-11-22).
// All Shop calls must refer to an exported, explicitly imported helper.
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const cosmetics = readFileSync(new URL('../src/services/cosmetics.ts', import.meta.url), 'utf8');
const cosmeticsImport = main.match(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/services\/cosmetics['"]/s);
assert.ok(cosmeticsImport, 'Shop cosmetics import must exist');
assert.match(cosmeticsImport[1], /(?:^|,)\s*cosmeticKey\s*(?:,|$)/, 'cosmeticKey must be explicitly imported');
assert.match(cosmetics, /export\s+const\s+cosmeticKey\s*=/, 'cosmeticKey must be exported by cosmetics service');
assert.equal((main.match(/cosmeticKey\s*\(/g) || []).length, 3, 'Expected three Shop key lookups');
console.log('PASS cosmeticKey imported and exported; 3 Shop key lookups verified');
