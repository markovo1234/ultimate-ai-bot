import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireGuildAdmin } from '@/lib/guildAuth';

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

  const tabs = [
    { href: `/dashboard/${guildId}`, label: 'Overview' },
    { href: `/dashboard/${guildId}/ai`, label: 'AI Config' },
    { href: `/dashboard/${guildId}/applications`, label: 'Applications' },
    { href: `/dashboard/${guildId}/logs`, label: 'Moderation Logs' },
    { href: `/dashboard/${guildId}/settings`, label: 'Settings' },
    { href: `/dashboard/${guildId}/embed`, label: 'Embed Builder' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex flex-wrap gap-4 items-center">
        {tabs.map((t) => (
          <Link key={t.href} href={t.href} className="text-sm text-gray-300 hover:text-white">
            {t.label}
          </Link>
        ))}
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-white ml-auto">
          &larr; All servers
        </Link>
      </nav>
      <div className="p-6 md:p-12">{children}</div>
    </div>
  );
}
