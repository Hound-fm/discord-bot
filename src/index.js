// Load config
require("dotenv").config();
require("module-alias/register");
// Constants
const EMBED = require("@/lib/embeds.js");
const { DEFAULT_PREFIXES, MESSAGE_STATUS } = require("@/constants.js");
const Hound = require("@/lib/api.js");
const Chance = require("chance");
const VoiceStream = require("@/lib/voiceStream.js");
const { searchBestResult } = require("@/lib/search.js");
// Bot Client
const client = require("@/bot.js");
// Import utils
const { parseMessage, isBotMention } = require("@/lib/utils.js");

const chance_group = new Chance();
const chance_list = new Chance();

// Handle player actions
const handleplayerCommands = async (message, { command, args, arg }) => {
  try {
    if (command === "play" || command === "p") {
      const searchQuery = arg.trim();
      await VoiceStream.play(message, searchQuery);
    }

    if (command === "pause") {
      VoiceStream.pause(message);
    }

    if (command === "resume") {
      VoiceStream.resume(message);
    }

    if (command === "skip" || command === "next") {
      VoiceStream.resume(message);
      VoiceStream.skip(message);
    }

    if (command === "queue") {
      VoiceStream.getQueue(message, arg);
    }

    if (
      command === "stop" ||
      (command === "clear") | (command === "disconnect")
    ) {
      VoiceStream.stop(message);
    }
  } catch (error) {
    handleErrors(error);
  }
};

const handleAdminCommands = (message, { command, args, arg }) => {
  try {
    if (command === "prefix" && args && args.length > 1) {
      if (args[0] === "add" && args[1] && args[1].length) {
        console.info("Add new prefix!");
        prefixes.push(args[1]);
      }
      if (args[0] === "remove" && args[1] && args[1].length) {
        const index = prefixes.indexOf(args[1]);
        if (index > -1) {
          prefixes.splice(index, 1);
        }
      }
    }
  } catch (error) {
    handleErrors(error);
  }
};

const handleUserCommands = async (message, { command, args, arg }) => {
  try {
    if (command === "help" || command === "about") {
      message.channel.send({ embed: EMBED.HELP });
      client.setMessageStatus(message, MESSAGE_STATUS.READY);
    }

    if (command === "pick") {
      const stream = await searchBestResult(message, arg);
      if (stream) {
        // CommunityPool(message, stream);
      }
    }

    if (command === "search") {
      const stream = await searchBestResult(message, arg);
      if (stream) {
        client.inlineReply(message, { embed: EMBED.STREAM(stream) });
      }
    }

    if (command === "random" || command === "shuffle") {
      // Get genre
      let [genre] = args;
      if (genre) {
        genre = genre.replace(/-/g, " ");
      }
      // Randomize content group
      const group = chance_group.pickone(["latest", "popular"]);
      // Get streams list
      const list = await Hound.getStreams(genre, group);
      // Validate list
      if (list && list.length) {
        const shuffled = chance_list.shuffle(list);
        const stream = shuffled[0];
        if (stream && stream.cannonical_url && stream.publisher_title) {
          client.setMessageStatus(message, MESSAGE_STATUS.READY);
          client.inlineReply(message, { embed: EMBED.STREAM(stream) });
        } else {
          client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
        }
      } else {
        client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
      }
    }
  } catch (error) {
    client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
  }
};

const handleErrors = (error) => {
  console.error(error);
};

client.on("message", async (message) => {
  // Ignore direct messages
  if (message.channel.type === "dm") {
    return;
  }

  // Listen for bot mention
  if (isBotMention(client, message)) {
    message.channel.send({ embed: EMBED.HELP });
    return;
  }

  const { arg, args, command, prefix } = parseMessage(
    message,
    DEFAULT_PREFIXES
  );

  // Ignore normal messages and other bots
  if (!prefix || !command || message.author.bot) return;

  // Player actions
  try {
    // Handle admin commands
    if (message.member.hasPermission("ADMINISTRATOR")) {
      handleAdminCommands(message, { command, args, arg });
    }
    // Handle community commands
    handleplayerCommands(message, { command, args, arg });
    handleUserCommands(message, { command, args, arg });
  } catch (error) {
    handleErrors(error);
  }
});

const handlePlayerActions = async (interaction, action) => {
  // Map message data:
  // Compatibility with message commands and slash commands:
  const message = {};
  message.channel = await client.channels.fetch(interaction.channel_id);
  message.guild = await client.guilds.fetch(interaction.guild_id);
  message.member = await message.guild.members.fetch(
    interaction.member.user.id
  );
  message.client = client;
  message.isSlashCommand = true;
  // Comamnd name
  const command = action.name;
  const args = action.options;
  const arg = args ? args[0].value : null;
  await client.replyInteraction(interaction);

  // Player actions
  handleplayerCommands(message, { command, arg });
};

client.ws.on("INTERACTION_CREATE", async (interaction) => {
  // Ignore direct messages (DM)
  if (!interaction.guild_id) {
    return;
  }
  try {
    const { data } = interaction;
    if (data.name === "player") {
      const command = data.options[0];
      if (command.name === "action") {
        const action = command.options[0];
        return handlePlayerActions(interaction, action);
      }
    }
  } catch (error) {
    handleErrors(error);
  }
});

client.login(process.env.BOT_TOKEN);
