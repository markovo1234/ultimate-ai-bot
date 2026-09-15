import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

const RESPONSES = [
  'It is certain.',
  'Without a doubt.',
  'Yes, definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  "Don't count on it.",
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.',
];

export const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Ask the magic 8-ball a question')
  .addStringOption((o) => o.setName('question').setDescription('Your question').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString('question', true);
  const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
  await interaction.reply(`\u{1F3B1} **Q:** ${question}\n**A:** ${answer}`);
}
