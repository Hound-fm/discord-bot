// Load config
require("dotenv").config();
require("module-alias/register");
require("@/loader");

// Bot Client
const client = require("@/bot");
// Constants
const EMBED = require("@/lib/embeds");
const { DEFAULT_PREFIXES, MESSAGE_STATUS } = require("@/constants");

const handleErrors = (error) => {
  console.error(error);
};

client.on("message", async (message) => {
  // Ignore direct messages
  if (message.channel.type === "dm") {
    return;
  }
  // Listen for bot mention
  if (client.isBotMention(client, message)) {
    message.channel.send({ embed: EMBED.HELP });
    return;
  }
  // Get command and args
  const { arg, args, commandName, prefix } = client.parseMessage(
    message,
    DEFAULT_PREFIXES
  );

  // Ignore normal messages and other bots
  if (!prefix || !commandName || message.author.bot) return;

  try {
    // Find registered command
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );
    // Ignore unregistered commands
    if (!command) return;
    // Check for permissisons
    if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return handleErrors("You can not do this!");
      }
    }
    // Run registered command
    await command.execute(message, args, arg);
  } catch (error) {
    handleErrors(error);
  }
});

// Slash commands
client.ws.on("INTERACTION_CREATE", async (interaction) => {
  // Ignore direct messages (DM)
  if (!interaction.guild_id) {
    return;
  }
  try {
    const { commandName, args, arg } = client.parseInteraction(interaction);
    const command = client.commands.get(commandName);
    // Ignore unregistered commands
    if (!command) return;
    // Create message from interaction
    const message = await client.mapInteractionMessage(interaction);
    // Check for permissisons
    if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return handleErrors("You can not do this!");
      }
    }
    // Reply interaction
    await client.replyInteraction(interaction);
    await command.execute(message, args, arg);
  } catch (error) {
    handleErrors(error);
  }
});

client.login(process.env.BOT_TOKEN);
