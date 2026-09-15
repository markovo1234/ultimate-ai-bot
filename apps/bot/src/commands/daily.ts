import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { ensureWallet } from '../lib/ensure';

const DAILY_AMOUNT = 250;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const data = new SlashCommandBuilder().setName('daily').setDescription('Claim your daily coins').setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;
  const wallet = await ensureWallet(userId, guildId);

  if (wallet.lastDaily) {
    const elapsed = Date.now() - wallet.lastDaily.getTime();
    if (elapsed < COOLDOWN_MS) {
      const remaining = COOLDOWN_MS - elapsed;
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      return interaction.reply({ content: `⏳ You already claimed today. Try again in ${hours}h ${minutes}m.`, ephemeral: true });
    }
  }

  const updated = await prisma.wallet.update({
    where: { userId_guildId: { userId, guildId } },
    data: { balance: { increment: DAILY_AMOUNT }, lastDaily: new Date() },
  });

  await interaction.reply(`✅ You claimed **${DAILY_AMOUNT}** coins! Balance: **${updated.balance}**.`);
}
