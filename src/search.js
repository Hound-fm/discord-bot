const fetch = require("node-fetch");
const { lbryProxy } = require("./lbryProxy.js");
const { parseURI, buildURI } = require("./lbryURI.js");

const scrapz = (source) => {};

//console.info(parseURI("lbry://#9191be934102d6870b3128aefc0e316d2e06f8cd"));

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
      const cannonicalUrl = parsed.pathname.substring(1).replace(/:/g, "#");
      return parseURI(cannonicalUrl);
    }
  }
};

// lbryProxy('claim_search', {claim_id: "9191be934102d6870b3128aefc0e316d2e06f8cd" })
// lbryProxy('resolve', { urls:  ['lbry://#9191be934102d6870b3128aefc0e316d2e06f8cd'] })

const LIGHTHOUSE_API =
  "https://lighthouse.lbry.com/search?size=3&from=0&claimType=file&mediaType=audio,&nsfw=false&s=";

const lightHouseSearch = async (query) => {
  const url = LIGHTHOUSE_API + query;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const formatSearchInput = (searchInput) => {
  let input = searchInput;
  // Format uri, cannonical_url, identifier
  if (input.startsWith("lbry:")) {
    input = input.replace("lbry://", "");
  }
  if (input.startsWith("<")) {
    input = input.substring(1);
  }
  if (input.endsWith(">")) {
    input = input.substring(input.length - 1, 0);
  }
  if (!input.startsWith("https:")) {
    input = input.replace(/:/g, "#");
  }
  return input;
};

const search = async (textInput) => {
  // Store results
  let results;
  // Format input
  let input = textInput.trim();
  // Identifier: claim_id, url, cannonical_url, web links, etc...
  const single = input.split(" ").length === 1;
  if (single) {
    input = formatSearchInput(textInput);
    try {
      const uri = input.startsWith("https://")
        ? parseURL(input)
        : parseURI(input);

      // Search for streams only
      if (uri.isChannel) {
        return;
      }

      const claimId = getClaimId(uri);
      // Sarch by claim_id
      if (claimId) {
        results = await lbryProxy("claim_search", { claim_id: claimId });
      } else if (uri.streamName) {
        // Exact resolve
        const {
          streamName,
          streamClaimId,
          channelClaimId,
          channelClaimName,
        } = uri;
        const resolveURI = buildURI({
          streamName,
          streamClaimId,
          channelClaimId,
          channelClaimName,
        });

        results = await lbryProxy("resolve", { urls: [resolveURI] });
      }
    } catch (error) {}
  } else {
    // Query search
    const items = await lightHouseSearch(input);
    //
    if (items && items.length) {
      const urls = items.map((item) => item.name + "#" + item.claimId);
      results = await lbryProxy("resolve", { urls });
    }
  }
  return results;
};

module.exports = search;
