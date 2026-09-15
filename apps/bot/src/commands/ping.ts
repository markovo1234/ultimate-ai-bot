import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription("Check the bot's latency");

export async function execute(interaction: ChatInputCommandInteraction) {
  const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`\u{1F3D3} Pong! Latency: ${latency}ms | API: ${Math.round(interaction.client.ws.ping)}ms`);
}
