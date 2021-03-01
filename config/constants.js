const NETWORK_ID = process.env.VUE_APP_NETWORK_ID || 31;
const HTTP_PROVIDER = process.env.VUE_APP_HTTP_PROVIDER || "http://18.218.165.234:4444";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mongodb";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "rlending";
const INITIAL_BLOCK = process.env.INITIAL_BLOCK || 1504046;
const CRBTC_SYMBOL = "cRBTC";
const PRIVATE_KEY_WALLET = process.env.PRIVATE_KEY_WALLET || "9a86da47dcd90ad64da8a749a6d59b8832f882c2ff6f2e21b260676993141be2";
const COLLATERAL_TO_USE = process.env.COLLATERAL_TO_USE || "cRBTC";

module.exports = {
  NETWORK_ID,
  HTTP_PROVIDER,
  MONGO_URI,
  MONGO_DB_NAME,
  INITIAL_BLOCK,
  CRBTC_SYMBOL,
  PRIVATE_KEY_WALLET,
  COLLATERAL_TO_USE
};
