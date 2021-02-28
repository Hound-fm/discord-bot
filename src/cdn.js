const THUMBNAIL_CDN_URL = "https://image-optimizer.vanwanet.com/?address=";
const THUMBNAIL_HEIGHT = 128;
const THUMBNAIL_WIDTH = 128;
const THUMBNAIL_QUALITY = 50;

module.exports.getThumbnailCdnUrl = (props) => {
  const {
    thumbnail,
    width = THUMBNAIL_WIDTH,
    height = THUMBNAIL_HEIGHT,
    quality = THUMBNAIL_QUALITY,
  } = props;

  if (
    !THUMBNAIL_CDN_URL ||
    !thumbnail ||
    thumbnail.startsWith(THUMBNAIL_CDN_URL)
  ) {
    return thumbnail;
  }

  if (thumbnail) {
    return `${THUMBNAIL_CDN_URL}${thumbnail}&quality=${quality}&height=${height}&width=${width}`;
  }

  if (thumbnail && thumbnail.includes("https://spee.ch")) {
    return `${thumbnail}?quality=${quality}&height=${height}&width=${width}`;
  }

  return thumbnail;
};
