const { spawn, spawnSync } = require('child_process');

const port = process.env.PORT || '3000';

// Sync the Postgres schema before starting anything. There are no generated migrations
// in this project (packages/database/package.json's own "push" script is `prisma db
// push`, not `migrate`), and build time has no network access to the database - the
// container's own boot is the only point in the pipeline that can reach it. Idempotent,
// safe to run on every start. Not passing --accept-data-loss on purpose: a schema change
// that would actually lose data should fail loudly here (visible in Railway's deploy
// logs) rather than apply silently.
console.log('Syncing database schema...');
const push = spawnSync(
  'npx',
  ['--yes', 'prisma', 'db', 'push', '--skip-generate', '--schema=packages/database/prisma/schema.prisma'],
  { stdio: 'inherit', shell: true },
);
if (push.status !== 0) {
  console.error('prisma db push failed - exiting so the platform surfaces this as a failed deploy.');
  process.exit(push.status ?? 1);
}

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
