# liquidation

To run this application, run `yarn start`

It's needed have a file in the dir, `./config/constants.js` and contains the following content:
```
const NETWORK_ID = process.env.VUE_APP_NETWORK_ID;
const HTTP_PROVIDER = process.env.VUE_APP_HTTP_PROVIDER;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
const INITIAL_BLOCK = process.env.INITIAL_BLOCK;
const CRBTC_SYMBOL = "cRBTC";
const PRIVATE_KEY_WALLET = process.env.PRIVATE_KEY_WALLET;
const COLLATERAL_TO_USE = process.env.COLLATERAL_TO_USE;
const LIQUIDATOR_ADDRESS = process.env.LIQUIDATOR_ADDRESS;

module.exports = {
  NETWORK_ID,
  HTTP_PROVIDER,
  MONGO_URI,
  MONGO_DB_NAME,
  INITIAL_BLOCK,
  CRBTC_SYMBOL,
  PRIVATE_KEY_WALLET,
  COLLATERAL_TO_USE,
  LIQUIDATOR_ADDRESS
};
```