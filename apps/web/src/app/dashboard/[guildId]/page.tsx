import Link from 'next/link';

interface ModuleCard {
  href: string;
  title: string;
  description: string;
  icon: string;
}
interface ModuleGroup {
  title: string;
  cards: ModuleCard[];
}

export default async function GuildOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;

  const groups: ModuleGroup[] = [
    {
      title: 'Applications',
      cards: [
        {
          href: `/dashboard/${guildId}/applications`,
          title: 'Review Queue',
          description: 'Review, accept, or deny member applications.',
          icon: '\u{1F4CB}',
        },
        {
          href: `/dashboard/${guildId}/applications/questions`,
          title: 'Form Builder',
          description: 'Configure the questions members answer with /apply.',
          icon: '✏️',
        },
      ],
    },
    {
      title: 'Moderation',
      cards: [
        {
          href: `/dashboard/${guildId}/logs`,
          title: 'Logs',
          description: 'View recent kicks, bans, timeouts, and warnings.',
          icon: '\u{1F6E1}️',
        },
        {
          href: `/dashboard/${guildId}/settings`,
          title: 'Auto-Mod & Settings',
          description: 'Banned words, mention limits, welcome/log channels.',
          icon: '⚙️',
        },
      ],
    },
    {
      title: 'AI',
      cards: [
        {
          href: `/dashboard/${guildId}/ai`,
          title: 'Configuration',
          description: 'Set your provider and API key for /ai and /summarize.',
          icon: '✨',
        },
      ],
    },
    {
      title: 'Tools',
      cards: [
        {
          href: `/dashboard/${guildId}/embed`,
          title: 'Embed Builder',
          description: 'Compose and send a rich embed to a channel.',
          icon: '\u{1F4E8}',
        },
      ],
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Modules</h1>
      <p className="text-gray-400 mb-8">Configure Ultimate AI Bot for this server.</p>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="text-lg font-semibold border-b border-gray-800 pb-2 mb-4">{group.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.cards.map((card) => (
                <div key={card.href} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
                  <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-lg mb-3">{card.icon}</div>
                  <h3 className="font-semibold mb-1">{card.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 flex-1">{card.description}</p>
                  <Link
                    href={card.href}
                    className="inline-flex items-center justify-center gap-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-md px-3 py-1.5 w-fit"
                  >
                    {'⚙️'} Configure
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
