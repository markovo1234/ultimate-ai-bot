import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { prisma } from '@ultimate/database';

const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

function parseDuration(input: string): number | null {
  const match = input.trim().toLowerCase().match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return null;
  const amount = parseInt(match[1], 10);
  return amount * UNIT_MS[match[2]];
}

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Set a reminder')
  .addStringOption((o) => o.setName('in').setDescription('Duration, e.g. 10m, 2h, 1d').setRequired(true))
  .addStringOption((o) => o.setName('message').setDescription('What to remind you about').setRequired(true))
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const durationInput = interaction.options.getString('in', true);
  const message = interaction.options.getString('message', true);

  const ms = parseDuration(durationInput);
  if (!ms || ms <= 0) {
    return interaction.reply({ content: 'Give a duration like `10m`, `2h`, or `1d` (s/m/h/d units).', ephemeral: true });
  }
  if (ms > 30 * 24 * 60 * 60 * 1000) {
    return interaction.reply({ content: "That's too far out - max 30 days.", ephemeral: true });
  }

  const remindAt = new Date(Date.now() + ms);

  await prisma.reminder.create({
    data: {
      userId: interaction.user.id,
      guildId: interaction.guildId!,
      channelId: interaction.channelId,
      message,
      remindAt,
    },
  });

  await interaction.reply(`⏰ Got it — I'll remind you <t:${Math.floor(remindAt.getTime() / 1000)}:R>.`);
}
