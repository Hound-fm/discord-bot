const fetch = require("node-fetch");
const PROXY_URL = "https://api.lbry.tv/api/v1/proxy";
const STREAM_API = "https://cdn.lbryplayer.xyz/api/";
const STREAM_API_VERSION = 4;

module.exports.getStreamLink = ({ name, id }, download = false) => {
  const downloadQuery = download ? "?download=true" : "";
  return (
    STREAM_API +
    `v${STREAM_API_VERSION}/` +
    `streams/free/${name}/${id}/hound.fm` +
    downloadQuery
  );
};

module.exports.lbryProxy = async (method, params) => {
  const body = {
    method,
    params,
    id: Date.now(),
    jsonrpc: "2.0",
  };

  return fetch(PROXY_URL, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }).then(async (res) => {
    const data = await res.json();

    if (data.error || !data.result) {
      console.error(data);
      return;
    }
    if (method === "resolve") {
      const results = Object.values(data.result);
      return results;
    }
    if (method === "claim_search") {
      const results = data.result.items;
      return results;
    }
    return data;
  });
};
