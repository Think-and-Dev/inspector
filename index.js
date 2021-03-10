const Mongo = require("./Mongo");
const Middleware = require("./middleware/middleware");
const Liquidator = require("./middleware/liquidator");
const { BigNumber } = require("ethers");
const log4js = require("log4js");

const logger = log4js.getLogger();
logger.level = "info";

populate = function () {
  logger.info("execute populate() | getting all borrows in database");
  const middleware = new Middleware();
  middleware.getAccountUnderwater();
};

liquidate = function () {
  logger.info("execute liquidate() | liquidate all borrowers in shortfall from database");
  const liquidator = new Liquidator();
  liquidator.liquidateAllAccounts();
};

module.exports = {populate, liquidate};
