import { prisma } from '@ultimate/database';
import type { User as DiscordUser } from 'discord.js';

export async function ensureGuild(guildId: string) {
  return prisma.guildSettings.upsert({
    where: { id: guildId },
    create: { id: guildId },
    update: {},
  });
}

export async function ensureUser(user: DiscordUser) {
  return prisma.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator ?? '0',
      avatar: user.avatar,
    },
    update: {
      username: user.username,
      discriminator: user.discriminator ?? '0',
      avatar: user.avatar,
    },
  });
}

export async function ensureWallet(userId: string, guildId: string) {
  return prisma.wallet.upsert({
    where: { userId_guildId: { userId, guildId } },
    create: { userId, guildId },
    update: {},
  });
}

export async function logModeration(params: {
  guildId: string;
  target: DiscordUser;
  moderatorId: string;
  action: string;
  reason?: string | null;
}) {
  await ensureGuild(params.guildId);
  await ensureUser(params.target);
  await prisma.moderationLog.create({
    data: {
      guildId: params.guildId,
      targetId: params.target.id,
      moderatorId: params.moderatorId,
      action: params.action,
      reason: params.reason ?? undefined,
    },
  });
}
