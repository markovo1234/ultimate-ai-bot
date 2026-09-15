import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@ultimate/database';
import { requireGuildAdmin } from '@/lib/guildAuth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const settings = await prisma.guildSettings.findUnique({ where: { id: guildId } });
  const autoMod = await prisma.autoModConfig.findUnique({ where: { guildId } });

  return NextResponse.json({
    prefix: settings?.prefix ?? '!',
    welcomeChannel: settings?.welcomeChannel ?? '',
    logChannel: settings?.logChannel ?? '',
    autoMod: {
      enabled: autoMod?.enabled ?? false,
      bannedWords: autoMod?.bannedWords ?? '',
      maxMentions: autoMod?.maxMentions ?? 5,
      logChannelId: autoMod?.logChannelId ?? '',
      aiModerationEnabled: autoMod?.aiModerationEnabled ?? false,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  if (!(await requireGuildAdmin(guildId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { prefix, welcomeChannel, logChannel, autoMod } = body as {
    prefix?: string;
    welcomeChannel?: string;
    logChannel?: string;
    autoMod?: { enabled?: boolean; bannedWords?: string; maxMentions?: number; logChannelId?: string; aiModerationEnabled?: boolean };
  };

  await prisma.guildSettings.upsert({
    where: { id: guildId },
    create: { id: guildId, prefix: prefix || '!', welcomeChannel: welcomeChannel || null, logChannel: logChannel || null },
    update: { prefix: prefix || '!', welcomeChannel: welcomeChannel || null, logChannel: logChannel || null },
  });

  if (autoMod) {
    await prisma.autoModConfig.upsert({
      where: { guildId },
      create: {
        guildId,
        enabled: !!autoMod.enabled,
        bannedWords: autoMod.bannedWords ?? '',
        maxMentions: autoMod.maxMentions ?? 5,
        logChannelId: autoMod.logChannelId || null,
        aiModerationEnabled: !!autoMod.aiModerationEnabled,
      },
      update: {
        enabled: !!autoMod.enabled,
        bannedWords: autoMod.bannedWords ?? '',
        maxMentions: autoMod.maxMentions ?? 5,
        logChannelId: autoMod.logChannelId || null,
        aiModerationEnabled: !!autoMod.aiModerationEnabled,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
