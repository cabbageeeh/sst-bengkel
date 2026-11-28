'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
process.chdir(root);
function arg(name) { const i=process.argv.indexOf(name); return i>=0 ? process.argv[i+1] : null; }
const nodeRoot = arg('--node-root') || path.dirname(process.execPath);
const node = path.join(nodeRoot, 'node.exe');
const version = execFileSync(node, ['-p','process.versions.node'], {encoding:'utf8'}).trim();
if(!version.startsWith('22.')) throw Error('Build installer menggunakan Node.js 22: --node-root <folder Node.js 22>');
const staging = path.join(root,'tmp/installer-build');
const payload = path.join(staging,'payload');
const release = path.join(root,'release');
const desktopVersion = '1.1.1';
if(!staging.startsWith(root+path.sep))throw Error('Invalid build directory');
fs.rmSync(staging,{recursive:true,force:true});
fs.mkdirSync(payload,{recursive:true});fs.mkdirSync(release,{recursive:true});
const run=(file,args)=>execFileSync(file,args,{cwd:root,stdio:'inherit',windowsHide:true});
const icon = path.join(root,'public/images/sst-bengkel.ico');
if(!fs.existsSync(icon)) throw Error('Ikon belum dibuat. Jalankan powershell -ExecutionPolicy Bypass -File desktop/build-icon.ps1');
console.log('Building production frontend and server...');
run(node,[path.join(root,'node_modules/vite/bin/vite.js'),'build','--outDir',path.join(payload,'dist')]);
run(node,[path.join(root,'node_modules/typescript/bin/tsc'),'--outDir',path.join(payload,'app'),'--sourceMap','false']);
fs.cpSync(path.join(root,'public'),path.join(payload,'public'),{recursive:true});
console.log('Collecting production dependencies...');
const npm = path.join(nodeRoot,'node_modules/npm/bin/npm-cli.js');
let dependencyList;
try { dependencyList=execFileSync(node,[npm,'ls','--omit=dev','--all','--parseable'],{cwd:root,encoding:'utf8',maxBuffer:10*1024*1024,env:{...process.env,npm_config_cache:path.join(root,'tmp/npm-cache')},windowsHide:true}); }
catch(error) { if(!error.stdout)throw error; dependencyList=error.stdout.toString(); }
const modulesRoot=path.join(root,'node_modules')+path.sep;
// googleapis is a legacy unused root dependency; OAuth uses axios directly.
const packages=[...new Set(dependencyList.split(/\r?\n/).filter(dir=>dir.startsWith(modulesRoot)&&fs.existsSync(path.join(dir,'package.json'))&&!dir.endsWith(path.sep+'googleapis')))];
if(!packages.some(dir=>dir.endsWith('hyper-express'))||!packages.some(dir=>dir.endsWith('better-sqlite3')))throw Error('Production dependency listing is incomplete');
for(const dir of packages)fs.cpSync(dir,path.join(payload,path.relative(root,dir)),{recursive:true});
// uWS distributes native modules for all platforms. Keep only the bundled runtime's ABI.
const abi=execFileSync(node,['-p','process.versions.modules'],{encoding:'utf8'}).trim();
const uws=path.join(payload,'node_modules/uWebSockets.js');
for(const file of fs.readdirSync(uws))if(file.endsWith('.node')&&file!==`uws_win32_x64_${abi}.node`)fs.unlinkSync(path.join(uws,file));
fs.mkdirSync(path.join(payload,'runtime'),{recursive:true});
for(const file of ['node.exe','LICENSE'])fs.copyFileSync(path.join(nodeRoot,file),path.join(payload,'runtime',file));
for(const file of ['bootstrap.cjs','Start-Installed.ps1','Stop-Installed.ps1'])fs.copyFileSync(path.join(__dirname,'installer',file),path.join(payload,file));
fs.copyFileSync(path.join(__dirname,'INSTALL-WINDOWS.md'),path.join(payload,'PANDUAN.txt'));
fs.writeFileSync(path.join(payload,'package.json'),JSON.stringify({name:'sst-bengkel-desktop',version:desktopVersion,private:true}));
const csc=path.join(process.env.WINDIR||'C:/Windows','Microsoft.NET/Framework64/v4.0.30319/csc.exe');
run(csc,['/nologo','/target:winexe','/reference:System.Windows.Forms.dll',`/win32icon:${icon}`,`/out:${path.join(payload,'SST Bengkel.exe')}`,path.join(__dirname,'installer/InstalledLauncher.cs')]);
run(node,['-e',`require(${JSON.stringify(path.join(payload,'node_modules/hyper-express'))}); const DB=require(${JSON.stringify(path.join(payload,'node_modules/better-sqlite3'))});new DB(':memory:').close();console.log('Bundled native modules OK');`]);
if(process.argv.includes('--prepare-only')) { console.log('Payload prepared: '+payload); process.exit(0); }
const iscc=arg('--iscc')||path.join(root,'tmp/installer-tools/InnoSetup643/ISCC.exe');
if(!fs.existsSync(iscc))throw Error('Inno Setup compiler belum ditemukan. Gunakan --iscc <path ISCC.exe>. Payload sudah dibuat: '+payload);
console.log('Compiling installer...');
run(iscc,['/Qp',`/DAppVersion=${desktopVersion}`,`/DPayloadDir=${payload}`,`/DReleaseDir=${release}`,path.join(__dirname,'installer.iss')]);
const installer=path.join(release,`SST-Bengkel-Setup-${desktopVersion}-x64.exe`);
const checksum=require('node:crypto').createHash('sha256').update(fs.readFileSync(installer)).digest('hex');
fs.writeFileSync(installer+'.sha256',checksum+'  '+path.basename(installer)+'\n');
fs.copyFileSync(path.join(__dirname,'INSTALL-WINDOWS.md'),path.join(release,'PANDUAN-INSTALASI.txt'));
console.log('Installer completed: '+release);
