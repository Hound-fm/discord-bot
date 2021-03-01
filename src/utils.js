const webLink = (host, url) => "https://" + host + "/" + url.replace(/#/g, ":");

const getWebLinks = (canonicalURL, format = "url") => {
  const hosts = ["lbry.tv", "odysee.com"];
  if (format === "markdown") {
    return hosts.map((host) => `[${host}](${webLink(host, canonicalURL)})`);
  }
  return hosts.map((host) => webLink(host, canonicalURL));
};

const getPublisherCanonicalUrl = (name, id, host) => {
  return (host ? `https://${host}/` : "") + name + ":" + id[0];
};

const parseMessage = (message, prefix) => {
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  // Single argument
  const arg = args.join(" ");
  // Return parsed message
  return { arg, args, command };
};

const isBotMention = (client, message) =>
  message.mentions.users.get(client.user.id) != null;

const truncateText = (str = "", limit = 40) => {
  return str.trim().substring(0, limit) + "...";
};

const formatGenres = (genres) => {
  if (!genres || !genres.length) {
    return "Uknown";
  }
  return genres
    .map((genre) => genre[0].toUpperCase() + genre.substr(1))
    .join(", ");
};

const { Duration } = require("luxon");

const durationShortFormat = (seconds = 0) => {
  const duration = Duration.fromObject({ seconds });

  const hours = duration.as("hours");
  if (hours >= 1) {
    const formated = hours.toFixed();
    return formated + " " + (formated === 1 ? "hr" : "hrs");
  }

  const minutes = duration.as("minutes");
  if (minutes >= 1) {
    const formated = minutes.toFixed();
    return formated + " " + (formated === 1 ? "min" : "mins");
  }
  const formated = seconds.toFixed();
  return formated + " " + (formated === 1 ? "sec" : "secs");
};

module.exports = {
  webLink,
  getWebLinks,
  parseMessage,
  isBotMention,
  truncateText,
  formatGenres,
  durationShortFormat,
  getPublisherCanonicalUrl,
};
