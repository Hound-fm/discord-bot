const Discord = require("discord.js");
const client = new Discord.Client();

module.exports.inlineReply = (message, replyData) => {
  client.api.channels[message.channel.id].messages.post({
    data: {
      ...replyData,
      message_reference: {
        message_id: message.id,
        guild_id: message.guild.id,
        channel_id: message.channel.id,
      },
    },
  });
};

module.exports.setActivity = (type, name) => {
  // Set the client user's activity
  client.user
    .setActivity(name, { type })
    .then((presence) =>
      console.log(`Activity set to ${presence.activities[0].name}`)
    )
    .catch(console.error);
};

// Resply for slash command interactions
module.exports.replyInteraction = async (interaction, replyData = undefined) =>
  await client.api
    .interactions(interaction.id, interaction.token)
    .callback.post({ data: { type: 5, data: replyData } });

module.exports.client = client;
