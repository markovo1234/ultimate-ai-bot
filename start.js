const { spawn } = require('child_process');

const port = process.env.PORT || '3000';

const bot = spawn('node', ['apps/bot/dist/index.js'], { stdio: 'inherit' });
const web = spawn('npx', ['--yes', 'next', 'start', '--port', port], {
  cwd: 'apps/web',
  stdio: 'inherit',
  shell: true,
});

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  bot.kill();
  web.kill();
  process.exit(code ?? 0);
}

bot.on('exit', (code) => shutdown(code ?? 1));
web.on('exit', (code) => shutdown(code ?? 1));
process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));
