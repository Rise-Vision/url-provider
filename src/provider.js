const msTokenHandler = require("ms-token-handler");
const urlSigner = require("./url-signer.js");
const keyBytes = 32;
const keyEnv = process.env.MSTOKEN_KEY || "0".repeat(keyBytes);
const {CLIENT_ERROR, OK, AUTH_ERROR, SERVER_ERROR} = require("./status-codes.js");

const validateBody = (body) => {
  if (!body || !body.data.timestamp || !body.data.filePath || !body.data.displayId || !body.hash) {
    return Promise.reject({code: CLIENT_ERROR, msg: "Invalid input"});
  }

  return Promise.resolve(body);
};

const verifyMSToken = (body) => {
  return msTokenHandler.verify(body.data, body.hash, keyEnv)
    ? Promise.resolve(body)
    : Promise.reject({
      code: AUTH_ERROR,
      msg: `Invalid MS Token: ${JSON.stringify(body)}`
    });
}

const getSignedURL = (body) => {
  return Promise.resolve(urlSigner.sign(body));
}

const handleRequest = (req, res) => {
  console.log(`Request Received ${JSON.stringify(req.body)}`);
  validateBody(req.body)
  .then(verifyMSToken)
  .then(getSignedURL)
  .then(url=>res.status(OK).send(url))
  .catch(error=>{
    console.log("Error when providing an URL", error);
    res.status(error.code || SERVER_ERROR).send(error.msg);
  });
}

module.exports = {
  handleRequest
}
