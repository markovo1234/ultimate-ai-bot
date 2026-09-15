import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { prisma } from '@ultimate/database';

export const data = new SlashCommandBuilder().setName('inventory').setDescription('View your purchased items').setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId!;
  const items = await prisma.inventoryItem.findMany({
    where: { userId: interaction.user.id, guildId },
    include: { item: true },
  });

  if (items.length === 0) {
    return interaction.reply({ content: 'Your inventory is empty. Try `/shop view` and `/shop buy`.', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle('\u{1F392} Your Inventory')
    .setDescription(items.map((i) => `**${i.item.name}** x${i.quantity}`).join('\n'))
    .setColor(0x9b59b6);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
