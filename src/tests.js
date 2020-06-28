const test = require("tape");
const supertest = require("supertest");
const app = require("./server");

test("Returns 404 when there are no appointments", (t) => {
  const expectedResponse = { message: "No appointments found" };
  supertest(app)
    .get("/appointments")
    .expect(404, expectedResponse)
    .end(() => t.end());
});
