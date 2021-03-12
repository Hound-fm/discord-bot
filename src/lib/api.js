const fetch = require("node-fetch");
const HOUND_API = "https://api.hound.fm/";

const getStreams = async ({ category = "music", genre, group = "latest" }) => {
  const params = new URLSearchParams({ genre, group, pageSize: 100 });

  if (!genre) {
    params.delete("genre");
  }

  const res = await fetch(
    HOUND_API + `content/${category}?` + params.toString()
  );
  const data = await res.json();
  const list = data.data.streams;
  return list;
};

module.exports = {
  getStreams,
};
