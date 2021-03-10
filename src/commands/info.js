// Bot Client
const client = require("@/bot.js");
const EMBED = require("@/lib/embeds.js");
const { MESSAGE_STATUS } = require("@/constants.js");

module.exports = {
  name: "info",
  aliases: ["help", "about"],
  description: "Show info",
  // Command task
  execute: (message, args, arg) => {
    message.channel.send({ embed: EMBED.HELP });
    client.setMessageStatus(message, MESSAGE_STATUS.READY);
  },
};
