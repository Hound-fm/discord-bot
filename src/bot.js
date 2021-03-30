const Discord = require("discord.js");

const client = new Discord.Client();

client.commands = new Discord.Collection();

client.setMessageStatus = (message, status) => {
  if (status && message && message.react) {
    message.react(status);
  }
};

client.isBotMention = (client, message) =>
  message.mentions.users.get(client.user.id) != null;

// Map message data for compatibility with message commands and slash commands:
client.mapInteractionMessage = async (interaction) => {
  const message = {};
  message.channel = await client.channels.fetch(interaction.channel_id);
  message.guild = await client.guilds.fetch(interaction.guild_id);
  message.member = await message.guild.members.fetch(
    interaction.member.user.id
  );
  message.client = client;
  message.isSlashCommand = true;
  return message;
};

// Commands from slash commands
client.parseInteraction = (interaction) => {
  command = {};
  // Parse interaction data
  const { data } = interaction;
  if (data.name === "player") {
    const slashCommand = data.options[0];
    if (slashCommand.name === "action") {
      const action = slashCommand.options[0];
      command.commandName = action.name;
      command.args = action.options;
      command.arg = command.args ? command.args[0].value : null;
    }
  }
  // Return parsed command
  return command;
};

// Commands from text message
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

client.resolveInteraction = async (interaction, replyData = undefined) =>
  await client.api
    .interactions(interaction.id, interaction.token)
    .callback.post({ data: { type: 5, data: replyData } });

module.exports = client;
