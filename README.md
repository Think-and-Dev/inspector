# liquidation

**Liquidation** is a bot for liquidate all borrowers that are shortfall, to use in `rLending-protocol`.

Through this application, the potentials liquidators will'be enable to liquidate accounts automatically.

`yarn run populate`

`yarn run liquidate`

### - populate
This method search all borrow logs event in the blockchain, and save the borrowers in database

### - liquidate
Pull all borrows from database, calculate the max amount to liquidate, and liquidate them.

# How to (developers)
## Requirements:
---
- yarn ^v1.22
- node 12.x
- node database 4.4.x
- file configuration (constants.js)

`constants.js` file in the dir, `./config/constants.js` and contains the following configuration variables:
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
---
## Usage
---
1. Clone the repository to your localhost.
2. Open terminal into folder project.
3. Run `yarn install`
4. Run the desired command, `yarn run populate` or `yarn run liquidate`