// Constants
const { searchBestResult } = require("@/lib/search.js");
const EMBED = require("@/lib/embeds.js");
const ErrorHandler = require("@/lib/errors.js");
const client = require("@/bot.js");
const { MESSAGE_STATUS } = require("@/constants.js");
// Import utils
const { getStreamLink } = require("@/lbry/lbryProxy.js");

const queue = new Map();

const getServerQueue = (message) => {
  return queue.get(message.guild.id);
};

const connect = (message, serverQueue) =>
  new Promise(async (resolve, reject) => {
    try {
      // Here we try to join the voicechat and save our connection into our object.
      serverQueue.connection = await serverQueue.voiceChannel.join();

      // Calling the play function to start a song
      if (
        serverQueue &&
        serverQueue.connection &&
        serverQueue.streams &&
        serverQueue.streams.length
      ) {
        play(message, serverQueue, serverQueue.streams[0]);
        resolve();
      } else {
        reject("No connection or streams");
      }
    } catch (error) {
      return reject(error);
    }
  });

const disconnect = (serverQueue) => {
  if (serverQueue && serverQueue.voiceChannel) {
    serverQueue.voiceChannel.leave();
    queue.delete(serverQueue.id);
  } else {
  }
};

function play(message, serverQueue, item) {
  if (!item) {
    disconnect(serverQueue);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(item.source)
    .on("start", () => {
      console.info("Now playing: ", item.metadata.title);
      client.inlineReply(message, {
        embed: EMBED.STREAM_COMPACT(
          "Now playing:",
          serverQueue.streams[0].metadata
        ),
      });
    })
    .on("finish", () => {
      serverQueue.streams.shift();
      play(message, serverQueue, serverQueue.streams[0]);
    })
    .on("error", (error) => {
      console.error(error);
    });
}

const createQueueContruct = (message, voiceChannel) => {
  const queueContruct = {
    id: message.guild.id,
    textChannel: message.channel,
    voiceChannel: voiceChannel,
    connection: null,
    streams: [],
    volume: 5,
    playing: false,
  };
  // Store on queue
  queue.set(queueContruct.id, queueContruct);
  // Self return
  return queue.get(queueContruct.id);
};

const voiceChannelAction = (message, action) => {
  let error = false;
  const serverQueue = getServerQueue(message);

  if (!message.member.voice.channel) {
    ErrorHandler.sendError(
      message,
      ErrorHandler.ERRORS.VOICE_CHANNEL_CONNECTION
    );
    return;
  } else if (
    !serverQueue ||
    !serverQueue.connection ||
    !serverQueue.connection.dispatcher ||
    !serverQueue.streams ||
    !serverQueue.streams.length
  ) {
    ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_QUEUE);
    return;
  }
  action(serverQueue);
};

module.exports.getServerQueue = getServerQueue;

module.exports.getQueue = (message, arg = "") => {
  const serverQueue = getServerQueue(message);
  if (
    !serverQueue ||
    !serverQueue.connection ||
    !serverQueue.streams ||
    !serverQueue.streams.length
  ) {
    ErrorHandler.sendError(message, ErrorHandler.ERRORS.EMPTY_QUEUE);
    return;
  }

  if (arg) {
    const item = arg.toLowerCase().trim();
    let index = item && item.length < 3 && parseInt(item);
    // Get current stream on queue
    if (item === "now" || index === 0) {
      return message.channel.send({
        embed: EMBED.STREAM_COMPACT(
          "Now playing:",
          serverQueue.streams[0].metadata
        ),
      });
    }
    // Get specific stream
    if (index && index >= 1 && index <= serverQueue.streams.length) {
      const embedTitle = index === 1 ? "Playing next:" : "On queue:";
      return message.channel.send({
        embed: EMBED.STREAM_COMPACT(
          embedTitle,
          serverQueue.streams[index].metadata
        ),
      });
    }
  }

  // Get queue
  message.channel.send({ embed: EMBED.QUEUE(serverQueue.streams) });
};

module.exports.pause = (message) => {
  const action = (serverQueue) => {
    serverQueue.connection.dispatcher.pause();
  };
  voiceChannelAction(message, action);
};

module.exports.resume = (message) => {
  const action = (serverQueue) => {
    serverQueue.connection.dispatcher.resume();
  };
  voiceChannelAction(message, action);
};

module.exports.skip = (message) => {
  const action = (serverQueue) => {
    serverQueue.connection.dispatcher.end();
  };
  voiceChannelAction(message, action);
};

module.exports.stop = (message) => {
  const action = (serverQueue) => {
    disconnect(serverQueue);
  };
  voiceChannelAction(message, action);
};

module.exports.play = (message, searchQuery) =>
  new Promise(async (resolve, reject) => {
    try {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        ErrorHandler.sendError(
          message,
          ErrorHandler.ERRORS.VOICE_CHANNEL_CONNECTION
        );
        return reject(ErrorHandler.ERRORS.VOICE_CHANNEL_CONNECTION);
      }
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        ErrorHandler.sendError(
          message,
          ErrorHandler.ERRORS.VOICE_CHANNEL_PERMISSION
        );
        return reject(ErrorHandler.ERRORS.VOICE_CHANNEL_PERMISSION);
      }

      let serverQueue = getServerQueue(message);

      if (!serverQueue) {
        serverQueue = createQueueContruct(message, voiceChannel);
      }

      if (serverQueue) {
        // Add stream to queue
        const metadata = await searchBestResult(message, searchQuery, {
          free_only: true,
        });
        if (metadata) {
          const source = getStreamLink(metadata);
          serverQueue.streams.push({ metadata, source });
        } else {
          // Nothing to add in queue
          return reject("Nothing to play or add to queue");
        }
      }

      // Join voice channel
      if (!serverQueue.connection) {
        await connect(message, serverQueue);
        client.setMessageStatus(message, MESSAGE_STATUS.READY);
      }

      return resolve();
    } catch (error) {
      return reject(error);
    }
  });
