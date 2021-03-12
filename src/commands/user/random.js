const client = require("@/bot.js");
const memoize = require("memoizee");
const Hound = require("@/lib/api.js");
const Chance = require("chance");
const Discord = require("discord.js");
const ErrorHandler = require("@/lib/errors");
const EMBED = require("@/lib/embeds.js");
const { MESSAGE_STATUS } = require("@/constants.js");

const chance = new Chance();
const cacheRandomIndex = new Map();

const getShuffledItems = memoize(
  async (category, genre) => {
    const items = await Hound.getStreams({ category, genre, size: 50 });
    return chance.shuffle(items);
  },
  {
    promise: true,
    maxAge: 60 * 60 * 1000,
    preFetch: true,
    max: 50,
  }
);

const getRandomStream = async (message, args, arg) => {
  // Get genre
  let stream;
  let [genre] = args;
  const indexKey = `index-${genre}`;

  if (genre) {
    genre = genre.replace(/-/g, " ");
  }

  // Get streams list
  const list = await getShuffledItems("music", genre);

  if (!list || !list.length) {
    client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
    return ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
  }

  const randomIndex = cacheRandomIndex.get(indexKey);

  if ((randomIndex || randomIndex === 0) && randomIndex < list.length) {
    stream = list[randomIndex];
    cacheRandomIndex.set(
      indexKey,
      randomIndex < list.length ? randomIndex + 1 : 0
    );
  } else {
    stream = list[0];
    cacheRandomIndex.set(indexKey, 1);
  }

  if (stream) {
    client.setMessageStatus(message, MESSAGE_STATUS.READY);
    client.inlineReply(message, { embed: EMBED.STREAM(stream) });
  }
};

module.exports = {
  name: "random",
  aliases: ["shuffle"],
  description: "Get random stream",
  execute: getRandomStream,
};
