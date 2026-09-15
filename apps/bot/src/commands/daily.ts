import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { ensureWallet } from '../lib/ensure';

const DAILY_AMOUNT = 250;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder().setName('daily').setDescription('Claim your daily coins').setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;
  await ensureWallet(userId, guildId);

  // Conditional UPDATE (cooldown checked and reset atomically) instead of a separate
  // read-then-write - otherwise two concurrent /daily calls can both pass a stale
  // cooldown check before either write lands, double-claiming the reward.
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  const claimed = await prisma.wallet.updateMany({
    where: { userId, guildId, OR: [{ lastDaily: null }, { lastDaily: { lt: cutoff } }] },
    data: { balance: { increment: DAILY_AMOUNT }, lastDaily: new Date() },
  });

  if (claimed.count === 0) {
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId_guildId: { userId, guildId } } });
    const elapsed = wallet.lastDaily ? Date.now() - wallet.lastDaily.getTime() : COOLDOWN_MS;
    const remaining = Math.max(COOLDOWN_MS - elapsed, 0);
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return interaction.reply({ content: `⏳ You already claimed today. Try again in ${hours}h ${minutes}m.`, ephemeral: true });
  }

  const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId_guildId: { userId, guildId } } });
  await interaction.reply(`✅ You claimed **${DAILY_AMOUNT}** coins! Balance: **${wallet.balance}**.`);
}
