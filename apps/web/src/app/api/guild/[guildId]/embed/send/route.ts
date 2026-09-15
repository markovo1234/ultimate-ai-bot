import { NextRequest, NextResponse } from 'next/server';
import { requireGuildAdmin } from '@/lib/guildAuth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { channelId, embed } = body as { channelId?: string; embed?: Record<string, unknown> };

  if (!channelId || !/^\d+$/.test(channelId)) {
    return NextResponse.json({ error: 'A valid channel ID is required' }, { status: 400 });
  }
  if (!embed || typeof embed !== 'object') {
    return NextResponse.json({ error: 'Embed payload is required' }, { status: 400 });
  }

  // requireGuildAdmin only proves the caller administers `guildId` - channelId is
  // client-supplied and must be independently confirmed to belong to that same guild,
  // otherwise an admin of any guild could direct the bot to post into any other guild's
  // channel using the bot's own (unscoped) token.
  const channelRes = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
  });
  if (!channelRes.ok) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }
  const channel = (await channelRes.json()) as { guild_id?: string };
  if (channel.guild_id !== guildId) {
    return NextResponse.json({ error: 'That channel does not belong to this server' }, { status: 403 });
  }

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Discord API error: ${text}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
