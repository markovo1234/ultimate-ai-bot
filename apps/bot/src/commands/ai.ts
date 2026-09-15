import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { askAI } from '../lib/aiProvider';

export const data = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('Ask the AI a question')
  .addStringOption((option) => option.setName('prompt').setDescription('The prompt for the AI').setRequired(true))
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  const aiConfig = await prisma.aIConfig.findUnique({ where: { guildId } });

  if (!aiConfig) {
    return interaction.editReply('AI is not configured for this server. The owner must set the API key in the dashboard.');
  }

  try {
    const prompt = interaction.options.getString('prompt', true);
    let responseText = await askAI(aiConfig, prompt);

    if (responseText.length > 2000) {
      responseText = responseText.slice(0, 1997) + '...';
    }

    await interaction.editReply(responseText);
  } catch (e) {
    console.error(e);
    await interaction.editReply('Error communicating with the AI provider. Check dashboard configuration.');
  }
}
