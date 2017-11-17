module.exports = {
  sign(msToken) {
    const signedURL = `${JSON.stringify(msToken)}Signature=12345`;
    return signedURL;
  }
};
