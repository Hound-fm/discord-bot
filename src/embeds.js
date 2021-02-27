const COMMAND_LIST = {
  color: 3447003,
  title: "Command list",
  description: `
  **!help** - Show command list
  **!about** - Project description
  **!random | !shuffle** genre - Random song
  `
}

const ABOUT =  {
  color: 3447003,
  title: "Hound.fm",
  description: `
  A simple audio content aggregator for lbry.

  **Command list**
  Type \`!help\` to see a full list of commands.

  **Support**
  Help development with a small donation (LBC):
  \`\`\`bPMkcKtur8cuEDK2RH6QjTyyL7JpiqUmkK \`\`\`
  `
}

module.exports = {
  ABOUT,
  COMMAND_LIST,
}
