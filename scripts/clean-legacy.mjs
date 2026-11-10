/** Remove only the explicitly recorded, unchanged files superseded by this consolidation. */
import {readFileSync,existsSync,unlinkSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const obsolete=JSON.parse(readFileSync(resolve(root,'maintenance/obsolete-files.json'),'utf8'));
const pending=[];
for(const item of obsolete){
 const path=resolve(root,item.path);
 if(!path.startsWith(root+sep)||item.path.includes('..'))throw Error('Invalid cleanup path');
 if(!existsSync(path))continue;
 const bytes=readFileSync(path);
 const digest=createHash('sha256').update(bytes).digest('hex');
 const normalized=createHash('sha256').update(bytes.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n')).digest('hex');
 if(digest!==item.sha256&&normalized!==item.sha256)throw Error(`Legacy file has local changes: ${item.path}. Preserve those changes before running cleanup.`);
 pending.push(path);
}
for(const path of pending)unlinkSync(path);
if(pending.length)console.log(`Removed ${pending.length} superseded source files.`);
