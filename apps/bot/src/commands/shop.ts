import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { prisma } from '@ultimate/database';
import { ensureWallet } from '../lib/ensure';

export const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription("Browse or manage this server's shop")
  .addSubcommand((sc) => sc.setName('view').setDescription('List items for sale'))
  .addSubcommand((sc) =>
    sc.setName('buy').setDescription('Buy an item').addStringOption((o) => o.setName('name').setDescription('Item name').setRequired(true)),
  )
  .addSubcommand((sc) =>
    sc
      .setName('add')
      .setDescription('Add an item to the shop (Manage Server permission required)')
      .addStringOption((o) => o.setName('name').setDescription('Item name').setRequired(true))
      .addIntegerOption((o) => o.setName('price').setDescription('Price in coins').setRequired(true).setMinValue(1))
      .addStringOption((o) => o.setName('description').setDescription('Item description')),
  )
  .setDMPermission(false);

export async function execute(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId!;

  if (sub === 'view') {
    const items = await prisma.shopItem.findMany({ where: { guildId }, orderBy: { price: 'asc' } });
    if (items.length === 0) return interaction.reply('This server has no shop items yet.');
    const embed = new EmbedBuilder()
      .setTitle('\u{1F6D2} Shop')
      .setDescription(items.map((i) => `**${i.name}** — ${i.price} coins${i.description ? `\n${i.description}` : ''}`).join('\n\n'))
      .setColor(0x2ecc71);
    return interaction.reply({ embeds: [embed] });
  }

  if (sub === 'add') {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: 'You need the Manage Server permission to do that.', ephemeral: true });
    }
    const name = interaction.options.getString('name', true);
    const price = interaction.options.getInteger('price', true);
    const description = interaction.options.getString('description') ?? undefined;

    const item = await prisma.shopItem.upsert({
      where: { guildId_name: { guildId, name } },
      create: { guildId, name, price, description },
      update: { price, description },
    });
    return interaction.reply(`✅ **${item.name}** is now in the shop for ${item.price} coins.`);
  }

  if (sub === 'buy') {
    const name = interaction.options.getString('name', true);
    const item = await prisma.shopItem.findUnique({ where: { guildId_name: { guildId, name } } });
    if (!item) return interaction.reply({ content: 'No item with that name.', ephemeral: true });

    await ensureWallet(interaction.user.id, guildId);

    try {
      await prisma.$transaction(async (tx) => {
        // Same conditional-UPDATE guard as /pay - avoids a stale-read race letting two
        // concurrent purchases both pass the balance check off the same pre-buy balance.
        const debited = await tx.wallet.updateMany({
          where: { userId: interaction.user.id, guildId, balance: { gte: item.price } },
          data: { balance: { decrement: item.price } },
        });
        if (debited.count === 0) {
          throw new Error('INSUFFICIENT_FUNDS');
        }
        await tx.inventoryItem.upsert({
          where: { userId_itemId: { userId: interaction.user.id, itemId: item.id } },
          create: { userId: interaction.user.id, guildId, itemId: item.id, quantity: 1 },
          update: { quantity: { increment: 1 } },
        });
      });
    } catch (e) {
      if (e instanceof Error && e.message === 'INSUFFICIENT_FUNDS') {
        return interaction.reply({ content: `You need ${item.price} coins.`, ephemeral: true });
      }
      throw e;
    }

    return interaction.reply(`\u{1F6CD}️ You bought **${item.name}** for ${item.price} coins.`);
  }
}
