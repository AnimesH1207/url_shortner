const crypto = require("crypto");

const generateShortCode = () => {
  return crypto
    .randomBytes(6)
    .toString("base64url")
    .slice(0, 6);
};

module.exports = generateShortCode;