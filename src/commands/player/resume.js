const VoiceStream = require("@/lib/voiceStream.js");

module.exports = {
  name: "resume",
  description: "Resume...",
  // Command task
  execute: (message, args, arg) => {
    VoiceStream.resume(message);
  },
};
