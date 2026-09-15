import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('serverinfo').setDescription('Show information about this server').setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;
  const owner = await guild.fetchOwner().catch(() => null);

  const embed = new EmbedBuilder()
    .setTitle(guild.name)
    .setThumbnail(guild.iconURL())
    .addFields(
      { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
      { name: 'Members', value: `${guild.memberCount}`, inline: true },
      { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
      { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
      { name: 'Boost tier', value: `${guild.premiumTier}`, inline: true },
    )
    .setColor(0x5865f2);

  await interaction.reply({ embeds: [embed] });
}
