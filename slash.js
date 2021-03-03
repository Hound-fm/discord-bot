// Load config
require("dotenv").config();
// Fetch module
const fetch = require("node-fetch");
const COMMANDS = require("./commands.js");
const API_ENDPOINT = `https://discord.com/api/v8/applications/${process.env.APP_ID}/commands`;

async function clear(commandID) {
  const response = await fetch(API_ENDPOINT + "/" + commandID, {
    method: "delete",
    headers: {
      Authorization: "Bot " + process.env.BOT_TOKEN,
    },
  });
}

async function all(commandID) {
  const response = await fetch(API_ENDPOINT, {
    method: "get",
    headers: {
      Authorization: "Bot " + process.env.BOT_TOKEN,
    },
  });
  const json = await response.json();

  console.info(json);
}

async function main() {
  const response = await fetch(API_ENDPOINT, {
    method: "post",
    body: JSON.stringify(COMMANDS.PLAYER),
    headers: {
      Authorization: "Bot " + process.env.BOT_TOKEN,
      "Content-Type": "application/json",
    },
  });
  const json = await response.json();
  console.info(json);
}

// Register commands
main();
// all();
