const { spawn } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const children = [
  spawn(process.execPath, [path.join(root, 'node_modules/ts-node/dist/bin.js'), '-r', 'dotenv/config', 'server.ts'], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true }),
  spawn(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js')], { cwd: root, env: process.env, stdio: 'inherit', windowsHide: true })
];
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', error => { console.error(error); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 1); });
}
process.on('SIGTERM', () => stop(0));
process.on('SIGINT', () => stop(0));
