const fs = require("fs");
const path = require("path");
const Discord = require("discord.js");
const client = new Discord.Client();

const COMMANDS_PATH = path.resolve(__dirname, "commands");

console.info(COMMANDS_PATH);

client.commands = new Discord.Collection();

client.reloadCommands = () => {
  const commandFolders = ["user", "admin", "player"];
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(COMMANDS_PATH + `/${folder}`)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(COMMANDS_PATH + `/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }
};

// Inital commands loading
client.reloadCommands();

client.setMessageStatus = (message, status) => {
  if (status && message && message.react) {
    message.react(status);
  }
};

client.isBotMention = (client, message) =>
  message.mentions.users.get(client.user.id) != null;

client.parseMessage = (message = { content: "" }, prefixes) => {
  const parsed = { arg: null, args: null, commandName: null, prefix: null };
  // Format message
  const textInput = message.content.trim();

  // Find command prefix
  if (textInput && textInput.length) {
    parsed.prefix = prefixes.find((prefix) => prefix === textInput[0]);
  }
  if (textInput === "" || !parsed.prefix) {
    return parsed;
  }
  parsed.args = message.content.slice(parsed.prefix.length).trim().split(/ +/g);
  parsed.commandName = parsed.args.shift().toLowerCase();
  // Single argument
  parsed.arg = parsed.args.join(" ");
  // Return parsed message
  return parsed;
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
