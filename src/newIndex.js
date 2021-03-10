// Load config
require("dotenv").config();
require("module-alias/register");
// Constants
const EMBED = require("@/lib/embeds.js");
const { DEFAULT_PREFIXES, MESSAGE_STATUS } = require("@/constants.js");

// Bot Client
const client = require("@/bot.js");

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
    // No registered command found
    if (!command) return;

    // Check permissisons
    if(command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return message.reply('You can not do this!');
      }
    }
    
    // Run registered command
    command.execute(message, args, arg);
  } catch (error) {}
});

client.login(process.env.BOT_TOKEN);
