const fs = require("fs");
const path = require("path");
const client = require("@/bot.js");
const COMMANDS_PATH = path.resolve(__dirname, "commands");

// Load commands
const loadCommands = () => {
  const commandFolders = ["user", "player"];
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(COMMANDS_PATH + `/${folder}`)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(COMMANDS_PATH + `/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }
};

loadCommands();
