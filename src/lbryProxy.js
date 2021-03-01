const fetch = require("node-fetch");
const PROXY_URL = "https://api.lbry.tv/api/v1/proxy";

module.exports.lbryProxy = async (method, params) => {
  const body = {
    method,
    params,
    jsonrpc: "2.0",
  };

  return fetch(PROXY_URL, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  }).then(async (res) => {
    const data = await res.json();
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
