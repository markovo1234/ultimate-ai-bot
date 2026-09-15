import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Unlock a channel so @everyone can send messages again')
  .addChannelOption((o) => o.setName('channel').setDescription('Channel to unlock (default: this channel)'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = (interaction.options.getChannel('channel') ?? interaction.channel) as TextChannel;

  if (!channel?.permissionOverwrites) {
    return interaction.reply({ content: 'That channel type cannot be unlocked.', ephemeral: true });
  }

  await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, { SendMessages: null });
  await interaction.reply(`\u{1F513} ${channel} is now unlocked — @everyone can send messages again.`);
}
