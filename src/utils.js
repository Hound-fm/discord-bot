const odyseeLink = (url) => "https://odysee.com/" + url.replace(/#/g, ":");

const parseMessage = (message, prefix) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  return { args, command };
};

const isBotMention = (client, message) =>
  message.mentions.users.get(client.user.id) != null;

module.exports = { odyseeLink, parseMessage, isBotMention };
