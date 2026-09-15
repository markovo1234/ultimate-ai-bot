import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ensureWallet } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Check a wallet balance')
  .addUserOption((o) => o.setName('target').setDescription('Member to check'))
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser('target') ?? interaction.user;
  const wallet = await ensureWallet(target.id, interaction.guildId!);
  await interaction.reply(`\u{1F4B0} **${target.tag}** has **${wallet.balance}** coins in hand and **${wallet.bank}** in the bank.`);
}
