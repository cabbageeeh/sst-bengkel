'use strict';
// Production entry point. All writable files live outside the installation directory.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const root = __dirname;
process.chdir(root);
const dataDir = process.env.SST_DATA_DIR || path.join(process.env.LOCALAPPDATA, 'SSTBengkel');
fs.mkdirSync(dataDir, { recursive: true });
const database = path.join(dataDir, 'bengkel.sqlite3');
const readyFile = path.join(dataDir, 'running.json');
const instance = crypto.randomUUID();
Object.assign(process.env, {
  NODE_ENV: 'production', DB_CONNECTION: 'production', SST_DESKTOP: '1',
  SST_DATABASE_PATH: database, SST_INSTANCE_ID: instance, TITLE: 'SST Bengkel'
});
const knex = require('knex');
const Database = require('better-sqlite3');
let db;
function removeReadyFile() {
  try { if (JSON.parse(fs.readFileSync(readyFile, 'utf8')).instance === instance) fs.unlinkSync(readyFile); } catch {}
}
process.on('exit', removeReadyFile);
async function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.on('error', reject);
    probe.listen(0, '127.0.0.1', () => { const port = probe.address().port; probe.close(error => error ? reject(error) : resolve(port)); });
  });
}
(async () => {
  const migrations = path.join(root, 'app/migrations');
  db = knex({client: 'better-sqlite3', connection: {filename: database}, useNullAsDefault: true});
  const source = {
    getMigrations: () => Promise.resolve(fs.readdirSync(migrations).filter(name => name.endsWith('.js')).sort()),
    // Preserve original migration IDs so copied development databases can be upgraded.
    getMigrationName: name => name.replace(/\.js$/, '.ts'),
    getMigration: name => require(path.join(migrations, name))
  };
  const [, pending] = await db.migrate.list({migrationSource: source});
  if (pending.length && fs.existsSync(database) && fs.statSync(database).size > 0) {
    const backupDir = path.join(dataDir, 'backups');
    fs.mkdirSync(backupDir, {recursive: true});
    const connection = new Database(database);
    try { await connection.backup(path.join(backupDir, `before-update-${Date.now()}.sqlite3`)); }
    finally { connection.close(); }
  }
  await db.migrate.latest({migrationSource: source});
  await db.destroy(); db = null;
  process.env.PORT = String(await freePort());
  await require('./app/server.js').serverReady;
  const state = {pid: process.pid, instance, url: `http://127.0.0.1:${process.env.PORT}`, root, database};
  const tempFile = path.join(dataDir, `running-${process.pid}.tmp`);
  fs.writeFileSync(tempFile, JSON.stringify(state));
  fs.renameSync(tempFile, readyFile);
  console.log('SST Bengkel ready:', state.url);
})().catch(async error => {
  console.error(error);
  if (db) await db.destroy().catch(() => {});
  process.exit(1);
});
