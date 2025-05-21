const crypto = require("crypto");

function verifyPayfastSignature(data) {
  const keys = Object.keys(data)
    .filter(key => key !== "signature")
    .sort();

  const queryString = keys
    .map(key => `${key}=${data[key]}`)
    .join("&");

  const generatedSignature = crypto
    .createHash("md5")
    .update(queryString)
    .digest("hex");

  return generatedSignature === data.signature;
}

module.exports = verifyPayfastSignature;
