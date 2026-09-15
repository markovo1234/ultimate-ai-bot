import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ADMINISTRATOR = BigInt(0x8);

export interface AdminGuild {
  id: string;
  name: string;
  icon: string | null;
}

interface DiscordGuildResponse {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

export async function getSession() {
  return getServerSession(authOptions);
}

// Guilds the signed-in user has ADMINISTRATOR on, per Discord's own permission bitfield -
// this is what gates every dashboard read/write, never a guildId the client merely claims.
export async function fetchAdminGuilds(accessToken: string): Promise<AdminGuild[]> {
  const res = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) return [];

  const guilds = (await res.json()) as DiscordGuildResponse[];
  return guilds
    .filter((g) => (BigInt(g.permissions) & ADMINISTRATOR) === ADMINISTRATOR)
    .map((g) => ({ id: g.id, name: g.name, icon: g.icon }));
}

export async function requireGuildAdmin(guildId: string): Promise<boolean> {
  const session = await getSession();
  if (!session?.accessToken) return false;
  const guilds = await fetchAdminGuilds(session.accessToken);
  return guilds.some((g) => g.id === guildId);
}
