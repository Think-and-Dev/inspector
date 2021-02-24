const Mongo = require("../Mongo");
const Middleware = require("./middleware")
const { LIQUIDATOR_ADDRESS } = require("../config/constants");

class Liquidator {
  constructor() {
    this.mongoInstance = new Mongo();
    this.middlewareInstance = new Middleware();
    this.liquidatorAddress = LIQUIDATOR_ADDRESS;
  }

  async liquidateAllAccounts() {
    
  }
}

module.exports = Liquidator;
