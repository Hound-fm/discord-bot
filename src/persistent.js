const level = require("level-party");
const DATABASE = __dirname + "/../data";

module.exports.storePersistentData = async (guild, key, value) => {
  const db = level(DATABASE, { valueEncoding: "json" });
  try {
    const keyName = `${guild}-${key}`;
    await db.put(keyName, value);
    db.close();
  } catch (error) {
    db.close();
  }
};

module.exports.loadPersistentData = async (guild, key) => {
  const db = level(DATABASE, { valueEncoding: "json" });
  try {
    const keyName = `${guild}-${key}`;
    const value = await db.get(keyName);
    db.close();
  } catch (error) {
    db.close();
  }
};


module.exports.getPrefixes = async (guild) => {
  const db = level(DATABASE, { valueEncoding: "json" });
  try {
    const keyName = `${guild}-prefixes`;
    const value = await db.get(keyName);
    return value;
    db.close();
  } catch (error) {
    db.close();
  }
};
