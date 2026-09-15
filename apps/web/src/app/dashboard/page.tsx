import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession, fetchAdminGuilds } from '@/lib/guildAuth';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.accessToken) {
    redirect('/api/auth/signin');
  }

  const guilds = await fetchAdminGuilds(session.accessToken);

  return (
    <main className="flex min-h-screen flex-col p-12 md:p-24 bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-8">Select a server</h1>
      {guilds.length === 0 ? (
        <p className="text-gray-400">
          You don&apos;t administer any servers with this bot installed. Invite the bot to a server you manage first.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {guilds.map((g) => (
            <Link
              key={g.id}
              href={`/dashboard/${g.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-indigo-500 p-6 rounded-xl transition-colors"
            >
              <h2 className="text-lg font-semibold">{g.name}</h2>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
