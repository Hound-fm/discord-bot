// Micro version of Scrapz in javascript
const Scrapz = (claim) => {
  if (!claim || !claim.signing_channel) {
    return;
  }
  const stream = { genres: [] };
  const metadata = claim.value;
  const publisher = claim.signing_channel;
  const media = metadata.audio || metadata.video;

  // Mapp data to stream
  stream.id = claim.claim_id;
  stream.name = claim.name;
  stream.title = metadata.title;
  stream.license = metadata.license;
  stream.description = metadata.description;
  // Map media
  if (media) {
    stream.audio_duration = media.duration;
  }
  // Map thumbnail
  if (metadata.thumbnail) {
    stream.thumbnail_url = metadata.thumbnail.url;
  }
  // TODO: Fix typo on api
  stream.cannonical_url = claim.canonical_url.replace("lbry://", "");

  // Map publisher data
  if (publisher) {
    stream.publisher_id = publisher.claim_id;
    stream.publisher_name = publisher.name;
    stream.publisher_title = publisher.value
      ? publisher.value.title
      : publisher.name;
  }

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

  return stream;
};

module.exports = Scrapz;
