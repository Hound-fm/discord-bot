const Hound = require("@/lib/api.js");
const Chance = require("chance");
const chance_group = new Chance();
const chance_list = new Chance();
const shuffled = [];

/*
const action = (args) => {
    // Get genre
    let [genre] = args;
    if (genre) {
      genre = genre.replace(/-/g, " ");
    }
    // Randomize content group
    const group = chance_group.pickone(["latest", "popular"]);
    // Get streams list
    const list = await Hound.getStreams(genre, group);
    // Validate list
    if (list && list.length) {
      const shuffled = chance_list.shuffle(list);
      const stream = shuffled[0];
      console.info(stream)
      if (stream && stream.cannonical_url && stream.publisher_title) {
        // client.setMessageStatus(message, MESSAGE_STATUS.READY);
        client.inlineReply(message, { embed: EMBED.STREAM(stream) });
      } else {
        client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
      }
    } else {
      client.setMessageStatus(message, MESSAGE_STATUS.ERROR);
    }
}

*/

module.exports = {
  name: "random",
  aliases: ["shuffle"],
  description: "Get random stream",
  execute: () => {},
};
