const test = require("tape");
const supertest = require("supertest");
const app = require("./server");

test("Returns 404 when there are no appointments", (t) => {
  const expectedResponse = { message: "No appointments found" };
  supertest(app)
    .get("/appointments")
    .expect(404, expectedResponse)
    .catch(t.error)
    .finally(t.end);
});

const examplePost = {
  responseId: "898311fb-dc84-4a6d-8665-a386c3b124f5-e13762d2",
  queryResult: {
    queryText: "Book an appointment for 5 o clock monday",
    parameters: {
      "date-time": {
        date_time: "2020-06-29T05:00:00+01:00",
      },
    },
    allRequiredParamsPresent: true,
    fulfillmentText: "You are all set for 2020-06-29T05:00:00. See you then!",
    fulfillmentMessages: [
      {
        text: {
          text: ["You are all set for 2020-06-29T05:00:00. See you then!"],
        },
      },
    ],
    outputContexts: [
      {
        name:
          "projects/appointments-sdwfgt/agent/sessions/deafe3eb-75ae-3e03-503f-29d09ffbb54f/contexts/__system_counters__",
        parameters: {
          "no-input": 0.0,
          "no-match": 0.0,
          "date-time": {
            date_time: "2020-06-29T05:00:00+01:00",
          },
          "date-time.original": "5 o clock monday",
        },
      },
    ],
    intent: {
      name:
        "projects/appointments-sdwfgt/agent/intents/3595f4e6-7b52-4836-9b7e-6a58edf1ebcd",
      displayName: "Book appointment",
    },
    intentDetectionConfidence: 0.8548784,
    languageCode: "en",
  },
  originalDetectIntentRequest: {
    payload: {},
  },
  session:
    "projects/appointments-sdwfgt/agent/sessions/deafe3eb-75ae-3e03-503f-29d09ffbb54f",
};

test("Saves a new appointment", (t) => {
  const expectedResponse = {
    fulfillmentMessages: examplePost.queryResult.fulfillmentMessages,
  };
  supertest(app)
    .post("/appointments")
    .send(examplePost)
    .expect(200, expectedResponse)
    .catch(t.error)
    .finally(t.end);
});

// This test has to run afer the POST test
// Tape runs tests synchronously so this is fine
test("Returns newly created appointment", (t) => {
  const expectedResponse = [{ date_time: "2020-06-29T05:00:00+01:00" }];
  supertest(app)
    .get("/appointments")
    .expect(200, expectedResponse)
    .catch(t.error)
    .finally(t.end);
});
