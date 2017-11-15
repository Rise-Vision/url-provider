const msTokenHandler = require("ms-token-handler");
const keyBytes = 32
const keyEnv = process.env.MSTOKEN_KEY || "0".repeat(keyBytes);

const verifyMSToken = (msToken) => {
  const msSignature = msToken.msSignature;
  Reflect.deleteProperty(msToken, "msSignature");
  return msTokenHandler.verify(msToken, msSignature, keyEnv);
}

const getURL = (msToken) => {
  return new Promise((resolve, reject)=>{
    if (verifyMSToken(msToken)) {
      return resolve();
    }
    return reject(new Error(`Invalid MS Token for file: ${msToken.filePath}`))
  });

}

const handleRequest = (req, res) => {
  console.log(`Request Received ${JSON.stringify(req.body)}`);
  const CLIENT_ERROR_CODE = 400;
  const SERVER_ERROR_CODE = 500;
  const SUCCESS_CODE = 200;

  const body = req.body;

  if (!body || !body.timestamp || !body.filePath || !body.displayId || !body.msSignature) {
    res.sendStatus(CLIENT_ERROR_CODE);
    res.json({error: "MS Token is invalid"});
  } else {
      getURL(body).then(()=>{
      res.sendStatus(SUCCESS_CODE);
    }).catch((error)=>{
      console.log("Error when providing an URL", error);
      res.sendStatus(SERVER_ERROR_CODE);
      res.json(JSON.stringify(error));
    });
  }
}

module.exports = {
  handleRequest
}
