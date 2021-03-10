const VoiceStream = require("@/lib/voiceStream");

module.exports = {
  name: "pause",
  description: "Pause stream.",
  // Command task
  execute: async (message, args, arg) => {
    await VoiceStream.pause(message);
  },
};
