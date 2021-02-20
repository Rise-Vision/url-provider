/* eslint-env mocha */
const assert = require("assert");
const app = require("../../src/app");
const msTokenHandler = require("ms-token-handler");
const request = require("superagent");
const keyBytes = 32
const redis = require("redis-promise");
const mstokenKey = "0".repeat(keyBytes);
const {OK, AUTH_ERROR} = require("../../src/status-codes.js");
let msToken = {};

describe("Provider : Integration", ()=>{
  before(()=>{
    return app.start()
    .then(()=>redis.eraseEntireDb());
  });

  after(()=>{
    app.stop();
  });

  beforeEach(()=>{
    const data = {
      displayId: "213321",
      timestamp: 32131234,
      filePath: "bucket/file"
    };

    const hash = msTokenHandler.encryptAndHash(data, mstokenKey)

    msToken = {data, hash};
  });

  it("return success (with cors) when verifying a valid ms token", (done)=>{
    const origin = "something.risevision.com";

    request.post("http://localhost:8080/urlprovider")
    .set("origin", origin)
    .send(msToken)
    .end((err, res) => {
      if (err) {
        assert(false);
      } else {
        assert(res.text.includes("Signature="));
        assert.equal(res.headers["access-control-allow-origin"], origin);
        assert.equal(res.status, OK);
      }
      done();
    });
  });

  it("return unsuccess when verifying an invalid ms token", (done)=>{
    msToken.hash = "wrong";

    request.post("http://localhost:8080/urlprovider")
    .send(msToken)
    .end((err, res) => {
      if (err) {
        assert.equal(res.status, AUTH_ERROR);
      } else {
        assert(false);
      }
      done();
    });
  });

  it("return failure when reusing a token", ()=>{
    return redis.eraseEntireDb()
    .then(()=>{
      return new Promise((res, rej)=>{
        request.post("http://localhost:8080/urlprovider")
        .send(msToken)
        .end(err => {
          if (err) {return rej("Should have worked on the first token use");}
          res();
        });
      });
    })
    .then(()=>{
      return new Promise((res, rej)=>{
        request.post("http://localhost:8080/urlprovider")
        .send(msToken)
        .end(err => {
          if (!err) {return rej("Should not have worked on token reuse");}
          assert.equal(err.response.text, "Duplicate token");
          res();
        });
      });
    });
  });
});
