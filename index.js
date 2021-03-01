const Mongo = require("./Mongo");
const Middleware = require("./middleware/middleware");
const Liquidator = require("./middleware/liquidator")


/*const middleware = new Middleware();
middleware.getAccountUnderwater();
*/

const liquidator = new Liquidator();
liquidator.liquidateAllAccounts()
