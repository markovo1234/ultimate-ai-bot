import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { logModeration } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('softban')
  .setDescription('Ban and immediately unban a member, to purge their recent messages without a permanent ban')
  .addUserOption((o) => o.setName('target').setDescription('Member to softban').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason for the softban'))
  .addIntegerOption((o) =>
    o.setName('delete_days').setDescription('Days of message history to delete (0-7, default 1)').setMinValue(0).setMaxValue(7),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const deleteDays = interaction.options.getInteger('delete_days') ?? 1;

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
  if (member && !member.bannable) {
    return interaction.reply({ content: "I can't softban that member (role hierarchy or missing permissions).", ephemeral: true });
  }

  await interaction.guild!.members.ban(target.id, { deleteMessageSeconds: deleteDays * 86400, reason: `Softban: ${reason}` });
  await interaction.guild!.members.unban(target.id, 'Softban - auto unban').catch(() => {});

  await logModeration({ guildId: interaction.guildId!, target, moderatorId: interaction.user.id, action: 'SOFTBAN', reason });

  await interaction.reply(`\u{1F9F9} **${target.tag}** was softbanned (messages purged, not permanently banned). Reason: ${reason}`);
}
