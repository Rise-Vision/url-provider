const express = require("express");
const http = require("http");
const pkg = require("../package.json");
const bodyParser = require("body-parser");
const provider = require("./provider");
const jsonParser = bodyParser.json();
const defaultPort = 80;
const port = process.env.UP_PORT || defaultPort;
const app = express();
const server = http.createServer(app);
const podname = process.env.podname;
const redis = require("redis-promise");
const gkeHostname = "up-redis-master";
const redisHost = process.env.NODE_ENV === "test" ? "127.0.0.1" : gkeHostname;

app.get('/urlprovider', function(req, res) {
  res.send(`Url Provider: ${podname} ${pkg.version}`);
});

app.post('/urlprovider', jsonParser, provider.handleRequest);

const start = ()=>{
  return new Promise((res, rej)=>{
    server.listen(port, (err) => {
      if (err) {
        console.log('something bad happened', err);
        return rej(err);
      }

      console.log(`server is listening on ${port}`);

      redis.initdb(null, redisHost);
      res();
    });
  });
}

const stop = ()=>{
  redis.close();
  server.close();
}

module.exports = {
  start,
  stop
}
