import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Show information about a member')
  .addUserOption((o) => o.setName('target').setDescription('Member to inspect'));

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('target') ?? interaction.user;
  const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

  const embed = new EmbedBuilder()
    .setTitle(user.tag)
    .setThumbnail(user.displayAvatarURL())
    .addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
    )
    .setColor(0x5865f2);

  if (member) {
    embed.addFields(
      { name: 'Joined server', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
      { name: 'Roles', value: member.roles.cache.filter((r) => r.id !== interaction.guildId).map((r) => r.toString()).join(' ') || 'None' },
    );
  }

  await interaction.reply({ embeds: [embed] });
}
