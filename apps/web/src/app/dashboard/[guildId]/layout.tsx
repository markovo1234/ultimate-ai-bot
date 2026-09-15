import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireGuildAdmin, getSession } from '@/lib/guildAuth';

interface NavItem {
  href: string;
  label: string;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

export default async function GuildLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const isAdmin = await requireGuildAdmin(guildId);
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const session = await getSession();

  const groups: NavGroup[] = [
    {
      title: 'Applications',
      items: [
        { href: `/dashboard/${guildId}/applications`, label: 'Review Queue' },
        { href: `/dashboard/${guildId}/applications/questions`, label: 'Form Builder' },
      ],
    },
    {
      title: 'Moderation',
      items: [
        { href: `/dashboard/${guildId}/logs`, label: 'Logs' },
        { href: `/dashboard/${guildId}/settings`, label: 'Auto-Mod & Settings' },
      ],
    },
    {
      title: 'AI',
      items: [{ href: `/dashboard/${guildId}/ai`, label: 'Configuration' }],
    },
    {
      title: 'Tools',
      items: [{ href: `/dashboard/${guildId}/embed`, label: 'Embed Builder' }],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <aside className="w-64 shrink-0 border-r border-gray-800 flex flex-col h-screen sticky top-0">
        <div className="p-4 border-b border-gray-800">
          <Link href={`/dashboard/${guildId}`} className="flex items-center gap-2 font-bold">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm shrink-0">
              {'\u{1F916}'}
            </span>
            <span className="truncate">Ultimate AI Bot</span>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-gray-800">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">
            {'←'} Switch server
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <Link href={`/dashboard/${guildId}`} className="block text-sm font-medium text-gray-300 hover:text-white">
            Overview
          </Link>
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm text-gray-300 hover:text-white hover:bg-gray-900 rounded-md px-2 py-1.5 -mx-2"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {session?.user && (
          <div className="p-4 border-t border-gray-800 flex items-center gap-2 min-w-0">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- small external avatar, not worth configuring remotePatterns for
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full shrink-0" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
            )}
            <span className="text-sm text-gray-300 truncate">{session.user.name}</span>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">{children}</main>
    </div>
  );
}
