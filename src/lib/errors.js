const client = require("@/bot");
const { ERROR } = require("@/lib/embeds");
const { MESSAGE_STATUS } = require("@/constants");

const ERRORS = {
  EMPTY_QUEUE:
    "You can't use this command because the queue is empty.\n\n**Hint:** Try to add something to the queue first.\n```~play url, title or claim_id```",
  EMPTY_SEARCH: "No results where found this time.",
  VOICE_CHANNEL_PERMISSION:
    "I need the permissions to join and speak in your voice channel.",
  VOICE_CHANNEL_CONNECTION:
    "You need to join a voice channel before you can use this command.",
};

module.exports.ERRORS = ERRORS;

module.exports.sendError = (message, error) => {
  if (message) {
    client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
    if (!message.id) {
      message.channel.send({ embed: ERROR(error) });
      return;
    }
    client.inlineReply(message, { embed: ERROR(error) });
  }
};
