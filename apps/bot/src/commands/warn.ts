import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { prisma } from '@ultimate/database';
import { logModeration } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Log a warning against a member')
  .addUserOption((o) => o.setName('target').setDescription('Member to warn').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason for the warning').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);
  const reason = interaction.options.getString('reason', true);

  await logModeration({ guildId: interaction.guildId!, target, moderatorId: interaction.user.id, action: 'WARN', reason });

  const warningCount = await prisma.moderationLog.count({
    where: { guildId: interaction.guildId!, targetId: target.id, action: 'WARN' },
  });

  await interaction.reply(`⚠️ **${target.tag}** was warned (total warnings: ${warningCount}). Reason: ${reason}`);
}
