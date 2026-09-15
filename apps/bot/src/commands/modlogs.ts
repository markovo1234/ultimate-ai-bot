import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { prisma } from '@ultimate/database';

export const data = new SlashCommandBuilder()
  .setName('modlogs')
  .setDescription("View a member's moderation history in this server")
  .addUserOption((o) => o.setName('target').setDescription('Member to look up').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);

  const logs = await prisma.moderationLog.findMany({
    where: { guildId: interaction.guildId!, targetId: target.id },
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  if (logs.length === 0) {
    return interaction.reply({ content: `**${target.tag}** has no moderation history in this server.`, ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle(`Moderation history: ${target.tag}`)
    .setDescription(
      logs
        .map(
          (l) =>
            `**${l.action}** — <t:${Math.floor(l.createdAt.getTime() / 1000)}:R>${l.reason ? ` — ${l.reason}` : ''} (by <@${l.moderatorId}>)`,
        )
        .join('\n'),
    )
    .setColor(0xe67e22);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
