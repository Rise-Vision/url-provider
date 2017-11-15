/* eslint-env mocha */
/* eslint max-statements: ["error", 10, { "ignoreTopLevelFunctions": true }] */
const assert = require("assert");
const simple = require("simple-mock");
const provider = require("../../src/provider");
const msTokenHandler = require("ms-token-handler");
const keyBytes = 32
const mstokenKey = "0".repeat(keyBytes);
const CLIENT_ERROR_CODE = 400;
const SERVER_ERROR_CODE = 500;
const SUCCESS_CODE = 200;
let res = {};

describe("Provider", ()=>{
  let resPromise = null;
  let req = {};

  beforeEach(()=>{
    const data = {
      displayId: "213321",
      timestamp: 32131234,
      filePath: "bucket/file"
    };

    const msSignature = msTokenHandler.encryptAndHash(data, mstokenKey)

    req = {
      body: {...data, msSignature}
    };


    resPromise = new Promise(resolve=>{
      res = {sendStatus: resolve, json: () => {}};
    });
  });

  afterEach(()=>{
    simple.restore()
  });

  it("return success when verifying a valid token", ()=>{
    provider.handleRequest(req, res);

    return resPromise.then(code=>{
      assert.equal(code, SUCCESS_CODE)
    });
  });

  it("return unsuccess when verifying an invalid token", ()=>{
    req.body.msSignature = "wrong";
    provider.handleRequest(req, res);

    return resPromise.then(code=>{
      assert.equal(code, SERVER_ERROR_CODE)
    });
  });


  it("return failure when it is missing displayId", ()=>{
    assert(Reflect.deleteProperty(req.body, "displayId"));

    provider.handleRequest(req, res);

    return resPromise.then(code=>{
      assert.equal(code, CLIENT_ERROR_CODE)
    });
  });

  it("return failure when it is missing timestamp", ()=>{
    assert(Reflect.deleteProperty(req.body, "timestamp"));

    provider.handleRequest(req, res);

    return resPromise.then(code=>{
      assert.equal(code, CLIENT_ERROR_CODE)
    });
  });

  it("return failure when it is missing filePath", ()=>{
    assert(Reflect.deleteProperty(req.body, "filePath"));

    provider.handleRequest(req, res);

    return resPromise.then(code=>{
      assert.equal(code, CLIENT_ERROR_CODE)
    });
  });

  it("return failure when it is missing body", ()=>{
    req = {};

    provider.handleRequest(req, res);

    return resPromise.then(code=>{
      assert.equal(code, CLIENT_ERROR_CODE)
    });
  });
});
