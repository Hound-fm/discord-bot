// Load config
require("dotenv").config();
// Constants
const EMBED = require("./embeds.js");
const { MESSAGE_STATUS } = require("./constants.js");
const Hound = require("./api.js");
const Chance = require("chance");
const Discord = require("discord.js");
const VoiceStream = require("./voiceStream.js");
const search = require("./search.js");
const { CommunityPool } = require("./communityPicks.js");

// Import utils
const { parseMessage, isBotMention, setMessageStatus } = require("./utils.js");

// Discord client
const client = new Discord.Client();

const chance_group = new Chance();
const chance_list = new Chance();

let prefix = "~";

const setActivity = (type, name) => {
  // Set the client user's activity
  client.user
    .setActivity(name, { type })
    .then((presence) =>
      console.log(`Activity set to ${presence.activities[0].name}`)
    )
    .catch(console.error);
};

client.on("ready", (message) => {
  setActivity("LISTENING", "@hound.fm");
});

client.on("message", async (message) => {
  if (isBotMention(client, message)) {
    message.channel.send({ embed: EMBED.ABOUT });
    return;
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const { arg, args, command } = parseMessage(message, prefix);

  if (command === "help") {
    message.channel.send({ embed: EMBED.COMMAND_LIST });
    setMessageStatus(message, MESSAGE_STATUS.READY);
  }

  if (command === "about") {
    message.channel.send({ embed: EMBED.ABOUT });
    setMessageStatus(message, MESSAGE_STATUS.READY);
  }

  if (command === "play") {
    const searchQuery = arg.trim();
    VoiceStream.play(message, searchQuery);
  }

  if (command === "pause") {
    VoiceStream.pause(message);
  }

  if (command === "resume") {
    VoiceStream.resume(message);
  }

  if (command === "skip") {
    VoiceStream.skip(message);
  }

  if (command === "stop" || command === "disconnect") {
    VoiceStream.stop(message);
  }

  if (command === "pick") {
    try {
      const results = await search(arg);
      if (results && results.length) {
        const stream = results[0];
        if (stream) {
          CommunityPool(message, stream);
          setMessageStatus(message, MESSAGE_STATUS.READY);
        } else {
          setMessageStatus(message, MESSAGE_STATUS.ERROR);
        }
      } else {
        setMessageStatus(message, MESSAGE_STATUS.ERROR);
      }
    } catch (error) {
      setMessageStatus(message, MESSAGE_STATUS.ERROR);
    }
  }

  if (command === "search") {
    try {
      const results = await search(arg);
      if (results && results.length) {
        const stream = results[0];
        if (stream) {
          message.channel.send({ embed: EMBED.STREAM(stream) });
          setMessageStatus(message, MESSAGE_STATUS.READY);
        } else {
          setMessageStatus(message, MESSAGE_STATUS.ERROR);
        }
      } else {
        setMessageStatus(message, MESSAGE_STATUS.ERROR);
      }
    } catch (error) {
      setMessageStatus(message, MESSAGE_STATUS.ERROR);
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
      const shuffled_1 = chance_list.shuffle(list);
      const stream = shuffled[0];
      console.info(chance_list.d10(), group);

      if (stream && stream.cannonical_url && stream.publisher_title) {
        message.channel.send({ embed: EMBED.STREAM(stream) });
        setMessageStatus(message, MESSAGE_STATUS.READY);
      } else {
        setMessageStatus(message, MESSAGE_STATUS.ERROR);
      }
    } else {
      setMessageStatus(message, MESSAGE_STATUS.ERROR);
    }
  }
});

const handleInteraction = async (interaction, output) => {
  await client.api
    .interactions(interaction.id, interaction.token)
    .callback.post({ data: { type: 5 } });
};

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
  // Comamnd name
  const command = action.name;
  const args = action.options;
  const arg = args ? args[0].value : null;
  // Aknowledge interaction
  await handleInteraction(interaction, command);

  if (command === "play") {
    const searchQuery = arg.trim();
    VoiceStream.play(message, searchQuery);
  }

  if (command === "pause") {
    VoiceStream.pause(message);
  }

  if (command === "resume") {
    VoiceStream.resume(message);
  }

  if (command === "skip") {
    VoiceStream.skip(message);
  }

  if (command === "stop" || command === "disconnect") {
    VoiceStream.stop(message);
  }
};

client.ws.on("INTERACTION_CREATE", async (interaction) => {
  const { data } = interaction;
  if (data.name === "player") {
    const command = data.options[0];
    if (command.name === "action") {
      const action = command.options[0];
      handlePlayerActions(interaction, action);
    }
  }
});

client.login(process.env.BOT_TOKEN);
