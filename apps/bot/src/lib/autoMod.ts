import type { Message, TextChannel } from 'discord.js';
import { prisma } from '@ultimate/database';
import { logModeration } from './ensure';

export async function handleAutoMod(message: Message) {
  if (!message.guildId || message.author.bot) return;

  const config = await prisma.autoModConfig.findUnique({ where: { guildId: message.guildId } });
  if (!config || !config.enabled) return;

  const bannedWords = config.bannedWords
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

  const content = message.content.toLowerCase();
  const hitWord = bannedWords.find((w) => content.includes(w));
  const mentionCount = message.mentions.users.size + message.mentions.roles.size;

  let reason: string | null = null;
  if (hitWord) reason = 'Banned word detected';
  else if (mentionCount > config.maxMentions) reason = `Mass mention (${mentionCount} mentions)`;

  if (!reason) return;

  await message.delete().catch(() => {});
  await logModeration({
    guildId: message.guildId,
    target: message.author,
    moderatorId: message.client.user!.id,
    action: 'AUTOMOD',
    reason,
  });

  if (config.logChannelId) {
    const channel = message.guild?.channels.cache.get(config.logChannelId) as TextChannel | undefined;
    channel?.send(`\u{1F6E1}️ Auto-mod removed a message from ${message.author.tag}: ${reason}`).catch(() => {});
  }
}
