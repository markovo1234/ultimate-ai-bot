import type { Message, TextChannel } from 'discord.js';
import { prisma } from '@ultimate/database';
import { logModeration } from './ensure';
import { askAI } from './aiProvider';

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
  else if (config.aiModerationEnabled && message.content.trim().length >= 12) {
    reason = await checkWithAI(message.guildId, message.content);
  }

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

// Opt-in per guild (AutoModConfig.aiModerationEnabled) - only reached when the fast
// deterministic checks above didn't already flag the message, and only for messages
// long enough to be worth the API call. Fails open: any error just skips AI moderation
// for this message rather than risking false-positive deletions on a broken key/outage.
async function checkWithAI(guildId: string, content: string): Promise<string | null> {
  try {
    const aiConfig = await prisma.aIConfig.findUnique({ where: { guildId } });
    if (!aiConfig) return null;

    const prompt = `You are a Discord auto-moderation classifier. Reply with exactly one word: FLAG if the message below contains harassment, hate speech, threats, or severe toxicity, or OK if it does not.\n\nMessage: "${content.slice(0, 500)}"`;
    const response = await askAI(aiConfig, prompt);

    return response.trim().toUpperCase().startsWith('FLAG') ? 'AI flagged: possible harassment/hate speech/threats' : null;
  } catch (error) {
    console.error('AI auto-mod check failed:', error);
    return null;
  }
}
