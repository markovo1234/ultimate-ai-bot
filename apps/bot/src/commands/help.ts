import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('help').setDescription('List available commands');

const CATEGORIES: Record<string, string[]> = {
  Moderation: ['kick', 'ban', 'timeout', 'warn', 'clear'],
  Utility: ['ping', 'userinfo', 'serverinfo', 'avatar', 'help'],
  Economy: ['balance', 'daily', 'work', 'pay', 'leaderboard', 'shop'],
  Applications: ['apply'],
  AI: ['ai', 'summarize'],
};

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder().setTitle('Command list').setColor(0x5865f2);

  for (const [category, cmds] of Object.entries(CATEGORIES)) {
    embed.addFields({ name: category, value: cmds.map((c) => `\`/${c}\``).join(', ') });
  }

  await interaction.reply({ embeds: [embed] });
}
