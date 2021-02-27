const Chance = require("chance");

const chance = new Chance();

const odyseeLink = (url) => "https://odysee.com/" + url.replace(/#/g, ":");

const parseMessage = (message, prefix) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  return { args, command };
};

const isBotMention = (client, message) =>
  message.mentions.users.get(client.user.id) != null;

const getRandomItem = (list) => {
  let item = null;
  if (list && list.length > 1) {
    const index = chance.integer({ min: 0, max: list.length - 1 });
    item = list[index];
  } else if (list.length === 1) {
    item = list[0];
  }
  return item;
};

module.exports = { odyseeLink, parseMessage, getRandomItem, isBotMention };
