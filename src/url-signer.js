const {Storage} = require("@google-cloud/storage");
const storage = new Storage();

const threeHoursMillis = 3 * 60 * 60 * 1000; // eslint-disable-line no-magic-numbers

module.exports = {
  sign(msToken) {
    const {filePath} = msToken.data;
    const [bucket, ...splitObject] = filePath.split("/");
    const options = {
      action: "read",
      expires: Date.now() + threeHoursMillis
    };

    return storage.bucket(bucket).file(splitObject.join("/"))
    .getSignedUrl(options);
  }
};
