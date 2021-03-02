const queue = new Map();

const connect = async (serverQueue) => {
  try {
    // Here we try to join the voicechat and save our connection into our object.
    var connection = await serverQueue.voiceChannel.join();
    // queueContruct.connection = connection;
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

function play(serverQueue, stream) {
  if (!stream) {
    serverQueue.voiceChannel.leave();
    queue.delete(serverQueue.id);
    return;
  }
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

module.exports.test = async function execute(message) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }

  let serverQueue = queue.get(message.guild.id);

  if (!serverQueue) {
    serverQueue = createQueueContruct(message, voiceChannel);
  }

  if (serverQueue) {
    // Add stream to queue
    // serverQueue.streams.push(song);
    // Join voice channel
    if (!serverQueue.connection) {
      connect(serverQueue);
    }
  }
};
