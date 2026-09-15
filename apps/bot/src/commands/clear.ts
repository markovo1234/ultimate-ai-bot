import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Bulk delete recent messages in this channel')
  .addIntegerOption((o) =>
    o.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger('amount', true);
  const channel = interaction.channel as TextChannel;

  if (!channel?.bulkDelete) {
    return interaction.reply({ content: 'This command can only be used in a server text channel.', ephemeral: true });
  }

  const deleted = await channel.bulkDelete(amount, true);
  await interaction.reply({ content: `\u{1F9F9} Deleted ${deleted.size} message(s) (messages older than 14 days can't be bulk-deleted).`, ephemeral: true });
}
