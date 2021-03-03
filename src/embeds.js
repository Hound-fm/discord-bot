const remark = require("remark");
const strip = require("strip-markdown");

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

const ERROR = (message) => ({
  color: 15158332,
  description: message,
});

const ABOUT = {
  color: 3447003,
  title: "Hound.fm",
  description: `
  A simple audio content aggregator for lbry.

  **Command list**
  Type \`~help\` to see a full list of commands.

  **Support**
  Help development with a small donation (LBC):
  \`\`\`bPMkcKtur8cuEDK2RH6QjTyyL7JpiqUmkK \`\`\`
  `,
};

const formatDescription = (description) => {
  try {
    const str = remark().use(strip).processSync(description).toString();
    return truncateText(str);
  } catch (error) {
    console.info(error);
  }
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
    description: formatDescription(description),
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

const COMMUNITY_POOL = (user, stream) => ({
  color: 3447003,
  title: ":sparkles: Community picks",
  thumbnail: { url: stream.thumbnail_url },
  description: `Awesome content handpicked by ${user}`,
  fields: [
    {
      name: stream.title,
      value: `By [${stream.publisher_title}](${getPublisherCanonicalUrl(
        stream.publisher_name,
        stream.publisher_id,
        "lbry.tv"
      )})`,
    },
    {
      name: "Duration",
      value: durationShortFormat(stream.audio_duration),
      inline: true,
    },
    {
      name: "Genres",
      value: formatGenres(stream.genres),
      inline: true,
    },
    {
      name: "Listen On",
      value: getWebLinks(stream.cannonical_url, "markdown").join("\n"),
      inline: true,
    },
    { name: "Reactions", value: "React to vote (+3 needed to approve )" },
  ],
});

module.exports = {
  ABOUT,
  ERROR,
  STREAM,
  COMMAND_LIST,
  COMMUNITY_POOL,
};
