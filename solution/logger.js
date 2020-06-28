function logger(options) {
  return function (req, res, next) {
    const { method, url, body } = req;
    const type = req.get("Content-Type");

    console.log(`${method} ${url}`);
    if (type) {
      console.log(type);
    }
    // express.json middleware sets body to {} when there isn't one
    // this avoids logging the empty object for e.g. all GET requests
    if (body && Object.keys(body).length !== 0) {
      console.log(JSON.stringify(body, null, 2));
    }

    next();
  };
}

module.exports = logger;
