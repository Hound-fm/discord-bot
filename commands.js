const COMMANDS = {};

COMMANDS.PLAYER = {
  name: "player",
  description: "Play lbry audio streams on a voice channel.",
  options: [
    {
      name: "action",
      description: "Trigger actions to control the player.",
      type: 2,
      options: [
        {
          name: "play",
          description:
            "Add stream to queue. If there is no stream playing it will start playing.",
          type: 1,
          options: [
            {
              name: "stream",
              description:
                "A valid lbry `url`, claim `id` or `lbry.tv` and `odysee.com` urls are also supported.",
              type: 3,
              required: true,
            },
          ],
        },
        {
          name: "resume",
          description: "Resume paused stream.",
          type: 1,
        },
        {
          name: "pause",
          description: "Pause current stream.",
          type: 1,
        },
        {
          name: "skip",
          description: "Play next stream in queue.",
          type: 1,
        },
        {
          name: "stop",
          description: "Disconnect from voice channel and clear queue.",
          type: 1,
        },
      ],
    },
  ],
};

module.exports = COMMANDS;
