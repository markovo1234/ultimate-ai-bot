import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { logModeration } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a member from the server')
  .addUserOption((o) => o.setName('target').setDescription('Member to ban').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason for the ban'))
  .addIntegerOption((o) =>
    o.setName('delete_days').setDescription('Days of message history to delete (0-7)').setMinValue(0).setMaxValue(7),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';
  const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
  if (member && !member.bannable) {
    return interaction.reply({ content: "I can't ban that member (role hierarchy or missing permissions).", ephemeral: true });
  }

  await interaction.guild!.members.ban(target.id, { deleteMessageSeconds: deleteDays * 86400, reason });
  await logModeration({ guildId: interaction.guildId!, target, moderatorId: interaction.user.id, action: 'BAN', reason });

  await interaction.reply(`\u{1F528} **${target.tag}** was banned. Reason: ${reason}`);
}
