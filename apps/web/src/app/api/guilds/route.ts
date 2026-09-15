import { NextResponse } from 'next/server';
import { getSession, fetchAdminGuilds } from '@/lib/guildAuth';

export async function GET() {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const guilds = await fetchAdminGuilds(session.accessToken);
  return NextResponse.json({ guilds });
}
