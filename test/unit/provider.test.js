/* eslint-env mocha */
/* eslint max-statements: ["error", 10, { "ignoreTopLevelFunctions": true }] */
const assert = require("assert");
const simple = require("simple-mock");
const provider = require("../../src/provider");
const msTokenHandler = require("ms-token-handler");
const keyBytes = 32
const mstokenKey = "0".repeat(keyBytes);
const {CLIENT_ERROR, OK, AUTH_ERROR} = require("../../src/status-codes.js");

describe("Provider", ()=>{
  let resPromise = null;
  let req = {};
  let res = {};
  let statusCode = null;

  beforeEach(()=>{
    const data = {
      displayId: "213321",
      timestamp: 32131234,
      filePath: "bucket/file"
    };

    const hash = msTokenHandler.encryptAndHash(data, mstokenKey)

    req = {
      body: {data, hash}
    };

    statusCode = null;

    resPromise = new Promise(resolve=>{
      res = {status(code) {statusCode = code; return {send: resolve}}};
    });
  });

  afterEach(()=>{
    simple.restore()
  });

  it("return success when verifying a valid token", ()=>{
    provider.handleRequest(req, res);

    return resPromise.then(signedUrl=>{
      assert(signedUrl.includes("Signature="));
      assert.equal(statusCode, OK);
    });
  });

  it("return unsuccess when verifying an invalid token", ()=>{
    req.body.hash = "wrong";
    provider.handleRequest(req, res);

    return resPromise.then(err=>{
      assert(err.includes("Invalid MS Token"));
      assert.equal(statusCode, AUTH_ERROR);
    });
  });


  it("return failure when it is missing displayId", ()=>{
    assert(Reflect.deleteProperty(req.body.data, "displayId"));

    provider.handleRequest(req, res);

    return resPromise.then(err=>{
      assert(err.includes("Invalid input"));
    });
  });

  it("return failure when it is missing timestamp", ()=>{
    assert(Reflect.deleteProperty(req.body.data, "timestamp"));

    provider.handleRequest(req, res);

    return resPromise.then(err=>{
      assert.equal(statusCode, CLIENT_ERROR)
      assert(err.includes("Invalid input"));
    });
  });

  it("return failure when it is missing filePath", ()=>{
    assert(Reflect.deleteProperty(req.body.data, "filePath"));

    provider.handleRequest(req, res);

    return resPromise.then(err=>{
      assert.equal(statusCode, CLIENT_ERROR)
      assert(err.includes("Invalid input"));
    });
  });

  it("return failure when it is missing body", ()=>{
    req = {};

    provider.handleRequest(req, res);

    return resPromise.then(err=>{
      assert.equal(statusCode, CLIENT_ERROR)
      assert(err.includes("Invalid input"));
    });
  });
});
