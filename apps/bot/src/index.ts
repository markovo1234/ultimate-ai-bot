import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import { join } from 'path';
import { readdirSync } from 'fs';
import { handleApplicationSubmit } from './lib/applicationSubmit';
import { handleAutoMod } from './lib/autoMod';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

// Command registry
export const commands = new Collection<string, any>();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
    return;
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'application_submit') {
      try {
        await handleApplicationSubmit(interaction);
      } catch (error) {
        console.error(error);
        if (!interaction.replied) {
          await interaction.reply({ content: 'There was an error submitting your application.', ephemeral: true });
        }
      }
    }
  }
});

client.on(Events.MessageCreate, (message) => {
  handleAutoMod(message).catch((error) => console.error('Auto-mod error:', error));
});

client.login(process.env.DISCORD_TOKEN);
