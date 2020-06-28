const lowdb = require("lowdb");
const Memory = require("lowdb/adapters/Memory");
const FileSync = require("lowdb/adapters/FileSync");

const defaultValue = {
  appointments: [
    { customer: "oliver", datetime: "2020-06-29T05:00:00+01:00" },
    { customer: "sam", datetime: "2020-06-31T09:00:00+01:00" },
  ],
};
// lowdb will create our json file populated with the default value
const adapter =
  process.env.NODE_ENV === "test"
    ? new Memory()
    : new FileSync(".data/db.json", { defaultValue });

const db = lowdb(adapter);

module.exports = db;
