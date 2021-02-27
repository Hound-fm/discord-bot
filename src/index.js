// Load config
require("dotenv").config();

// Constants
const EMBED = require("./embeds.js");

const Hound = require("./api.js");
const Chance = require("chance");
const Discord = require("discord.js");

// Import utils
const { odyseeLink, parseMessage, isBotMention } = require("./utils.js");

// Discord client
const client = new Discord.Client();

const chance_group = new Chance("78jkseed");
const chance_list = new Chance("92fhseed");

let prefix = "!";

client.on("message", async (message) => {
  if (isBotMention(client, message)) {
    message.channel.send({ embed: EMBED.ABOUT });
    return;
  }

  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const { args, command } = parseMessage(message, prefix);

  if (command === "help") {
    message.channel.send({ embed: EMBED.COMMAND_LIST });
  }

  if (command === "about") {
    message.channel.send({ embed: EMBED.ABOUT });
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
      const stream = chance_list.pickone(list);
      if (stream && stream.cannonical_url) {
        message.channel.send(odyseeLink(stream.cannonical_url));
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
