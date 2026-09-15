import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('meme').setDescription('Get a random meme');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const res = await fetch('https://meme-api.com/gimme');
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { title?: string; url?: string; postLink?: string; nsfw?: boolean };

    if (!data.url || data.nsfw) {
      return interaction.editReply('Could not find a safe meme right now, try again.');
    }

    const embed = new EmbedBuilder().setTitle(data.title ?? 'Meme').setImage(data.url).setColor(0x9b59b6);
    if (data.postLink) embed.setURL(data.postLink);

    await interaction.editReply({ embeds: [embed] });
  } catch (e) {
    console.error(e);
    await interaction.editReply('Could not fetch a meme right now, try again later.');
  }
}
