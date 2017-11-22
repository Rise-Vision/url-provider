const msTokenHandler = require("ms-token-handler");
const redis = require("redis-promise");
const urlSigner = require("./url-signer.js");
const keyBytes = 32;
const keyEnv = process.env.MSTOKEN_KEY || "0".repeat(keyBytes);
const {CLIENT_ERROR, OK, AUTH_ERROR, SERVER_ERROR} = require("./status-codes.js");
const sixWeeksSecs = 60 * 60 * 24 * 7 * 6; // eslint-disable-line no-magic-numbers

module.exports = {
  handleRequest(req, res) {
    console.log(`Request Received ${JSON.stringify(req.body)}`);
    validateBody(req.body)
    .then(preventMSTokenReuse)
    .then(verifyMSTokenHash)
    .then(getSignedURL)
    .then(url=>res.status(OK).send(url[0]))
    .catch(error=>{
      console.log("Error when providing an URL", error);
      res.status(error.code || SERVER_ERROR).send(error.msg);
    });
  }
}

function validateBody(body) {
  if (!body || !body.data.timestamp || !body.data.filePath || !body.data.displayId || !body.hash) {
    return Promise.reject({code: CLIENT_ERROR, msg: "Invalid input"});
  }

  return Promise.resolve(body);
}

function preventMSTokenReuse(body) {
  return redis.peekKey(body.hash)
  .then(exists=>{
    if (exists) {return Promise.reject({
      code: AUTH_ERROR, msg: "Duplicate token"
    });}

    redis.touchKey(body.hash, {expirySeconds: sixWeeksSecs});
    return Promise.resolve(body);
  });
}

function verifyMSTokenHash(body) {
  return msTokenHandler.verify(body.data, body.hash, keyEnv)
    ? Promise.resolve(body)
    : Promise.reject({
      code: AUTH_ERROR,
      msg: `Invalid MS Token: ${JSON.stringify(body)}`
    });
}

function getSignedURL(body) {
  return urlSigner.sign(body);
}
