const express = require("express");
const logger = require("./logger");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(logger());

app.get("/appointments", (req, res) => {
  const appointments = db.get("appointments").value();
  if (!appointments) {
    res.status(404).json({ message: "No appointments found" });
  } else {
    res.json(appointments);
  }
});

app.post("/appointments", (req, res) => {
  res.json({ message: "ok" });
});

module.exports = app;
