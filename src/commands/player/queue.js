const VoiceStream = require("@/lib/voiceStream");

module.exports = {
  name: "queue",
  description: "Queue",
  // Command task
  execute: (message, args, arg) => {
    VoiceStream.getQueue(message, arg);
  },
};
