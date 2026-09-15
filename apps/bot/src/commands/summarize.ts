import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { prisma } from '@ultimate/database';
import { askAI } from '../lib/aiProvider';

export const data = new SlashCommandBuilder()
  .setName('summarize')
  .setDescription('Summarize the recent conversation in this channel')
  .addIntegerOption((o) =>
    o.setName('messages').setDescription('How many recent messages to summarize (default 50, max 100)').setMinValue(5).setMaxValue(100),
  )
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const guildId = interaction.guildId!;
  const aiConfig = await prisma.aIConfig.findUnique({ where: { guildId } });
  if (!aiConfig) {
    return interaction.editReply('AI is not configured for this server. The owner must set the API key in the dashboard.');
  }

  const count = interaction.options.getInteger('messages') ?? 50;
  const channel = interaction.channel as TextChannel;
  const fetched = await channel.messages.fetch({ limit: count });
  const transcript = [...fetched.values()]
    .reverse()
    .filter((m) => !m.author.bot && m.content.trim().length > 0)
    .map((m) => `${m.author.username}: ${m.content}`)
    .join('\n')
    .slice(0, 12000);

  if (!transcript) {
    return interaction.editReply('Not enough recent text messages to summarize.');
  }

  try {
    const prompt = `Summarize the following Discord conversation in a few concise bullet points:\n\n${transcript}`;
    let responseText = await askAI(aiConfig, prompt);
    if (responseText.length > 2000) responseText = responseText.slice(0, 1997) + '...';
    await interaction.editReply(responseText || 'No summary produced.');
  } catch (e) {
    console.error(e);
    await interaction.editReply('Error communicating with the AI provider. Check dashboard configuration.');
  }
}
