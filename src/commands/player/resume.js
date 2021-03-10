const VoiceStream = require("@/lib/voiceStream");

module.exports = {
  name: "resume",
  description: "Resume...",
  // Command task
  execute: (message, args, arg) => {
    VoiceStream.resume(message);
  },
};
