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
  await ensureWallet(userId, guildId);

  const earned = 50 + Math.floor(Math.random() * 150);
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];

  // Conditional UPDATE, same reasoning as /daily - closes the double-claim race.
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  const claimed = await prisma.wallet.updateMany({
    where: { userId, guildId, OR: [{ lastWork: null }, { lastWork: { lt: cutoff } }] },
    data: { balance: { increment: earned }, lastWork: new Date() },
  });

  if (claimed.count === 0) {
    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId_guildId: { userId, guildId } } });
    const elapsed = wallet.lastWork ? Date.now() - wallet.lastWork.getTime() : COOLDOWN_MS;
    const minutes = Math.ceil(Math.max(COOLDOWN_MS - elapsed, 0) / 60000);
    return interaction.reply({ content: `⏳ You're still on shift. Try again in ${minutes}m.`, ephemeral: true });
  }

  const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId_guildId: { userId, guildId } } });
  await interaction.reply(`\u{1F4BC} You ${job} and earned **${earned}** coins! Balance: **${wallet.balance}**.`);
}
