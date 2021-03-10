const VoiceStream = require("@/lib/voiceStream");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Add stream...",
  // Command task
  execute: async (message, args, arg) => {
    const searchQuery = arg.trim();
    await VoiceStream.play(message, searchQuery);
  },
};
