const {
  getWebLinks,
  truncateText,
  formatGenres,
  durationShortFormat,
  getPublisherCanonicalUrl,
} = require("./utils.js");

const COMMAND_LIST = {
  color: 3447003,
  title: "Command list",
  description: `
  **help** - Show command list
  **pick** <url> - Community picks
  **about** - Project description
  **random | shuffle** <genre> - Random song
  `,
};

const ABOUT = {
  color: 3447003,
  title: "Hound.fm",
  description: `
  A simple audio content aggregator for lbry.

  **Command list**
  Type \`!help\` to see a full list of commands.

  **Support**
  Help development with a small donation (LBC):
  \`\`\`bPMkcKtur8cuEDK2RH6QjTyyL7JpiqUmkK \`\`\`
  `,
};

const STREAM = ({
  title,
  genres,
  description,
  thumbnail_url,
  cannonical_url,
  audio_duration,
  publisher_title,
  publisher_name,
  publisher_id,
}) => {
  return {
    color: 3447003,
    title: title || "Uknown",
    description: truncateText(description),
    author: {
      name: publisher_title || "Uknown",
      url: getPublisherCanonicalUrl(publisher_name, publisher_id, "lbry.tv"),
    },
    thumbnail: { url: thumbnail_url },
    fields: [
      {
        name: "Duration",
        value: durationShortFormat(audio_duration),
        inline: true,
      },
      {
        name: "Genres",
        value: formatGenres(genres),
        inline: true,
      },
      {
        name: "Listen on",
        value: getWebLinks(cannonical_url, "markdown").join("\n"),
      },
    ],
  };
};

const test =
  "https://avatars.githubusercontent.com/u/75968706?s=400&u=82ad229b8f27975826369ce5944526245bc82d02&v=4";

const COMMUNITY_POOL = {
  color: 3447003,
  title: ":sparkles: Community picks",
  /*image: {
		url: test,
	}, */
  description: ` Awesome content handpicked by Music hive: `,
  fields: [
    { name: "Song title", value: "By [channelName](https://odysee.com)" },
    {
      name: "Listen On",
      value: "[Lbry.tv](https://lbry.tv) • [Odysee.com](https://odysee.com)",
      inline: true,
    },
    { name: "Reactions", value: "React to vote (+3 needed to approve )" },
  ],
};

module.exports = {
  ABOUT,
  STREAM,
  COMMAND_LIST,
  COMMUNITY_POOL,
};
