import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { prisma } from '@ultimate/database';

export const data = new SlashCommandBuilder()
  .setName('tag')
  .setDescription('Recall or manage custom text snippets')
  .addSubcommand((sc) =>
    sc.setName('get').setDescription('Show a tag').addStringOption((o) => o.setName('name').setDescription('Tag name').setRequired(true)),
  )
  .addSubcommand((sc) =>
    sc
      .setName('create')
      .setDescription('Create or update a tag (Manage Server permission required)')
      .addStringOption((o) => o.setName('name').setDescription('Tag name').setRequired(true))
      .addStringOption((o) => o.setName('content').setDescription('Tag content').setRequired(true)),
  )
  .addSubcommand((sc) =>
    sc
      .setName('delete')
      .setDescription('Delete a tag (Manage Server permission required)')
      .addStringOption((o) => o.setName('name').setDescription('Tag name').setRequired(true)),
  )
  .addSubcommand((sc) => sc.setName('list').setDescription('List all tags in this server'))
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;

  if (sub === 'get') {
    const name = interaction.options.getString('name', true).toLowerCase();
    const tag = await prisma.tag.findUnique({ where: { guildId_name: { guildId, name } } });
    if (!tag) return interaction.reply({ content: `No tag named \`${name}\`.`, ephemeral: true });
    return interaction.reply(tag.content);
  }

  if (sub === 'list') {
    const tags = await prisma.tag.findMany({ where: { guildId }, orderBy: { name: 'asc' } });
    if (tags.length === 0) return interaction.reply({ content: 'No tags yet.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setTitle('Tags')
      .setDescription(tags.map((t) => `\`${t.name}\``).join(', '))
      .setColor(0x3498db);
    return interaction.reply({ embeds: [embed] });
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: 'You need the Manage Server permission to do that.', ephemeral: true });
  }

  if (sub === 'create') {
    const name = interaction.options.getString('name', true).toLowerCase();
    const content = interaction.options.getString('content', true);

    const tag = await prisma.tag.upsert({
      where: { guildId_name: { guildId, name } },
      create: { guildId, name, content, createdBy: interaction.user.id },
      update: { content },
    });
    return interaction.reply(`✅ Tag \`${tag.name}\` saved.`);
  }

  if (sub === 'delete') {
    const name = interaction.options.getString('name', true).toLowerCase();
    const deleted = await prisma.tag.deleteMany({ where: { guildId, name } });
    return interaction.reply(deleted.count > 0 ? `\u{1F5D1}️ Tag \`${name}\` deleted.` : `No tag named \`${name}\`.`);
  }
}
