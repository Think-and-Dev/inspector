const Mongo = require("../Mongo");
const Middleware = require("./middleware");
const BigNumber = require("bignumber.js");
const log4js = require("log4js");
const { ethers } = require("ethers");

BigNumber.set({ EXPONENTIAL_AT: [-18, 36] });

class Liquidator {
  constructor() {
    this.mongoInstance = new Mongo();
    this.middlewareInstance = new Middleware();
    this.logger = log4js.getLogger();
    this.logger.level = "info";
  }

  async liquidateAllAccounts() {
    try {
      this.mongoInstance.createConnection();
      const accounts = await this.mongoInstance.getAll();

      for (const i in accounts) {
        const account = accounts[i];
        var amountToLiquidate = "0";
        try {
          amountToLiquidate = await this.middlewareInstance.maxToLiquidate(
            account.address,
            account.borrowMarket
          );

          if (new BigNumber(amountToLiquidate).isGreaterThan("0")) {
            const parsedAmountToLiquidate = ethers.utils
              .parseEther(amountToLiquidate)
              .toString();

            this.logger.info(
              "Liquidating account: " +
                account.address +
                " with an borrow amount: " +
                parsedAmountToLiquidate
            );
            this.logger.info(
              "Transaction information:",
              await this.middlewareInstance.liquidateBorrow(
                account.address,
                account.borrowMarket,
                parsedAmountToLiquidate
              )
            );
          } else
            this.logger.info(
              "Account: " +
                account.address +
                " isn't applicable to be liquidated | Amount to liquidate: " +
                amountToLiquidate
            );
        } catch (err) {
          this.logger.error(
            "Can't liquidate account: " +
              account.address +
              " | Amount to liquidate: " +
              amountToLiquidate,
            "Error log: ",
            err
          );
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.mongoInstance.closeConnection();
    }
  }
}

module.exports = Liquidator;
