const server = require("./server.js");
const PORT = process.env.port || 3333;

const listener = server.listen(PORT, () =>
  console.log(`Listening on http://localhost:${listener.address().port}`)
);
