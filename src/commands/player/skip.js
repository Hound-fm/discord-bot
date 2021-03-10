const VoiceStream = require("@/lib/voiceStream.js");

module.exports = {
  name: "skip",
  description: "Skip...",
  aliases: ["next"],
  // Command task
  execute: (message, args, arg) => {
    VoiceStream.skip(message);
  },
};
