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

app.get('/urlprovider', function(req, res) {
  res.send(`Url Provider: ${podname} ${pkg.version}`);
});

app.post('/urlprovider', jsonParser, provider.handleRequest);

const start = ()=>{
  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
  })
}

const stop = ()=>{
  server.close();
}

module.exports = {
  start,
  stop
}
