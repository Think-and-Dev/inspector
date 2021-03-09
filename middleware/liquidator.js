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
      //const accounts = await this.mongoInstance.getAll();

      const accounts = [
        {
          address: "0xf6EFdAfeaF82A91245830096A5752a37C8d21ad1",
          shortfall: "7823542354417857729",
          borrowAmount: "15",
          borrowMarket: "crUSDT",
        },
      ];

      for (const i in accounts) {
        const account = accounts[i];
        //this.middlewareInstance.liquidateBorrow(account.address, account.borrowMarket, amountToLiquidate)

        console.log(
          await this.middlewareInstance.liquidateBorrow(
            account.address,
            account.borrowMarket,
            //"000000100000000000"
            await this.middlewareInstance.maxToLiquidate(
              account.address,
              account.borrowAmount,
              account.borrowMarket
            )
          )
        );
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.mongoInstance.closeConnection();
    }
  }
}

module.exports = Liquidator;
