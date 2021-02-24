const NETWORK_ID = process.env.VUE_APP_NETWORK_ID || 31;
const HTTP_PROVIDER = process.env.VUE_APP_HTTP_PROVIDER || "http://18.218.165.234:4444";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mongodb";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "rlending";
const LIQUIDATOR_ADDRESS = process.env.LIQUIDATOR_ADDRESS || "0xef558B499B7fDeB387c3a3A42E2d414815c64fac";

module.exports = {
  NETWORK_ID,
  HTTP_PROVIDER,
  MONGO_URI,
  MONGO_DB_NAME,
  LIQUIDATOR_ADDRESS,
};
