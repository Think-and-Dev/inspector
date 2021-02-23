const Mongo = require("../Mongo");

class Liquidator {
  constructor() {
    this.mongoInstance = new Mongo();
    this.liquidatorAddress = "0xef558B499B7fDeB387c3a3A42E2d414815c64fac";
  }

  async liquidateAllAccounts() {}
}

module.exports = Liquidator;
