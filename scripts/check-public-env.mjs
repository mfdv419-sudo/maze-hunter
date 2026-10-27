import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

// Synthetic build-only markers. This test never connects to Firebase or serves this build.
for(const name of Object.keys(process.env))if(name.startsWith('VITE_'))delete process.env[name];
const publicValues={
 VITE_FIREBASE_API_KEY:'public-web-key-build-verification',
 VITE_FIREBASE_AUTH_DOMAIN:'public-config-check.firebaseapp.com',
 VITE_FIREBASE_PROJECT_ID:'public-config-check',
 VITE_FIREBASE_APP_ID:'1:123456789:web:buildverification',
 VITE_FIREBASE_DATABASE_URL:'https://public-config-check-default-rtdb.firebaseio.com',
};
const forbidden={
 VITE_FIREBASE_CLIENT_EMAIL:'UNUSED_CLIENT_EMAIL_MUST_NOT_BE_BUNDLED',
 VITE_UNRELATED_BUILD_CHECK:'UNRELATED_VITE_VALUE_MUST_NOT_BE_BUNDLED',
 FIREBASE_SERVICE_ACCOUNT_JSON:'SERVER_ONLY_MARKER_MUST_NOT_BE_BUNDLED',
 VOICE_TURN_SECRET:'VOICE_RELAY_SECRET_MUST_NOT_BE_BUNDLED',
};
Object.assign(process.env,publicValues,forbidden);
const folder=await mkdtemp(join(tmpdir(),'maze-public-env-'));
try{
 const {build}=await import('vite');
 await build({configFile:resolve('vite.config.ts'),logLevel:'error',build:{outDir:folder,emptyOutDir:true}});
 const assets=join(folder,'assets');const files=(await readdir(assets)).filter(n=>n.endsWith('.js'));
 const content=(await Promise.all(files.map(n=>readFile(join(assets,n),'utf8')))).join('\n');
 for(const [name,value]of Object.entries(forbidden))assert.ok(!content.includes(value),`${name} unexpectedly reached the browser bundle`);
 for(const [name,value]of Object.entries(publicValues))assert.ok(content.includes(value),`${name} was not available in the Firebase web config`);
 console.log('PUBLIC_ENV_BOUNDARY_PASS: 5 public fields retained; unrelated VITE values and server marker excluded.');
}finally{await rm(folder,{recursive:true,force:true});}
