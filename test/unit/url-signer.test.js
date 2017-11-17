/* eslint-env mocha */
const urlSigner = require("../../src/url-signer.js");
const assert = require("assert");

describe("URL Signer", ()=>{
  const token = {
    data: {
      filePath: "my-bucket/my-folder/my-file",
      timestamp: 12345,
      displayId: "12345"
    },
    hash: "12435"
  };

  it("signs a token", ()=>{
    return urlSigner.sign(token)
    .then(([url])=>{assert(url.includes("Signature=")); console.log(url)});
  });
});
