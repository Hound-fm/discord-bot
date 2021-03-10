const VoiceStream = require("@/lib/voiceStream");

module.exports = {
  name: "skip",
  description: "Skip...",
  aliases: ["next"],
  // Command task
  execute: (message, args, arg) => {
    VoiceStream.skip(message);
  },
};
