import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '@ultimate/database';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Show the richest members in this server')
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const wallets = await prisma.wallet.findMany({
    where: { guildId: interaction.guildId! },
    orderBy: { balance: 'desc' },
    take: 10,
  });

  if (wallets.length === 0) {
    return interaction.reply('No one has any coins yet.');
  }

  const lines = await Promise.all(
    wallets.map(async (w, i) => {
      const user = await interaction.client.users.fetch(w.userId).catch(() => null);
      return `**${i + 1}.** ${user ? user.tag : w.userId} — ${w.balance} coins`;
    }),
  );

  const embed = new EmbedBuilder().setTitle('\u{1F3C6} Coin Leaderboard').setDescription(lines.join('\n')).setColor(0xf1c40f);
  await interaction.reply({ embeds: [embed] });
}
