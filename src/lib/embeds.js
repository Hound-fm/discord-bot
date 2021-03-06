const remark = require("remark");
const strip = require("strip-markdown");
const { version } = require("@root/package.json");

const {
  getWebLinks,
  truncateText,
  formatTitle,
  formatGenres,
  durationShortFormat,
  getPublisherCanonicalUrl,
} = require("./utils.js");

const ERROR = (message) => ({
  color: 15158332,
  description: message,
});

const INVITATION_LINK =
  "https://discord.com/api/oauth2/authorize?client_id=749751882984980620&permissions=3230784&scope=bot%20applications.commands";

const INVITATION = {
  color: 3447003,
  title: `Invitation`,
  description: INVITATION_LINK,
};

const HELP = {
  color: 3447003,
  title: `Hound.fm - v${version}`,
  description: `
  A simple audio content aggregator for lbry.

  ** Links:** [Website](https://Hound.fm) • [Github](https://github.com/Hound-fm) • [Discord](https://discord.gg/Mbub3FfkZT)

  **Command list**
  Check the full list of [commands](https://github.com/Hound-fm/discord-bot#commands)

  **Invite**
  Add the bot to your server: [Invitation link](${INVITATION_LINK})

  **Support**
  Help development with a small donation (LBC):
  \`\`\`bPMkcKtur8cuEDK2RH6QjTyyL7JpiqUmkK \`\`\`
  `,
};

const formatDescription = (description) => {
  try {
    const str = remark().use(strip).processSync(description).toString();
    return truncateText(str, 100).replace(/\r?\n|\r/g, " ");
  } catch (error) {
    console.error(error);
  }
};

const STREAM_COLORS = {
  music: 3447003,
  podcast: 10181046,
  audiobook: 1752220,
  DEFAULT: 9807270,
};

const getPublisherMarkdownLink = (metadata) => {
  return `[${truncateText(
    metadata.publisher_title,
    25
  )}](${getPublisherCanonicalUrl(
    metadata.publisher_name,
    metadata.publisher_id
  )})`;
};

const QUEUE = (queue = []) => {
  const fields = [];
  // Inmutable array
  let queueItems = queue.slice(0, 11);
  const firstStream = queueItems.shift();
  // Now playing
  if (firstStream) {
    fields.push({
      name: "Now playing:",
      value:
        `[${truncateText(firstStream.metadata.title)}](${
          getWebLinks(firstStream.metadata.cannonical_url)[0]
        })` +
        " - " +
        getPublisherMarkdownLink(firstStream.metadata),
    });
  }

  if (queueItems && queueItems.length) {
    fields.push({
      name: "Next:",
      value: queueItems
        .map((item, index) => {
          const link = getWebLinks(
            item.metadata.cannonical_url,
            "markdown",
            index + 1
          )[0];
          return (
            `${link} -` + truncateText(item.metadata.title, 48, "markdown")
          );
        })
        .join("\n"),
    });
  }

  return {
    title: "Queue",
    color:
      STREAM_COLORS[firstStream.metadata.stream_type] || STREAM_COLORS.DEFAULT,
    fields,
  };
};

const STREAM_COMPACT = (
  embedTitle,
  {
    title,
    author,
    genres,
    description,
    thumbnail_url,
    cannonical_url,
    audio_duration,
    publisher_title,
    publisher_name,
    publisher_id,
    stream_type,
    license,
  }
) => {
  return {
    color: STREAM_COLORS[stream_type] || STREAM_COLORS.DEFAULT,
    title: embedTitle,
    thumbnail: { url: thumbnail_url || "" },
    fields: [
      {
        url: getWebLinks(cannonical_url)[0],
        name: title ? formatTitle(title) : "Uknown",
        value: `By [${publisher_title}](${getPublisherCanonicalUrl(
          publisher_name,
          publisher_id
        )})`,
      },
      {
        name: "Category",
        value: stream_type ? formatTitle(stream_type) : "Uknown",
        inline: true,
      },
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
    ],
  };
};

const STREAM = ({
  title,
  author,
  genres,
  description,
  thumbnail_url,
  cannonical_url,
  audio_duration,
  publisher_title,
  publisher_name,
  publisher_id,
  publisher_thumbnail_url,
  stream_type,
  license,
}) => {
  return {
    color: STREAM_COLORS[stream_type] || STREAM_COLORS.DEFAULT,
    title: title || "Uknown",
    description: formatDescription(description),
    author: {
      name: author || publisher_title || "Uknown",
      // icon_url: publisher_thumbnail_url || "",
      url: getPublisherCanonicalUrl(publisher_name, publisher_id),
    },
    thumbnail: { url: thumbnail_url },
    fields: [
      {
        name: "Category",
        value: stream_type ? formatTitle(stream_type) : "Uknown",
        inline: true,
      },
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
    footer: {
      text: "License: " + truncateText(license).replace(/\r?\n|\r/g, " "),
    },
  };
};

const test =
  "https://avatars.githubusercontent.com/u/75968706?s=400&u=82ad229b8f27975826369ce5944526245bc82d02&v=4";

const COMMUNITY_POOL = (user, stream) => ({
  color: STREAM_COLORS[stream.stream_type] || STREAM_COLORS.DEFAULT,
  title: ":sparkles: Community picks",
  thumbnail: { url: stream.thumbnail_url },
  description: `Awesome content handpicked by ${user}`,
  fields: [
    {
      name: stream.title,
      value: `By [${stream.publisher_title}](${getPublisherCanonicalUrl(
        stream.publisher_name,
        stream.publisher_id
      )})`,
    },
    {
      name: "Category",
      value: stream.stream_type ? formatTitle(stream.stream_type) : "Uknown",
      inline: true,
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
    },
    { name: "Reactions", value: "React to vote (+3 needed to approve )" },
  ],
});

module.exports = {
  HELP,
  ERROR,
  QUEUE,
  STREAM,
  INVITATION,
  STREAM_COMPACT,
  COMMUNITY_POOL,
};
