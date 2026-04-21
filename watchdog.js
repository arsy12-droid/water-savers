const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'dev.log');

function startServer() {
  const child = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PATH: process.env.PATH },
  });

  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  child.stdout.on('data', (data) => {
    const msg = data.toString();
    process.stdout.write(msg);
    logStream.write(msg);
  });

  child.stderr.on('data', (data) => {
    const msg = data.toString();
    process.stderr.write(msg);
    logStream.write(msg);
  });

  child.on('exit', (code) => {
    logStream.write(`\n[watchdog] Server exited with code ${code}. Restarting in 2s...\n`);
    setTimeout(startServer, 2000);
  });

  child.on('error', (err) => {
    logStream.write(`\n[watchdog] Error: ${err.message}. Restarting in 2s...\n`);
    setTimeout(startServer, 2000);
  });

  // Keep the Node process alive
  process.on('SIGTERM', () => {
    child.kill();
    process.exit(0);
  });
}

console.log('[watchdog] Starting Next.js dev server watchdog...');
startServer();
