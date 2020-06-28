const express = require("express");
const logger = require("./logger");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(logger());

app.get("/", (req, res) => {
  const appointments = db.get("appointments").value();
  if (!appointments || !appointments.length) {
    res.status(404).json({ message: "No appointments found" });
  } else {
    res.json(appointments);
  }
});

app.post("/appointments", (req, res) => {
  // Dialogflow sends ugly nested JSON so we have to grab what we need
  const parameters = req.body.queryResult.parameters;
  const newAppointment = {
    date_time: parameters["date-time"].date_time,
  };
  // save the new time in the db
  db.get("appointments").push(newAppointment).write();
  const fulfillmentMessages = req.body.queryResult.fulfillmentMessages;
  res.json({ fulfillmentMessages });
});

module.exports = app;
