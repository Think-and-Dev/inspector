const Mongo = require("./Mongo");
const Middleware = require("./middleware/middleware");
const Liquidator = require("./middleware/liquidator")


/*const middleware = new Middleware();
middleware.getAccountUnderwater();
*/

/*
const middleware = new Middleware();
middleware.getWalletAccountBalance("RIF");
*/


const liquidator = new Liquidator();
liquidator.liquidateAllAccounts()
