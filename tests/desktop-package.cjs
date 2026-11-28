const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname,'..');
const payload = path.resolve(process.argv[2] || path.join(root,'tmp/installer-build/payload'));
const node = path.join(payload,'runtime/node.exe');
const Database = require(path.join(payload,'node_modules/better-sqlite3'));
const dataDir = fs.mkdtempSync(path.join(root,'tmp/installer-smoke-'));
const readyFile = path.join(dataDir,'running.json');
const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
let child;
async function start() {
 child=spawn(node,[path.join(payload,'bootstrap.cjs')],{cwd:payload,windowsHide:true,env:{...process.env,PATH:path.join(process.env.WINDIR,'System32'),SST_DATA_DIR:dataDir},stdio:['ignore','pipe','pipe']});
 let errors='';child.stderr.on('data',chunk=>{errors+=chunk});child.stdout.resume();
 const deadline=Date.now()+30000;
 while(Date.now()<deadline){
  if(child.exitCode!==null)throw Error('Bundled startup failed: '+errors);
  try { const state=JSON.parse(fs.readFileSync(readyFile,'utf8'));const health=await fetch(state.url+'/desktop/health');if((await health.json()).instance===state.instance)return state; } catch {}
  await wait(100);
 }
 throw Error('Readiness timeout: '+errors);
}
async function stop(){if(child&&child.exitCode===null){const exiting=new Promise(resolve=>child.once('exit',resolve));child.kill();await exiting;}}
(async()=>{
 let state=await start();
 const db=new Database(path.join(dataDir,'bengkel.sqlite3'));
 assert.equal(db.prepare('select count(*) n from customers').get().n,0);
 assert.equal(db.prepare('select count(*) n from invoices').get().n,0);
 for(const route of ['/','/customers','/vehicles','/spk','/invoices','/reports','/reports/revenue','/reports/services','/reports/customers']){
  const response=await fetch(state.url+route,{headers:{'X-Inertia':'true'}});assert.equal(response.status,200,route);assert.ok((await response.json()).component,route);
 }
 const home=await (await fetch(state.url)).text();assert.ok(!home.includes('5174'));assert.ok(!home.includes('@vite/client'));
 const assetPaths=[...home.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match=>match[1]);assert.ok(assetPaths.length>=2);
 for(const route of [...assetPaths,'/fonts/InterVariable.woff2','/images/sst-bengkel-logo.png'])assert.equal((await fetch(state.url+route)).status,200,route);
 const created=await fetch(state.url+'/customers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Pengujian Installer',phone:'080000000000',address:'Data uji terisolasi'}),redirect:'manual'});
 assert.ok([301,302,303].includes(created.status));assert.equal(db.prepare('select name from customers').get().name,'Pengujian Installer');
 const customer=db.prepare('select id from customers').get().id;
 const now=Date.now();
 db.prepare('insert into vehicles (id,customer_id,license_plate,brand,model,created_at,updated_at) values (?,?,?,?,?,?,?)').run('test-vehicle',customer,'B 123 SST','Suzuki','Ertiga',now,now);
 db.prepare('insert into spk (id,vehicle_id,spk_number,service_description,status,created_at,updated_at) values (?,?,?,?,?,?,?)').run('test-spk','test-vehicle','SPK-TEST-0001','Servis pengujian installer','completed',now,now);
 db.prepare('insert into invoices (id,spk_id,invoice_number,subtotal,total_amount,status,invoice_date,created_at,updated_at) values (?,?,?,?,?,?,?,?,?)').run('test-invoice','test-spk','INV-TEST-0001',150000,150000,'paid',now,now,now);
 for(const [id,name,type,price] of [['service','Jasa uji','service',100000],['part','Oli uji','part',50000]])
  db.prepare('insert into invoice_items (id,invoice_id,item_name,type,quantity,unit_price,total_price,created_at,updated_at) values (?,?,?,?,?,?,?,?,?)').run(id,'test-invoice',name,type,1,price,price,now,now);
 const pdf=await fetch(state.url+'/spk/test-spk/pdf');assert.equal(pdf.status,200);assert.ok((await pdf.arrayBuffer()).byteLength>10000);
 const invoice=await (await fetch(state.url+'/invoices/test-invoice/pdf',{headers:{'X-Inertia':'true'}})).json();assert.equal(invoice.props.invoiceItems.length,2);assert.equal(Number(invoice.props.invoice.total_amount),150000);
 db.close();
 await stop();state=await start();
 const reopened=new Database(path.join(dataDir,'bengkel.sqlite3'));assert.equal(reopened.prepare('select name from customers').get().name,'Pengujian Installer');assert.equal(reopened.pragma('integrity_check',{simple:true}),'ok');reopened.close();
 console.log('Passed: bundled Node only, empty first database, 9 routes, compiled CSS/JS/fonts/logo, customer save, SPK PDF, invoice details and persistence after restart.');
 console.log('Isolated test data: '+dataDir);
})().catch(error=>{console.error(error);process.exitCode=1}).finally(stop);
