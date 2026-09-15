import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { logModeration } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription("Time out a member (mutes them for a duration)")
  .addUserOption((o) => o.setName('target').setDescription('Member to time out').setRequired(true))
  .addIntegerOption((o) =>
    o.setName('minutes').setDescription('Duration in minutes (max 40320 = 28 days)').setRequired(true).setMinValue(1).setMaxValue(40320),
  )
  .addStringOption((o) => o.setName('reason').setDescription('Reason for the timeout'))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);
  const minutes = interaction.options.getInteger('minutes', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
  if (!member) {
    return interaction.reply({ content: 'That member is not in this server.', ephemeral: true });
  }
  if (!member.moderatable) {
    return interaction.reply({ content: "I can't time out that member (role hierarchy or missing permissions).", ephemeral: true });
  }

  await member.timeout(minutes * 60 * 1000, reason);
  await logModeration({ guildId: interaction.guildId!, target, moderatorId: interaction.user.id, action: 'TIMEOUT', reason: `${reason} (${minutes}m)` });

  await interaction.reply(`\u{1F507} **${target.tag}** was timed out for ${minutes} minute(s). Reason: ${reason}`);
}
