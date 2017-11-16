/* eslint-env mocha */
const assert = require("assert");
const app = require("../../src/app");
const msTokenHandler = require("ms-token-handler");
const request = require("superagent");
const SUCCESS_CODE = 200;
const SERVER_ERROR_CODE = 500;
const keyBytes = 32
const mstokenKey = "0".repeat(keyBytes);
let msToken = {};

describe("Provider", ()=>{

  beforeEach(()=>{
    app.start();
    const data = {
      displayId: "213321",
      timestamp: 32131234,
      filePath: "bucket/file"
    };

    const msSignature = msTokenHandler.encryptAndHash(data, mstokenKey)

    msToken = {...data, msSignature};
  });

  afterEach(()=>{
    app.stop();
  });

  it("return success when verifying a valid ms token", (done)=>{

    request.post("http://localhost:8080/urlprovider")
      .send(msToken)
      .end((err, res) => {
        if (err) {
          assert(false);
        } else {
          assert.equal(res.status, SUCCESS_CODE);
        }
        done();
      });
  });

  it("return unsuccess when verifying an invalid ms token", (done)=>{

    msToken.msSignature = "wrong";

    request.post("http://localhost:8080/urlprovider")
      .send(msToken)
      .end((err, res) => {
        if (err) {
          assert.equal(res.status, SERVER_ERROR_CODE);
        } else {
          assert(false);
        }
        done();
      });
  });
});
