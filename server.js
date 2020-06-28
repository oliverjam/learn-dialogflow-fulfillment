const express = require("express");
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const defaultValue = {
  appointments: [
    { customer: "oliver", datetime: "2020-06-29T05:00:00+01:00" },
    { customer: "sam", datetime: "2020-06-31T09:00:00+01:00" },
  ],
};
// lowdb will create our json file populated with the default value
const adapter = new FileSync(".data/db.json", { defaultValue });
const db = lowdb(adapter);

const app = express();

app.get("/appointments", (req, res) => {
  const appointments = db.get("appointments").value();
  if (!appointments) {
    res.status(404).json({ message: "No appointments found" });
  } else {
    res.json(appointments);
  }
});

module.exports = app;
