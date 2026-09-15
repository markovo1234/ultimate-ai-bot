import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';
import { ensureWallet } from '../lib/ensure';

const COOLDOWN_MS = 60 * 60 * 1000;
const JOBS = [
  'delivered packages across town',
  'debugged a production incident at 2am',
  'walked a very large dog',
  'wrote a Discord bot for a stranger',
  'sold lemonade outside the server',
];

export const data = new SlashCommandBuilder().setName('work').setDescription('Work a shift to earn coins').setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;
  const wallet = await ensureWallet(userId, guildId);

  if (wallet.lastWork) {
    const elapsed = Date.now() - wallet.lastWork.getTime();
    if (elapsed < COOLDOWN_MS) {
      const minutes = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
      return interaction.reply({ content: `⏳ You're still on shift. Try again in ${minutes}m.`, ephemeral: true });
    }
  }

  const earned = 50 + Math.floor(Math.random() * 150);
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];

  const updated = await prisma.wallet.update({
    where: { userId_guildId: { userId, guildId } },
    data: { balance: { increment: earned }, lastWork: new Date() },
  });

  await interaction.reply(`\u{1F4BC} You ${job} and earned **${earned}** coins! Balance: **${updated.balance}**.`);
}
