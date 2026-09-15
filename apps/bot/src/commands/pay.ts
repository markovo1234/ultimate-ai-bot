import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { ensureWallet } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('pay')
  .setDescription('Send coins to another member')
  .addUserOption((o) => o.setName('target').setDescription('Member to pay').setRequired(true))
  .addIntegerOption((o) => o.setName('amount').setDescription('Amount to send').setRequired(true).setMinValue(1))
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target', true);
  const amount = interaction.options.getInteger('amount', true);
  const guildId = interaction.guildId!;

  if (target.id === interaction.user.id) {
    return interaction.reply({ content: "You can't pay yourself.", ephemeral: true });
  }
  if (target.bot) {
    return interaction.reply({ content: "You can't pay a bot.", ephemeral: true });
  }

  await ensureWallet(interaction.user.id, guildId);
  await ensureWallet(target.id, guildId);

  try {
    await prisma.$transaction(async (tx) => {
      const sender = await tx.wallet.findUniqueOrThrow({ where: { userId_guildId: { userId: interaction.user.id, guildId } } });
      if (sender.balance < amount) {
        throw new Error('INSUFFICIENT_FUNDS');
      }
      await tx.wallet.update({
        where: { userId_guildId: { userId: interaction.user.id, guildId } },
        data: { balance: { decrement: amount } },
      });
      await tx.wallet.update({
        where: { userId_guildId: { userId: target.id, guildId } },
        data: { balance: { increment: amount } },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'INSUFFICIENT_FUNDS') {
      return interaction.reply({ content: "You don't have enough coins for that.", ephemeral: true });
    }
    throw e;
  }

  await interaction.reply(`\u{1F4B8} **${interaction.user.tag}** paid **${amount}** coins to **${target.tag}**.`);
}
