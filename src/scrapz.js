// Scrapz utils
const data = require("./data.json");
const memoize = require("memoizee");

const parseTitle = (title, publisher) => {
  // Default values
  let workTitle = title;
  let authorTitle = publisher;
  // Self published
  const matchPublisher = authorTitle.trim().toLowerCase();
  // parse title parts
  let [a, b] = title.split(" - ");
  // Format strings
  a = a ? a.trim() : a;
  b = b ? b.trim() : b;
  // Get author from title
  if (a && b) {
    const matchA = a.toLowerCase();
    const matchB = b.toLowerCase();
    if (matchA == matchPublisher) {
      authorTitle = a;
      workTitle = b;
    } else if (matchB == matchPublisher) {
      authorTitle = b;
      workTitle = a;
    } else {
      workTitle = !isNaN(a) ? b : [a, b].join(" - ");
    }
  }
  return { workTitle, authorTitle: authorTitle.split(" - ")[0] };
};

const GENRES_REGEX = (type) => {
  const genresGroup = data["genres"][type];
  if (genresGroup) {
    return new RegExp(`\\b(${genresGroup.join("|")})\\b`, "g");
  }
};
const genresPatterns = {
  music: GENRES_REGEX("music"),
  podcast: GENRES_REGEX("podcast"),
  audiobook: GENRES_REGEX("audiobook"),
};

const findGenres = (type, tags) => {
  const pattern = genresPatterns[type];
  if (pattern) {
    const matches = tags.join(" ").match(pattern);
    if (matches && matches.length) {
      return matches.slice(0, 3);
    }
  }
};

const findCategory = (title, tags, description) => {
  let categories = [];
  let titleKeywords;
  let tagsKeywords;
  let descriptionKeywords;
  let category;
  if (title && title.length >= 5) {
    titleKeywords = title
      .toLowerCase()
      .replace(/\b(song)(\b)/g, "music")
      .match(/music|podcast|audiobook/g);

    if (titleKeywords && titleKeywords.length) {
      categories = [...categories, ...titleKeywords];
    }
  }
  if (tags && tags.length) {
    tagsKeywords = tags
      .join(" ")
      .toLowerCase()
      .match(/music|podcast|audiobook/g);
    if (tagsKeywords && tagsKeywords.length) {
      categories = [...categories, ...tagsKeywords];
    }
  }
  if (description && description.length >= 5) {
    descriptionKeywords = description
      .toLowerCase()
      .match(/music|podcast|audiobook/g);
    if (descriptionKeywords && descriptionKeywords.length) {
      categories = [...categories, ...descriptionKeywords];
    }
  }

  const counts = {};

  categories.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });

  categories = Object.entries(counts);

  if (categories.length) {
    if (categories.length > 1) {
      category = categories.sort((a, b) => b[1] - a[1])[0][0];
    } else {
      category = categories[0][0];
    }
  }

  return category;
};

// Micro version of Scrapz in javascript
const Scrapz = (claim) =>
  new Promise((resolve, reject) => {
    // Quick filters
    if (
      !claim ||
      !claim.signing_channel ||
      claim.value_type !== "stream" ||
      !claim.value ||
      claim.value.stream_type !== "audio"
    ) {
      return resolve(null);
    }
    const stream = { genres: [] };
    const metadata = claim.value;
    const publisher = claim.signing_channel;
    const media = metadata.audio;

    // Mapp data to stream
    stream.id = claim.claim_id;
    stream.name = claim.name;
    stream.title = metadata.title;
    stream.license = metadata.license;
    stream.description = metadata.description;
    stream.fee = metadata.fee;

    // Explicit / NSFW filters
    const query = stream.title.toLowerCase();
    const explicit = query.search(/nsfw|mature|explicit/);
    if (explicit != -1) {
      return resolve(null);
    }

    // Map media
    if (media) {
      stream.audio_duration = media.duration;
    } else {
      // Only audio is supported
      return resolve(null);
    }

    // Map publisher data
    if (publisher) {
      stream.publisher_id = publisher.claim_id;
      stream.publisher_name = publisher.name;
      stream.publisher_title = publisher.value
        ? publisher.value.title
        : publisher.name;
    }

    // More filters
    if (
      !stream.publisher_title ||
      stream.publisher_title.trim() === "" ||
      !stream.audio_duration ||
      !stream.license ||
      stream.license.trim() === "" ||
      stream.license.toLowerCase().trim() === "none"
    ) {
      return resolve(null);
    }

    // Map thumbnail
    if (metadata.thumbnail) {
      stream.thumbnail_url = metadata.thumbnail.url;
    }
    // TODO: Fix typo on api
    stream.cannonical_url = claim.canonical_url.replace("lbry://", "");

    // Find categories
    if (metadata.tags && metadata.tags.length) {
      stream.stream_type = findCategory(
        stream.title,
        metadata.tags,
        stream.description
      );

      if (!stream.stream_type) {
        return resolve(null);
      }

      if (stream.stream_type === "music" || stream.stream_type === "podcast") {
        stream.genres = findGenres(stream.stream_type, metadata.tags);
      }
    }

    // Format titles
    const { workTitle, authorTitle } = parseTitle(
      stream.title,
      stream.publisher_title
    );
    stream.author = authorTitle;
    stream.title = workTitle;

    return resolve(stream);
  });

module.exports = memoize(Scrapz, {
  promise: true,
  maxAge: 25 * 1000,
  preFetch: true,
  max: 100,
});
