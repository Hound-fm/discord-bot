const Fuse = require("fuse.js");
const Scrapz = require("./scrapz.js");
const ErrorHandler = require("./errors.js");
const fetch = require("node-fetch");

const { MESSAGE_STATUS } = require("./constants.js");
const { lbryProxy } = require("./lbryProxy.js");
const { parseURI, buildURI } = require("./lbryURI.js");
// Import utils
const {
  isHex,
  isClaimID,
  getClaimId,
  parseURL,
  setMessageStatus,
} = require("./utils.js");

const LIGHTHOUSE_API =
  "https://lighthouse.lbry.com/search?size=25&from=0&claimType=file&mediaType=audio,&nsfw=false&s=";

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

const fuzzySearch = async (input) => {
  let results;
  // Query search
  const items = await lightHouseSearch(input);
  //
  if (items && items.length) {
    const urls = items.map((item) => item.name + "#" + item.claimId);
    results = await lbryProxy("resolve", { urls });

    if (results && results.length) {
      // Fuzzy sort for results
      const fuzzy = new Fuse(results, {
        includeScore: true,
        keys: ["value.title"],
      });
      results = fuzzy.search(input).map((res) => res.item);
    }
  }
  return results;
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
      } else if (
        uri.streamName &&
        (uri.streamClaimId || uri.channelClaimName)
      ) {
        // Exact resolve
        const resolveURI = buildURI({
          streamName: uri.streamName,
          streamClaimId: uri.streamClaimId,
          channelClaimId: uri.channelClaimId,
          channelClaimName: uri.channelClaimName,
        });

        results = await lbryProxy("resolve", { urls: [resolveURI] });
      } else {
        results = await fuzzySearch(uri.streamName);
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    results = await fuzzySearch(input);
  }

  if (results && results.length) {
    results = await Promise.all(results.map(async (i) => Scrapz(i)));
    results = results.filter((item) => item != null);
  }

  return results;
};

const searchBestResult = async (message, searchQuery) => {
  try {
    if (!searchQuery || !searchQuery.length || searchQuery.length < 3) {
      ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
      return;
    }

    const results = await search(searchQuery);

    if (results && results.length) {
      const metadata = results[0];
      setMessageStatus(message, MESSAGE_STATUS.READY);
      return metadata;
    } else {
      ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
      return;
    }
  } catch (error) {
    console.error(error);
    ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
    return;
  }
};

module.exports = { search, searchBestResult };
