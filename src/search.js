const Fuse = require("fuse.js");
const Scrapz = require("./scrapz.js");
const ErrorHandler = require("./errors.js");
const fetch = require("node-fetch");
const memoize = require("memoizee");
const querystring = require("querystring");
const { MESSAGE_STATUS } = require("./constants.js");
const { lbryProxy } = require("./lbryProxy.js");
const { parseURI, buildURI } = require("./lbryURI.js");
const { PerformanceObserver, performance } = require("perf_hooks");
// Import utils
const {
  isHex,
  isClaimID,
  getClaimId,
  parseURL,
  setMessageStatus,
} = require("./utils.js");

const LIGHTHOUSE_API =
  "https://lighthouse.lbry.com/search?size=25&from=0&claimType=file&mediaType=audio&";

const defaultParams = { free_only: false, nsfw: false };

const lightHouseSearch = async (query, searchOptions = defaultParams) => {
  const params = { ...defaultParams, ...searchOptions };
  const url = encodeURI(
    LIGHTHOUSE_API + querystring.stringify(params) + `&s=${query}`
  );
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

const fuzzySearch = async (input, searchOptions) => {
  try {
    let results;
    // Query search
    const items = await lightHouseSearch(input, searchOptions);
    // ...
    if (items && items.length) {
      const urls = items.map((item) => item.name + "#" + item.claimId);
      results = await lbryProxy("resolve", { urls });
      if (results && results.length) {
        // Fuzzy sort for results
        const fuzzy = new Fuse(results, {
          includeScore: true,
          keys: [
            { name: "value.title" },
            { name: "signing_channel.value.title" },
          ],
        });
        results = fuzzy.search(input);
        results = await Promise.all(
          results.map(async (res) => {
            if (res.score < 0.62) {
              return res.item;
            }
          })
        );
        results = results.filter((item) => item != null);
      }
    }
    return results;
  } catch (error) {
    console.error(error);
  }
};

const search = memoize(
  async (textInput, searchOptions = defaultParams) =>
    new Promise(async (resolve, reject) => {
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
            return reject("Can't resolve channels");
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
            results = await fuzzySearch(uri.streamName, searchOptions);
          }
        } catch (error) {
          console.error(error);
          return reject(error);
        }
      } else {
        results = await fuzzySearch(input, searchOptions);
      }

      if (results && results.length) {
        results = await Promise.all(results.map(async (i) => Scrapz(i)));
        results = results.filter((item) => item && item.stream_type);
      }

      return resolve(results);
    }),
  {
    promise: true,
    maxAge: 15 * 1000,
    preFetch: true,
    max: 100,
  }
);

const searchBestResult = (message, searchQuery, searchOptions) =>
  new Promise(async (resolve, reject) => {
    try {
      if (!searchQuery || !searchQuery.length || searchQuery.length < 3) {
        ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
        return reject("error: search");
      }
      // Check peformance
      // const t0 = performance.now();
      let results = await search(searchQuery, searchOptions);
      // const t1 = performance.now();
      // console.log("Search time: " + (t1 - t0) / 1000 + " seconds");

      if (results && results.length) {
        setMessageStatus(message, MESSAGE_STATUS.READY);
        const metadata = results[0];
        return resolve(metadata);
      } else {
        ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
        return reject("error: search");
      }
    } catch (error) {
      console.error(error);
      ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_SEARCH);
      return reject("error: search");
    }
  });

module.exports = {
  searchBestResult,
};
