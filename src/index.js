// Load config
require('dotenv').config()

const fetch = require('node-fetch');

const Discord = require("discord.js");
const client = new Discord.Client();

const EMBED = require('./embeds.js');

// Import utils
const {  odyseeLink, parseMessage, getRandomItem } = require("./utils.js");

// Set the prefix
let prefix = "!";

const HOUND_API = "https://api.hound.fm/"

client.on("message", async (message) => {
  // Exit and stop if the prefix is not there or if user is a bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const { args, command } =  parseMessage(message, prefix)

  if ( command === "help" ) {
    message.channel.send({embed: EMBED.COMMAND_LIST });
  }

  if (command === "about") {
    message.channel.send({embed: EMBED.ABOUT })
  }

  if (command === "random" || command === "shuffle") {
    let [genre] = args
    genre = genre.replace(/-/g, ' ')
    const params = !genre ? "" : "genre=" + genre
    const res = await fetch(HOUND_API + "content/music?group=latest&" + params)
    const data = await res.json()
    const list = data.data.streams
    const stream = getRandomItem(list)
    if (stream && stream.cannonical_url) {
       message.channel.send(odyseeLink(stream.cannonical_url))
    }
  }
});

client.login(process.env.BOT_TOKEN);
