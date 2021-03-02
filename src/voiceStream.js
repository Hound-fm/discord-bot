// Constants
const search = require("./search.js");
const EMBED = require("./embeds.js");
const { MESSAGE_STATUS } = require("./constants.js");
// Import utils
const { getStreamLink, setMessageStatus } = require("./utils.js");

const queue = new Map();

const connect = async (serverQueue) => {
  try {
    // Here we try to join the voicechat and save our connection into our object.
    serverQueue.connection = await serverQueue.voiceChannel.join();

    // Calling the play function to start a song
    if (serverQueue) {
      play(serverQueue, serverQueue.streams[0]);
    }
  } catch (err) {
    // Printing the error message if the bot fails to join the voicechat
    console.log(err);
    return serverQueue.textChannel.send(err);
  }
};

const getServerQueue = (message) => queue.get(message.guild.id);

const disconnect = (serverQueue) => {
  if (serverQueue && serverQueue.voiceChannel) {
    serverQueue.voiceChannel.leave();
    queue.delete(serverQueue.id);
  }
};

function play(serverQueue, item) {
  if (!item) {
    disconnect(serverQueue);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(item.source)
    .on("finish", () => {
      serverQueue.streams.shift();
      play(serverQueue, serverQueue.streams[0]);
    })
    .on("error", (error) => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${item.metadata.title}**`);
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
    message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
    error = true;
  } else if (!serverQueue || !serverQueue.connection) {
    // message.channel.send("There is no song that I could skip!");
    error = true;
  }

  if (error) {
    setMessageStatus(message, MESSAGE_STATUS.ERROR);
    return;
  }

  action(serverQueue);
};

module.exports.getServerQueue = getServerQueue;

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

module.exports.play = async (message, searchQuery) => {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    setMessageStatus(message, MESSAGE_STATUS.ERROR);
    message.channel.send("You need to be in a voice channel to play music!");
    return;
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    setMessageStatus(message, MESSAGE_STATUS.ERROR);
    message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
    return;
  }

  let serverQueue = getServerQueue(message);

  if (!serverQueue) {
    serverQueue = createQueueContruct(message, voiceChannel);
  }

  if (serverQueue) {
    // Add stream to queue
    try {
      const results = await search(searchQuery);
      if (results && results.length) {
        const stream = results[0];
        if (stream) {
          const metadata = stream;
          const source = getStreamLink(stream);
          message.channel.send({ embed: EMBED.STREAM(stream) });
          serverQueue.streams.push({ metadata, source });
        } else {
          setMessageStatus(message, MESSAGE_STATUS.ERROR);
        }
      } else {
        setMessageStatus(message, MESSAGE_STATUS.ERROR);
      }
    } catch (error) {
      setMessageStatus(message, MESSAGE_STATUS.ERROR);
    }
    // serverQueue.streams.push(song);
    // Join voice channel
    if (!serverQueue.connection) {
      await connect(serverQueue);
      setMessageStatus(message, MESSAGE_STATUS.READY);
    } else {
      // Item was added to queue
      setMessageStatus(message, MESSAGE_STATUS.READY);
    }
  }
};
