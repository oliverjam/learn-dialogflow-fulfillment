const lowdb = require("lowdb");
const Memory = require("lowdb/adapters/Memory");
const FileSync = require("lowdb/adapters/FileSync");

const adapter =
  process.env.NODE_ENV === "test"
    ? new Memory()
    : new FileSync(".data/db.json");

const db = lowdb(adapter);
db.defaults({ appointments: [] }).write();

module.exports = db;
