// Bot Client
const client = require("@/bot.js");

const EMBED = require("@/lib/embeds.js");
const { MESSAGE_STATUS } = require("@/constants.js");
const { searchBestResult } = require("@/lib/search.js");

module.exports = {
  name: "search",
  aliases: ["find", "get"],
  description: "Show info",
  // Command task
  execute: async (message, args, arg) => {
    const stream = await searchBestResult(message, arg);
    if (stream) {
      client.inlineReply(message, { embed: EMBED.STREAM(stream) });
    }
  },
};
