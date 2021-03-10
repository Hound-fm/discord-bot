const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const client = new Discord.Client();

const COMMANDS_PATH = path.resolve(__dirname, "commands");

console.info(COMMANDS_PATH);

client.commands = new Discord.Collection();

client.loadCommands = () => {
  const commandFiles = fs
    .readdirSync(COMMANDS_PATH)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.resolve(COMMANDS_PATH, file));
    client.commands.set(command.name, command);
  }
};

// Inital commands loading
client.loadCommands();

client.setMessageStatus = (message, status) => {
  if (status && message && message.react) {
    message.react(status);
  }
};

client.inlineReply = (message, replyData) => {
  if (!message.isSlashCommand) {
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
  } else {
    message.channel.send(replyData);
  }
};

client.setActivity = (type, name) => {
  // Set the client user's activity
  client.user
    .setActivity(name, { type })
    .then((presence) =>
      console.log(`Activity set to ${presence.activities[0].name}`)
    )
    .catch(console.error);
};

// Resply for slash command interactions
client.replyInteraction = async (interaction, replyData = undefined) =>
  await client.api
    .interactions(interaction.id, interaction.token)
    .callback.post({ data: { type: 5, data: replyData } });

module.exports = client;
