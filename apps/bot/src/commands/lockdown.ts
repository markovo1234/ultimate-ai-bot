import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('lockdown')
  .setDescription('Lock a channel so @everyone cannot send messages')
  .addChannelOption((o) => o.setName('channel').setDescription('Channel to lock (default: this channel)'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = (interaction.options.getChannel('channel') ?? interaction.channel) as TextChannel;

  if (!channel?.permissionOverwrites) {
    return interaction.reply({ content: 'That channel type cannot be locked.', ephemeral: true });
  }

  await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, { SendMessages: false });
  await interaction.reply(`\u{1F512} ${channel} is now locked — @everyone can no longer send messages.`);
}
