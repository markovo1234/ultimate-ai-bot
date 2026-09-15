import type { ModalSubmitInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { ensureGuild } from './ensure';

export async function handleApplicationSubmit(interaction: ModalSubmitInteraction) {
  const guildId = interaction.guildId;
  if (!guildId) return;

  const existing = await prisma.applicationForm.findFirst({
    where: { guildId, userId: interaction.user.id, status: 'PENDING' },
  });
  if (existing) {
    return interaction.reply({ content: 'You already have a pending application for this server.', ephemeral: true });
  }

  const questions = await prisma.applicationQuestion.findMany({
    where: { guildId },
    orderBy: { order: 'asc' },
    take: 5,
  });

  const answers: Record<string, string> = {};
  for (const q of questions) {
    try {
      answers[q.label] = interaction.fields.getTextInputValue(q.id);
    } catch {
      // Question was edited/removed between the modal being shown and submitted
    }
  }

  await ensureGuild(guildId);
  await prisma.applicationForm.create({
    data: {
      guildId,
      userId: interaction.user.id,
      content: JSON.stringify(answers),
    },
  });

  await interaction.reply({ content: '✅ Your application was submitted for review.', ephemeral: true });
}
