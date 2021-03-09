const Mongo = require("../Mongo");
const Middleware = require("./middleware");

class Liquidator {
  constructor() {
    this.mongoInstance = new Mongo();
    this.middlewareInstance = new Middleware();
  }

  async liquidateAllAccounts() {
    try {
      this.mongoInstance.createConnection();
      const accounts = await this.mongoInstance.getAll();

      for (const i in accounts) {
        const account = accounts[i];

        const amountToLiquidate = await this.middlewareInstance.maxToLiquidate(
          account.address,
          account.borrowAmount,
          account.borrowMarket
        ).toString();

        this.middlewareInstance.liquidateBorrow(account.address, account.borrowMarket, amountToLiquidate)
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.mongoInstance.closeConnection();
    }
  }
}

module.exports = Liquidator;
