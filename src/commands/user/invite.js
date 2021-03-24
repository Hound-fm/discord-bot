// Bot Client
const client = require("@/bot.js");

const EMBED = require("@/lib/embeds.js");
const { MESSAGE_STATUS } = require("@/constants.js");

module.exports = {
  name: "invite",
  aliases: [],
  description: "Show invitation link",
  // Command task
  execute: async (message, args, arg) => {
    message.channel.send({ embed: EMBED.INVITATION });
    client.setMessageStatus(message, MESSAGE_STATUS.READY);
  },
};
