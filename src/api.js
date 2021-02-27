const fetch = require("node-fetch");
const HOUND_API = "https://api.hound.fm/";

const getStreams = async (genre, group) => {
  const params = !genre ? "" : "genre=" + genre;
  const res = await fetch(HOUND_API + `content/music?group=${group}&` + params);
  const data = await res.json();
  const list = data.data.streams;
  return list;
};

module.exports = {
  getStreams,
};
