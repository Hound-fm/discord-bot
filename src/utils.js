const webLink = (host, url) => "https://" + host + "/" + url.replace(/#/g, ":");
const { parseURI } = require("./lbryURI.js");

const getWebLinks = (canonicalURL, format = "url") => {
  const hosts = ["lbry.tv", "odysee.com"];
  if (format === "markdown") {
    return hosts.map((host) => `[${host}](${webLink(host, canonicalURL)})`);
  }
  return hosts.map((host) => webLink(host, canonicalURL));
};

const getStreamLink = ({ name, id }) => {
  return `https://lbry.tv/$/download/${name}/${id}`;
};

const getPublisherCanonicalUrl = (name, id, host) => {
  return (host ? `https://${host}/` : "") + name + ":" + id[0];
};

const parseMessage = (message = { content: "" }, prefixes) => {
  const parsed = { arg: null, args: null, command: null, prefix: null };
  // Format message
  const textInput = message.content.trim();
  // Find command prefix
  if (textInput && textInput.length) {
    parsed.prefix = prefixes.find((prefix) => prefix === textInput[0]);
  }
  if (textInput === "" || !parsed.prefix) {
    return parsed;
  }
  parsed.args = message.content.slice(parsed.prefix.length).trim().split(/ +/g);
  parsed.command = parsed.args.shift().toLowerCase();
  // Single argument
  parsed.arg = parsed.args.join(" ");
  // Return parsed message
  return parsed;
};

const isBotMention = (client, message) =>
  message.mentions.users.get(client.user.id) != null;

const truncateText = (str = "", limit = 40) => {
  return str.trim().substring(0, limit) + "...";
};

const formatTitle = (str = "") => {
  return str[0].toUpperCase() + str.substr(1);
};

const formatGenres = (genres) => {
  if (!genres || !genres.length) {
    return "Uknown";
  }
  return genres.map((genre) => formatTitle(genre)).join(", ");
};

const { Duration } = require("luxon");

const durationShortFormat = (seconds = 0) => {
  const duration = Duration.fromObject({ seconds });

  const hours = duration.as("hours");
  if (hours >= 1) {
    const formated = hours.toFixed(1).replace(/.0|.1/, "");
    return formated + " " + (formated === "1" ? "hr" : "hrs");
  }

  const minutes = duration.as("minutes");
  if (minutes >= 1) {
    let formated = minutes.toFixed(1).replace(/.0|.1/, "");
    return formated + " " + (formated === "1" ? "min" : "mins");
  }
  const formated = seconds.toFixed(1).replace(/.0|.1/, "");
  return formated + " " + (formated === "1" ? "sec" : "secs");
};

const setMessageStatus = (message, status) => {
  if (status && message && message.react) {
    message.react(status);
  }
};

const isHex = (str) => {
  const hex = /[0-9A-Fa-f]{6}/g;
  return hex.test(str);
};

const isClaimID = (str) => str.length === 40 && isHex(str);

const getClaimId = (uri) => {
  const id = uri.streamClaimId || uri.claimId;
  if (id && isClaimID(id)) {
    return id;
  }
  if (uri.path && isClaimID(uri.path)) {
    return uri.path;
  }
  return null;
};

// Web platforms
const parseURL = (url) => {
  if (url.startsWith("https://")) {
    const parsed = new URL(url);
    const hosts = ["https://odysee.com", "https://lbry.tv"];
    if (hosts.includes(parsed.origin)) {
      const canonicalURL = parsed.pathname.substring(1).replace(/:/g, "#");
      return parseURI(canonicalURL);
    }
  }
};

module.exports = {
  isHex,
  isClaimID,
  parseURL,
  getClaimId,
  webLink,
  getWebLinks,
  getStreamLink,
  parseMessage,
  isBotMention,
  truncateText,
  formatTitle,
  formatGenres,
  setMessageStatus,
  durationShortFormat,
  getPublisherCanonicalUrl,
};
