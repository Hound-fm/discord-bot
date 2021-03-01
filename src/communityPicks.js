const { COMMUNITY_POOL } = require("./embeds.js");

const emoji = "✨";

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

module.exports.CommunityPool = async (message) => {
  const pool = await message.channel.send({ embed: COMMUNITY_POOL });
  // Initial reaction
  pool.react(emoji);
  // Observe users reactions
  ObserveReactions(pool);
};
