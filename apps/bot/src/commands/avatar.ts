import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription("Show a member's avatar")
  .addUserOption((o) => o.setName('target').setDescription('Member to inspect'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('target') ?? interaction.user;
  const embed = new EmbedBuilder()
    .setTitle(`${user.tag}'s avatar`)
    .setImage(user.displayAvatarURL({ size: 1024 }))
    .setColor(0x5865f2);

  await interaction.reply({ embeds: [embed] });
}
