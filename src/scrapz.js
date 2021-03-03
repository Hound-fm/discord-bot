// Micro version of Scrapz in javascript
const Scrapz = (claim) => {
  // Quick filters
  if (!claim || !claim.signing_channel) {
    return;
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

  // Map media
  if (media) {
    stream.audio_duration = media.duration;
  } else {
    // Invalid stream type ( only audio is supported )
    return;
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
    return;
  }

  // Map thumbnail
  if (metadata.thumbnail) {
    stream.thumbnail_url = metadata.thumbnail.url;
  }
  // TODO: Fix typo on api
  stream.cannonical_url = claim.canonical_url.replace("lbry://", "");

  // Find categories
  if (metadata.tags && metadata.tags.length) {
    const types = ["music", "podcast", "audiobook"];
    const categories = metadata.tags.filter((tag) => types.includes(tag));
    if (categories && categories.length) {
      stream.stream_type = categories[0];
    }
  }

  return stream;
};

module.exports = Scrapz;
