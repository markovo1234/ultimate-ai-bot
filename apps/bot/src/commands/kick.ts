import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { logModeration } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Kick a member from the server')
  .addUserOption((o) => o.setName('target').setDescription('Member to kick').setRequired(true))
  .addStringOption((o) => o.setName('reason').setDescription('Reason for the kick'))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);
  const reason = interaction.options.getString('reason') ?? 'No reason provided';

  const member = await interaction.guild!.members.fetch(target.id).catch(() => null);
  if (!member) {
    return interaction.reply({ content: 'That member is not in this server.', ephemeral: true });
  }
  if (!member.kickable) {
    return interaction.reply({ content: "I can't kick that member (role hierarchy or missing permissions).", ephemeral: true });
  }

  await member.kick(reason);
  await logModeration({ guildId: interaction.guildId!, target, moderatorId: interaction.user.id, action: 'KICK', reason });

  await interaction.reply(`\u{1F462} **${target.tag}** was kicked. Reason: ${reason}`);
}
