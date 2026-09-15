import { prisma } from '@ultimate/database';

const ACTION_COLORS: Record<string, string> = {
  BAN: 'bg-red-900 text-red-300',
  KICK: 'bg-orange-900 text-orange-300',
  TIMEOUT: 'bg-yellow-900 text-yellow-300',
  WARN: 'bg-yellow-900 text-yellow-300',
  CLEAR: 'bg-gray-800 text-gray-300',
  AUTOMOD: 'bg-purple-900 text-purple-300',
};

export default async function LogsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const logs = await prisma.moderationLog.findMany({
    where: { guildId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moderation Logs</h1>
      {logs.length === 0 ? (
        <p className="text-gray-400">No moderation actions recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-md px-4 py-3 flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${ACTION_COLORS[log.action] ?? 'bg-gray-800 text-gray-300'}`}>{log.action}</span>
              <span className="text-sm flex-1">
                Target <code>{log.targetId}</code> by <code>{log.moderatorId}</code>
                {log.reason ? ` — ${log.reason}` : ''}
              </span>
              <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
