const VoiceStream = require("@/lib/voiceStream.js");

module.exports = {
  name: "stop",
  description: "Stop...",
  aliases: ["clear", "disconnect"],
  // Command task
  execute: (message, args, arg) => {
    VoiceStream.stop(message);
  },
};
