import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { prisma } from '@ultimate/database';

export const data = new SlashCommandBuilder()
  .setName('apply')
  .setDescription("Apply to this server's application form")
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId!;
  const questions = await prisma.applicationQuestion.findMany({
    where: { guildId },
    orderBy: { order: 'asc' },
    take: 5, // Discord modals support at most 5 components
  });

  if (questions.length === 0) {
    return interaction.reply({ content: "This server hasn't set up an application form yet.", ephemeral: true });
  }

  const existing = await prisma.applicationForm.findFirst({
    where: { guildId, userId: interaction.user.id, status: 'PENDING' },
  });
  if (existing) {
    return interaction.reply({ content: 'You already have a pending application for this server.', ephemeral: true });
  }

  const modal = new ModalBuilder().setCustomId('application_submit').setTitle('Server Application');

  for (const q of questions) {
    const input = new TextInputBuilder()
      .setCustomId(q.id)
      .setLabel(q.label.slice(0, 45))
      .setStyle(q.style === 'PARAGRAPH' ? TextInputStyle.Paragraph : TextInputStyle.Short)
      .setRequired(q.required);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  }

  await interaction.showModal(modal);
}
