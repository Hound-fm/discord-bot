const { parseURI } = require("@/lbry/lbryURI");

const webLink = (host, url) => {
  return encodeURI("https://" + host + "/" + url.replace(/(#)/g, ":"));
};

const getWebLinks = (canonicalURL, format = "url", label) => {
  const hosts = ["lbry.tv", "odysee.com"];
  if (format === "markdown") {
    return hosts.map(
      (host) => `[${label || host}](${webLink(host, canonicalURL)})`
    );
  }
  return hosts.map((host) => webLink(host, canonicalURL));
};

const getStreamLink = ({ name, id }) => {
  return encodeURI(`https://lbry.tv/$/download/${name}/${id}`);
};

const getPublisherCanonicalUrl = (name, id, host) => {
  return encodeURI((host ? `https://${host}/` : "") + name + ":" + id[0]);
};

const truncateText = (str = "", limit = 40, format = "text") => {
  let truncated = str.trim();
  // Remove markdown format
  if (format === "markdown") {
    truncated = truncated
      .replace(/_/g, "\\_")
      .replace(/-/g, "\\-")
      .replace(/~/g, "\\~");
  }

  if (str.length <= limit) {
    return truncated;
  }

  return truncated.substring(0, limit).trim() + "...";
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
  truncateText,
  formatTitle,
  formatGenres,
  durationShortFormat,
  getPublisherCanonicalUrl,
};
