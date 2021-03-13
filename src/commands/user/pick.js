// Bot Client
const emoji = "✨";
const client = require("@/bot.js");
const { COMMUNITY_POOL } = require("@/lib/embeds.js");
const { MESSAGE_STATUS } = require("@/constants.js");
const { searchBestResult } = require("@/lib/search.js");

const ObserveReactions = (message, opts = { max: 5, time: 60 * 1000 }) => {
  const filter = (reaction, user) => {
    return reaction.emoji.name === emoji;
  };
  message
    .awaitReactions(filter, { ...opts, errors: ["time"] })
    .then((collected) => console.log(collected.size))
    .catch((collected) => {
      console.log(`After a minute, only ${collected.size} out of 4 reacted.`);
    });
};

const CommunityPool = async (message, stream) => {
  const pool = await message.channel.send({
    embed: COMMUNITY_POOL(message.author.toString(), stream),
  });
  // Initial reaction
  pool.react(emoji);
  // Observe users reactions
  ObserveReactions(pool);
};

module.exports = {
  name: "pick",
  aliases: [],
  description: "Community picks..",
  // Command task
  execute: async (message, args, arg) => {
    const stream = await searchBestResult(message, arg);
    if (stream) {
      CommunityPool(message, stream);
    }
  },
};
