import Link from 'next/link';

export default async function GuildOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  const cards = [
    { href: `/dashboard/${guildId}/ai`, title: 'AI Configuration', desc: 'Set up your API key and provider for the AI commands.' },
    { href: `/dashboard/${guildId}/applications`, title: 'Applications', desc: 'Build your form and review submissions.' },
    { href: `/dashboard/${guildId}/logs`, title: 'Moderation Logs', desc: 'View recent kicks, bans, timeouts, and warnings.' },
    { href: `/dashboard/${guildId}/settings`, title: 'Settings', desc: 'Welcome/log channels and auto-moderation.' },
    { href: `/dashboard/${guildId}/embed`, title: 'Embed Builder', desc: 'Compose and send a rich embed to a channel.' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Server Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-gray-900 border border-gray-800 hover:border-indigo-500 p-6 rounded-xl transition-colors block"
          >
            <h2 className="text-xl font-semibold mb-2">{c.title}</h2>
            <p className="text-gray-400 text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
